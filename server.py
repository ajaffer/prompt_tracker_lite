
from flask import Flask, render_template, request, jsonify
from datetime import datetime
import uuid


from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///prompt_logs.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class PromptLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    model = db.Column(db.String(100))
    prompt = db.Column(db.Text)
    latency = db.Column(db.Float)
    temperature = db.Column(db.Float)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "model": self.model,
            "prompt": self.prompt,
            "latency": self.latency,
            "temperature": self.temperature,
            "timestamp": self.timestamp.isoformat() + "Z"  # explicitly mark as UTC
        }

with app.app_context():
    db.create_all()


prompt_history = []

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/save", methods=["POST"])
def save_prompt():
    data = request.get_json()
    new_entry = PromptLog(
        prompt=data["prompt"],
        model=data["model"],
        temperature=data["temperature"]
    )
    db.session.add(new_entry)
    db.session.commit()

    all_entries = PromptLog.query.order_by(PromptLog.timestamp.desc()).all()
    return jsonify([entry.to_dict() for entry in all_entries])


@app.route('/update/<int:id>', methods=['POST'])
def update_prompt(id):
    data = request.get_json()
    entry = PromptLog.query.get_or_404(id)

    entry.prompt = data.get("prompt", entry.prompt)
    entry.model = data.get("model", entry.model)
    entry.temperature = data.get("temperature", entry.temperature)
    db.session.commit()

    return jsonify(entry.to_dict())

@app.route('/delete/<int:item_id>', methods=['DELETE'])
def delete_log(item_id):
    log = db.session.get(PromptLog, item_id)
    if log:
        db.session.delete(log)
        db.session.commit()
        return '', 204
    else:
        return 'Not Found', 404


# @app.route('/logs')
# def view_logs():
#     logs = PromptLog.query.order_by(PromptLog.timestamp.desc()).all()
#     return render_template("logs.html", logs=logs)

@app.route('/logs/json')
def logs_json():
    logs = PromptLog.query.order_by(PromptLog.timestamp.desc()).all()
    return jsonify([entry.to_dict() for entry in logs])

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
