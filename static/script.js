
document.getElementById("promptForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    const prompt = document.getElementById("promptText").value;
    const model = document.getElementById("modelSelect").value;
    const temperature = document.getElementById("temperature").value;

    const response = await fetch("/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, model, temperature })
    });
    const data = await response.json();
    updateTable(data);
});

function updateTable(data) {
    const tbody = document.getElementById("promptLog");
    tbody.innerHTML = "";
    data.forEach(entry => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${entry.id}</td><td>${entry.prompt.slice(0, 30)}...</td><td>${entry.model}</td><td>${entry.temperature}</td><td>${entry.timestamp}</td>`;
        tbody.appendChild(row);
    });
}
