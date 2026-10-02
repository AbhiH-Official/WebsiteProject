const gameCatalog = document.getElementById("gameCatalog");
const gamePanel = document.getElementById("gamePanel");

const salesTable = [
  ["North", 18],
  ["East", 27],
  ["South", 21],
  ["West", 34],
  ["Central", 25],
];

const games = {
  pattern: {
    title: "Pattern Sprint",
    mode: "sprint",
    duration: 45,
    readyTitle: "Catch the signal.",
    description: "You have 45 seconds to solve as many number patterns as you can. Each correct answer adds one point. Stay sharp—the patterns keep coming.",
    questions: [
      { sequence: [3, 6, 9, 12, "?"], prompt: "What number completes the sequence?", choices: [15, 16, 18, 21], answer: 0, explain: "The sequence increases by 3 each time." },
      { sequence: [2, 4, 8, 16, "?"], prompt: "What number completes the sequence?", choices: [24, 30, 32, 34], answer: 2, explain: "Each number doubles: 2 × 2 = 4, then 8, 16 and 32." },
      { sequence: [1, 4, 9, 16, "?"], prompt: "What number completes the sequence?", choices: [20, 24, 25, 36], answer: 2, explain: "These are square numbers: 1², 2², 3², 4², then 5²." },
      { sequence: [30, 27, 23, 18, "?"], prompt: "What number completes the sequence?", choices: [10, 11, 12, 13], answer: 1, explain: "The steps subtract 3, 4, 5, then 6." },
      { sequence: [5, 8, 14, 23, "?"], prompt: "What number completes the sequence?", choices: [32, 34, 35, 37], answer: 2, explain: "The gaps grow by 3: +3, +6, +9, then +12." },
      { sequence: [64, 32, 16, 8, "?"], prompt: "What number completes the sequence?", choices: [2, 3, 4, 6], answer: 2, explain: "Each term is half the one before it." },
      { sequence: [4, 7, 13, 25, "?"], prompt: "What number completes the sequence?", choices: [37, 45, 47, 49], answer: 2, explain: "The gaps double: +3, +6, +12, then +24." },
      { sequence: [2, 5, 10, 17, "?"], prompt: "What number completes the sequence?", choices: [24, 25, 26, 28], answer: 2, explain: "Add consecutive odd numbers: +3, +5, +7, then +9." },
    ],
  },
  logic: {
    title: "Logic Lab",
    mode: "rounds",
    readyTitle: "Think it through.",
    description: "Five short puzzles. Read each clue carefully, choose the answer you can prove, and see how many you can crack.",
    questions: [
      { prompt: "A, C, F, J, O, ? — which letter comes next?", choices: ["T", "U", "V", "W"], answer: 1, explain: "The gaps move forward by one letter each time: +2, +3, +4, +5, then +6. That lands on U." },
      { prompt: "All Zorbs are Mips. No Mips are blue. What must be true?", choices: ["Some Zorbs are blue", "No Zorbs are blue", "All blue things are Zorbs", "No Mips are Zorbs"], answer: 1, explain: "Every Zorb is a Mip, and no Mip is blue. So no Zorb can be blue." },
      { prompt: "A code moves every letter one step forward: LAMP becomes MBNQ. What does FISH become?", choices: ["GJTI", "EHRG", "GJSH", "GITH"], answer: 0, explain: "Move each letter forward once: F→G, I→J, S→T and H→I." },
      { prompt: "Kai is older than Lina. Lina is older than Noor. Who is the youngest?", choices: ["Kai", "Lina", "Noor", "There is not enough information"], answer: 2, explain: "The order is Kai > Lina > Noor, so Noor is the youngest." },
      { prompt: "A drawer has red socks and blue socks mixed together. In the dark, how many socks guarantee a matching pair?", choices: ["2", "3", "4", "It depends on the number of socks"], answer: 1, explain: "With two colors, the first two could differ. The third must match one of them." },
    ],
  },
  data: {
    title: "Data Detective",
    mode: "rounds",
    readyTitle: "Follow the numbers.",
    description: "Inspect the weekly regional sales snapshot and answer five questions. Look for the evidence before you make your call.",
    table: salesTable,
    questions: [
      { prompt: "Which region recorded the highest sales?", choices: ["East", "South", "West", "Central"], answer: 2, explain: "West leads with 34 sales, the largest value in the table." },
      { prompt: "How many sales were recorded across all regions?", choices: ["115", "120", "125", "130"], answer: 2, explain: "18 + 27 + 21 + 34 + 25 = 125 total sales." },
      { prompt: "How many more sales did West record than North?", choices: ["14", "16", "18", "20"], answer: 1, explain: "West recorded 34 and North 18. The difference is 34 − 18 = 16." },
      { prompt: "What was the average number of sales per region?", choices: ["21", "23", "25", "27"], answer: 2, explain: "The total is 125 across five regions, so the average is 125 ÷ 5 = 25." },
      { prompt: "Which region had the second-highest sales?", choices: ["East", "South", "Central", "North"], answer: 0, explain: "West is first at 34. East is next at 27." },
    ],
  },
};

let run = null;
let sprintClock = null;

function stopSprintClock() {
  if (sprintClock !== null) {
    window.clearInterval(sprintClock);
    sprintClock = null;
  }
}

function consoleTop(status = "SYSTEM READY") {
  return `<div class="game-console-top">
    <button class="game-back" type="button" data-game-action="catalog">← ARCADE</button>
    <span class="game-status">${status}</span>
  </div>`;
}

function openGame(key) {
  const game = games[key];
  if (!game) return;

  stopSprintClock();
  run = { key, game, score: 0, answered: 0, round: 0, question: null, locked: false, secondsLeft: game.duration ?? 0 };
  gameCatalog.hidden = true;
  gamePanel.hidden = false;
  renderReady();
  gamePanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderReady() {
  gamePanel.innerHTML = `<div class="game-console">
    ${consoleTop()}
    <div class="game-ready">
      <p class="game-eyebrow">INFOVERSE ARCADE / ${run.game.mode === "sprint" ? "TIMED RUN" : `${run.game.questions.length} ROUND RUN`}</p>
      <h4>${run.game.readyTitle}</h4>
      <p>${run.game.description}</p>
      <button class="game-action" type="button" data-game-action="start">${run.game.mode === "sprint" ? "START 45 SECOND RUN →" : "START THE RUN →"}</button>
    </div>
  </div>`;
}

function startRun() {
  run.score = 0;
  run.answered = 0;
  run.round = 0;
  run.secondsLeft = run.game.duration ?? 0;
  stopSprintClock();

  if (run.game.mode === "sprint") {
    sprintClock = window.setInterval(() => {
      run.secondsLeft -= 1;
      const timer = gamePanel.querySelector("[data-timer]");
      const progress = gamePanel.querySelector("[data-progress]");
      if (timer) timer.textContent = `${run.secondsLeft}s`;
      if (progress) progress.style.width = `${Math.max(0, run.secondsLeft / run.game.duration * 100)}%`;
      if (run.secondsLeft <= 0) finishRun();
    }, 1000);
  }
  renderQuestion();
}

function renderQuestion() {
  if (run.game.mode === "rounds" && run.round >= run.game.questions.length) {
    finishRun();
    return;
  }

  run.locked = false;
  if (run.game.mode === "sprint") {
    let next = run.game.questions[Math.floor(Math.random() * run.game.questions.length)];
    if (run.question && run.game.questions.length > 1) {
      while (next === run.question) next = run.game.questions[Math.floor(Math.random() * run.game.questions.length)];
    }
    run.question = next;
  } else {
    run.question = run.game.questions[run.round];
  }

  const q = run.question;
  const roundText = run.game.mode === "sprint" ? `SIGNAL ${String(run.answered + 1).padStart(2, "0")}` : `ROUND ${String(run.round + 1).padStart(2, "0")} / ${run.game.questions.length}`;
  const progressPercent = run.game.mode === "sprint" ? Math.max(0, run.secondsLeft / run.game.duration * 100) : run.round / run.game.questions.length * 100;
  const sequence = q.sequence ? `<div class="game-sequence" aria-label="${q.sequence.join(", ")}">${q.sequence.map((value) => `<span>${value}</span>`).join("")}</div>` : "";
  const table = run.game.table ? `<table class="game-data-table"><thead><tr><th>REGION</th><th>WEEKLY SALES</th></tr></thead><tbody>${run.game.table.map(([region, value]) => `<tr><td>${region}</td><td>${value}</td></tr>`).join("")}</tbody></table>` : "";
  const choices = q.choices.map((choice, index) => `<button class="game-choice" type="button" data-choice="${index}"><b>${String.fromCharCode(65 + index)}</b><span>${choice}</span></button>`).join("");
  const scoreLabel = run.game.mode === "sprint" ? "SCORE" : "POINTS";
  const secondStatLabel = run.game.mode === "sprint" ? "TIME" : "PROGRESS";
  const secondStat = run.game.mode === "sprint" ? `<strong data-timer>${run.secondsLeft}s</strong>` : `<strong>${run.round + 1}/${run.game.questions.length}</strong>`;

  gamePanel.innerHTML = `<div class="game-console">
    ${consoleTop("LIVE RUN")}
    <div class="game-heading">
      <div><h3>${run.game.title}</h3><p>${roundText} · Select the best answer</p></div>
      <div class="game-hud"><div class="game-stat"><small>${scoreLabel}</small><strong>${run.score}</strong></div><div class="game-stat"><small>${secondStatLabel}</small>${secondStat}</div></div>
    </div>
    <div class="game-progress"><span data-progress style="width:${progressPercent}%"></span></div>
    ${table}
    ${sequence}
    <div class="game-question">${q.prompt}</div>
    <div class="game-choice-grid">${choices}</div>
    <div class="game-feedback" data-feedback role="status" aria-live="polite"></div>
    <div class="game-console-actions"><span class="game-hint">${run.game.mode === "sprint" ? "The clock is running. Trust your read." : "Take a moment. Accuracy first."}</span><button class="game-action" type="button" data-game-action="continue" hidden>${run.round + 1 === run.game.questions.length && run.game.mode === "rounds" ? "VIEW RESULTS →" : "NEXT →"}</button></div>
  </div>`;
}

function chooseAnswer(index) {
  if (!run || run.locked) return;
  run.locked = true;
  run.answered += 1;
  const q = run.question;
  const correct = index === q.answer;
  if (correct) run.score += 1;

  const options = [...gamePanel.querySelectorAll("[data-choice]")];
  options.forEach((button, optionIndex) => {
    button.disabled = true;
    if (optionIndex === q.answer) button.classList.add("is-correct");
    else if (optionIndex === index) button.classList.add("is-wrong");
  });

  const score = gamePanel.querySelector(".game-stat strong");
  if (score) score.textContent = run.score;
  const feedback = gamePanel.querySelector("[data-feedback]");
  feedback.className = `game-feedback ${correct ? "is-right" : "is-wrong"}`;
  feedback.textContent = `${correct ? "SIGNAL CONFIRMED" : "NOT QUITE"} — ${q.explain}`;
  const nextButton = gamePanel.querySelector('[data-game-action="continue"]');
  nextButton.hidden = false;
  nextButton.focus();
}

function finishRun() {
  if (!run) return;
  stopSprintClock();
  run.locked = true;
  const accuracy = run.answered ? Math.round(run.score / run.answered * 100) : 0;
  const rank = accuracy >= 85 ? "SIGNAL MASTER" : accuracy >= 60 ? "PATTERN SCOUT" : "ROOKIE ANALYST";
  const total = run.game.mode === "sprint" ? `${run.answered} signals scanned · ${accuracy}% accuracy` : `${run.score} of ${run.game.questions.length} correct · ${accuracy}% accuracy`;

  gamePanel.innerHTML = `<div class="game-console">
    ${consoleTop("RUN COMPLETE")}
    <div class="game-result">
      <p class="game-eyebrow">${rank}</p>
      <h4>${run.game.mode === "sprint" ? "Time's up." : "Run complete."}</h4>
      <div class="game-result-score">${run.score}<span> PTS</span></div>
      <p>${total}</p>
      <div class="game-result-actions"><button class="game-action" type="button" data-game-action="restart">RUN IT AGAIN ↻</button><button class="game-action" type="button" data-game-action="catalog">BACK TO ARCADE</button></div>
    </div>
  </div>`;
}

function closeGame() {
  stopSprintClock();
  run = null;
  gamePanel.hidden = true;
  gameCatalog.hidden = false;
  gameCatalog.scrollIntoView({ behavior: "smooth", block: "start" });
}

gameCatalog.addEventListener("click", (event) => {
  const launchButton = event.target.closest("[data-launch-game]");
  if (launchButton) openGame(launchButton.dataset.launchGame);
});

gamePanel.addEventListener("click", (event) => {
  const choiceButton = event.target.closest("[data-choice]");
  if (choiceButton) {
    chooseAnswer(Number(choiceButton.dataset.choice));
    return;
  }

  const action = event.target.closest("[data-game-action]")?.dataset.gameAction;
  if (action === "catalog") closeGame();
  if (action === "start") startRun();
  if (action === "restart" && run) {
    run.score = 0;
    run.answered = 0;
    run.round = 0;
    renderReady();
  }
  if (action === "continue" && run) {
    if (run.game.mode === "rounds") run.round += 1;
    renderQuestion();
  }
});
