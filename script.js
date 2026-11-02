
// KNOWLY - Interactive Learning Platform

function startLearning() {
    alert("Welcome to KNOWLY! Let's start learning.");
}

console.log("KNOWLY initialized successfully!");

// KNOWLY Smart Notes Generator

function generateNotes() {

    const text = document.getElementById("studyText").value;
    const result = document.getElementById("notesResult");

    if (text.trim() === "") {
        result.innerHTML = "Please enter your study material first.";
        return;
    }

    const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];

    const notes = sentences
        .map(sentence => sentence.trim())
        .filter(sentence => sentence.length > 10)
        .slice(0, 5);

    if (notes.length === 0) {
        result.textContent = "Please enter more study material.";
        return;
    }

    result.innerHTML = "<h3>Your Smart Notes</h3>";

    notes.forEach(note => {
        const item = document.createElement("p");
        item.textContent = "• " + note;
        result.appendChild(item);
    });
}


