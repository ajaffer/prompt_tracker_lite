
from flask import Flask, render_template, request, jsonify
from datetime import datetime
import uuid

app = Flask(__name__)
prompt_history = []

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/save", methods=["POST"])
def save_prompt():
    data = request.get_json()
    entry = {
        "id": str(uuid.uuid4())[:8],
        "prompt": data["prompt"],
        "model": data["model"],
        "temperature": data["temperature"],
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    prompt_history.append(entry)
    return jsonify(prompt_history)

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
