
const stats = JSON.parse(localStorage.getItem("knowlyStats")) || {
  notes: 0,
  quizzes: 0,
  research: 0
};

function saveStats() {
  localStorage.setItem("knowlyStats", JSON.stringify(stats));
  updateStats();
}

function updateStats() {
  document.getElementById("notesCount").textContent = stats.notes;
  document.getElementById("quizCount").textContent = stats.quizzes;
  document.getElementById("researchCount").textContent = stats.research;

  document.getElementById("analyticsOutput").innerHTML =
    `<p>Notes created: ${stats.notes}</p>
     <p>Quizzes completed: ${stats.quizzes}</p>
     <p>Research searches: ${stats.research}</p>`;
}

function startLearning() {
  document.getElementById("notes").scrollIntoView({
    behavior: "smooth"
  });
}

function generateNotes() {
  const input = document.getElementById("notesInput").value.trim();
  const output = document.getElementById("notesOutput");

  if (!input) {
    output.textContent = "Please paste your lesson text first.";
    return;
  }

  const sentences = input.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [input];
  const notes = sentences
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length > 0)
    .slice(0, 8);

  output.innerHTML = "<h3>Your Quick Notes</h3>" +
    notes.map(note => `<p>• ${escapeHTML(note)}</p>`).join("");

  stats.notes++;
  saveStats();
}

function generateQuiz() {
  const topic = document.getElementById("quizTopic").value.trim();
  const output = document.getElementById("quizOutput");

  if (!topic) {
    output.textContent = "Please enter a topic.";
    return;
  }

  const question = `Which statement best describes ${topic}?`;

  output.innerHTML = `
    <h3>Practice Question</h3>
    <p>${escapeHTML(question)}</p>
    <label><input type="radio" name="answer" value="wrong"> It is unrelated to learning.</label>
    <label><input type="radio" name="answer" value="correct"> Learn its meaning and key concepts.</label>
    <label><input type="radio" name="answer" value="wrong"> It has no important concepts.</label>
    <br>
    <button onclick="checkQuiz()">Check Answer</button>
    <p id="quizResult"></p>
  `;
}

function checkQuiz() {
  const answer = document.querySelector('input[name="answer"]:checked');
  const result = document.getElementById("quizResult");

  if (!answer) {
    result.textContent = "Choose an answer first.";
    return;
  }

  if (answer.value === "correct") {
    result.textContent = "Correct! Well done.";
  } else {
    result.textContent = "Not quite. Try again!";
  }

  stats.quizzes++;
  saveStats();
}

async function searchResearch() {
  const topic = document.getElementById("researchInput").value.trim();
  const output = document.getElementById("researchOutput");

  if (!topic) {
    output.textContent = "Please enter a topic.";
    return;
  }

  output.textContent = "Searching for information...";

  stats.research++;
  saveStats();

  try {
    const url = "https://en.wikipedia.org/api/rest_v1/page/summary/" +
      encodeURIComponent(topic);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("No summary found");
    }

    const data = await response.json();

    output.innerHTML = `
      <h3>${escapeHTML(data.title || topic)}</h3>
      <p>${escapeHTML(data.extract || "No summary available.")}</p>
      <p><a href="${safeURL(data.content_urls?.desktop?.page)}" target="_blank" rel="noopener">Read more</a></p>
    `;
  } catch (error) {
    output.innerHTML = `
      <p>Couldn't load a summary right now.</p>
      <a href="https://www.google.com/search?q=${encodeURIComponent(topic)}" target="_blank" rel="noopener">Search this topic on Google</a>
    `;
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function safeURL(url) {
  if (typeof url === "string" && url.startsWith("https://")) {
    return escapeHTML(url);
  }
  return "https://en.wikipedia.org/";
}

updateStats();
