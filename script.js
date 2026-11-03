
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
let flashcards = [];
let currentCard = 0;
let showingAnswer = false;

function createFlashcards() {
  const input = document.getElementById("flashcardInput").value.trim();
  const output = document.getElementById("flashcardOutput");

  if (!input) {
    output.textContent = "Enter some questions and answers first.";
    return;
  }

  flashcards = input.split("\n")
    .map(line => line.split("|"))
    .filter(parts => parts.length >= 2)
    .map(parts => ({
      question: parts[0].trim(),
      answer: parts.slice(1).join("|").trim()
    }))
    .filter(card => card.question && card.answer);

  if (!flashcards.length) {
    output.textContent = "Use this format: Question | Answer";
    return;
  }

  currentCard = 0;
  showingAnswer = false;
  showFlashcard();
}

function showFlashcard() {
  const card = flashcards[currentCard];
  const output = document.getElementById("flashcardOutput");

  output.innerHTML = `
    <h3>Card ${currentCard + 1} of ${flashcards.length}</h3>
    <p>${escapeHTML(showingAnswer ? card.answer : card.question)}</p>
    <button onclick="flipFlashcard()"> ${showingAnswer ? "Show Question" : "Show Answer"} </button>
    <button onclick="nextFlashcard()">Next Card →</button>
  `;
}

function flipFlashcard() {
  showingAnswer = !showingAnswer;
  showFlashcard();
}

function nextFlashcard() {
  currentCard = (currentCard + 1) % flashcards.length;
  showingAnswer = false;
  showFlashcard();
}
let timerSeconds = 25 * 60;
let timerInterval = null;

function updateTimerDisplay() {
  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;

  document.getElementById("timerDisplay").textContent =
    String(minutes).padStart(2, "0") + ":" +
    String(seconds).padStart(2, "0");
}

function startTimer() {
  if (timerInterval !== null) return;

  document.getElementById("timerMessage").textContent = "Stay focused!";

  timerInterval = setInterval(() => {
    if (timerSeconds > 0) {
      timerSeconds--;
      updateTimerDisplay();
    } else {
      clearInterval(timerInterval);
      timerInterval = null;
      document.getElementById("timerMessage").textContent =
        "Session complete! Great work!";
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  document.getElementById("timerMessage").textContent = "Timer paused.";
}

function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerSeconds = 25 * 60;
  updateTimerDisplay();
  document.getElementById("timerMessage").textContent = "Ready to focus?";
}

function setBreak() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerSeconds = 5 * 60;
  updateTimerDisplay();
  document.getElementById("timerMessage").textContent = "Break time!";
}

updateTimerDisplay();
