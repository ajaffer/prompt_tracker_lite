document.getElementById("promptForm").addEventListener("submit", function (e) {
    e.preventDefault();
    savePrompt();
});

async function savePrompt() {
    const prompt = document.getElementById("promptText").value;
    const model = document.getElementById("modelSelect").value;
    const temperature = document.getElementById("temperature").value;

    if (!prompt) {
        alert("Prompt cannot be empty.");
        return;
    }

    try {
        const response = await fetch("/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, model, temperature })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Server responded with:", errorText);
            throw new Error("Save failed");
        }

        const data = await response.json();
        updateTable(data);

        document.getElementById("promptText").value = "";
    } catch (error) {
        console.error("Save failed:", error);
        alert("Failed to save prompt.");
    }
}



async function deletePrompt(id) {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
        const response = await fetch(`/delete/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Delete failed");
        }

        await fetchLogs();
    } catch (error) {
        console.error("Delete failed:", error);
        alert("Failed to delete entry.");
    }
}

function editPrompt(id) {
  const row = document.querySelector(`button[onclick="editPrompt(${id})"]`).closest("tr");
  const prompt = row.children[1].innerText.replace("...", ""); // full prompt assumed
  const model = row.children[2].innerText;
  const temperature = row.children[3].innerText;

  document.getElementById("editId").value = id;
  document.getElementById("editPromptText").value = prompt;
  document.getElementById("editModelSelect").value = model;
  document.getElementById("editTemperature").value = temperature;

  document.getElementById("editModal").style.display = "block";
}

function closeModal() {
  document.getElementById("editModal").style.display = "none";
}

async function submitEdit() {
  const id = document.getElementById("editId").value;
  const prompt = document.getElementById("editPromptText").value;
  const model = document.getElementById("editModelSelect").value;
  const temperature = document.getElementById("editTemperature").value;

  if (!prompt || !model || !temperature) {
    alert("All fields are required.");
    return;
  }

  try {
    const response = await fetch(`/update/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, model, temperature })
    });

    if (!response.ok) throw new Error("Edit failed");

    await fetchLogs();
    closeModal();
  } catch (error) {
    console.error("Edit failed:", error);
    alert("Failed to edit entry.");
  }
}


async function fetchLogs() {
    const res = await fetch("/logs/json");
    const data = await res.json();
    updateTable(data);
}

function updateTable(data) {
    const tbody = document.getElementById("promptLog");
    if (!tbody) {
        console.error("No element with ID 'promptLog' found.");
        return;
    }
    tbody.innerHTML = "";
    data.forEach(entry => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${entry.id}</td>
            <td>${entry.prompt.slice(0, 30)}...</td>
            <td>${entry.model}</td>
            <td>${entry.temperature}</td>
            <td>${timeAgo(entry.timestamp)}</td>
            <td>
                <button onclick="editPrompt(${entry.id})">Edit</button>
                <button onclick="deletePrompt(${entry.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}