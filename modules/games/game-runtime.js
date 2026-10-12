(function () {
  const game = window.ARCADE_GAME;
  const setup = document.getElementById("setupPanel");
  const play = document.getElementById("playPanel");
  const heading = document.getElementById("arcadeGameTitle");
  const description = document.getElementById("arcadeGameDescription");
  const difficultyButtons = [...document.querySelectorAll("[data-preset]")];
  const customSettings = document.getElementById("customSettings");
  const summary = document.getElementById("settingsSummary");
  const startButton = document.getElementById("startSession");
  let selectedPreset = "easy";
  let run = null;

  const presets = {
    easy:{difficulty:"easy",count:10,seconds:60,label:"Easy"},
    medium:{difficulty:"medium",count:12,seconds:40,label:"Medium"},
    hard:{difficulty:"hard",count:15,seconds:25,label:"Hard"}
  };
  const difficultyNames = {easy:"Easy",medium:"Medium",hard:"Hard"};
  const countValues = {low:5,medium:10,high:15};
  const timeValues = {low:25,medium:40,high:60};

  document.title = game.title + " | Infoverse Arcade";
  document.getElementById("gameEyebrow").textContent = game.number + " / ARCADE MODULE";
  heading.textContent = game.title;
  description.textContent = game.description;

  function getSettings() {
    if (selectedPreset !== "custom") return presets[selectedPreset];
    const diffValue = document.getElementById("customDifficulty").value;
    const countValue = document.getElementById("customCount").value;
    const timeValue = document.getElementById("customTime").value;
    return {difficulty:diffValue,count:countValues[countValue],seconds:timeValues[timeValue],label:"Custom"};
  }

  function updateSummary() {
    const settings = getSettings();
    const share = 100 / settings.count;
    summary.innerHTML = "<strong>" + settings.label + " run</strong><span>" + settings.count + " questions · " + settings.seconds + " seconds each · " + difficultyNames[settings.difficulty] + " questions · " + share.toFixed(2) + " points per question maximum</span>";
  }

  difficultyButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      selectedPreset = button.dataset.preset;
      difficultyButtons.forEach(function (other) { other.setAttribute("aria-pressed", String(other === button)); });
      customSettings.hidden = selectedPreset !== "custom";
      updateSummary();
    });
  });
  customSettings.addEventListener("change", updateSummary);
  updateSummary();

  function shuffle(items) {
    const shuffled = items.slice();
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  function makeSession(settings) {
    const pool = game.questions[settings.difficulty] || [];
    const uniqueIds = new Set(pool.map(function (question) { return question.id; }));
    if (uniqueIds.size !== pool.length || pool.length < settings.count) {
      throw new Error("This question bank needs at least " + settings.count + " distinct questions.");
    }
    return shuffle(pool).slice(0, settings.count);
  }

  function beginSession() {
    const settings = getSettings();
    try {
      const questions = makeSession(settings);
      run = {settings:settings,questions:questions,index:0,score:0,correct:0,history:[],locked:false,timerId:null,deadline:0,startedAt:0};
      setup.hidden = true;
      play.hidden = false;
      renderQuestion();
    } catch (error) {
      summary.innerHTML = "<strong>Run unavailable</strong><span>" + error.message + "</span>";
    }
  }

  function buildTable(table) {
    if (!table) return "";
    return "<table class='question-data'><thead><tr>" + table.headers.map(function (header) { return "<th>" + header + "</th>"; }).join("") + "</tr></thead><tbody>" + table.rows.map(function (row) { return "<tr>" + row.map(function (cell) { return "<td>" + cell + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table>";
  }

  function renderQuestion() {
    if (!run || run.index >= run.questions.length) { finishSession(); return; }
    run.locked = false;
    const q = run.questions[run.index];
    const perQuestion = 100 / run.settings.count;
    const sequence = q.sequence ? "<div class='question-sequence' aria-label='" + q.sequence.join(", ") + "'>" + q.sequence.map(function (value) { return "<span>" + value + "</span>"; }).join("") + "</div>" : "";
    const choices = q.choices.map(function (choice, index) { return "<button class='answer-choice' type='button' data-answer='" + index + "'><b>" + String.fromCharCode(65 + index) + "</b><span>" + choice + "</span></button>"; }).join("");
    play.innerHTML = "<section class='game-round' aria-label='Question " + (run.index + 1) + "'>" +
      "<div class='round-top'><span class='round-label'>" + game.title.toUpperCase() + " / " + difficultyNames[run.settings.difficulty].toUpperCase() + "</span><div class='round-stats'><div class='round-stat'><small>SCORE / 100</small><strong data-score>" + run.score.toFixed(2) + "</strong></div><div class='round-stat'><small>QUESTION</small><strong>" + (run.index + 1) + "/" + run.settings.count + "</strong></div><div class='round-stat'><small>TIME</small><strong data-clock>" + run.settings.seconds + "s</strong></div></div></div>" +
      "<div class='question-progress'><span style='width:" + (run.index / run.settings.count * 100) + "%'></span></div><div class='timer-track' data-timer-track><span data-timer-bar></span></div>" +
      "<div class='question-content'><span class='question-topic'>UP TO " + perQuestion.toFixed(2) + " POINTS · CORRECTNESS + SPEED</span><p class='question-prompt'>" + q.prompt + "</p>" + sequence + buildTable(q.table) + "<div class='answer-grid'>" + choices + "</div></div>" +
      "<div class='round-feedback' data-feedback role='status' aria-live='polite'></div><div class='round-bottom'><span class='round-note'>A correct answer earns 60–100% of this question’s share based on time remaining. Incorrect or timed-out answers earn 0.</span><button class='primary-action' type='button' data-action='next' hidden>NEXT QUESTION →</button></div></section>";
    run.startedAt = Date.now();
    run.deadline = run.startedAt + run.settings.seconds * 1000;
    run.timerId = window.setInterval(updateTimer, 100);
    updateTimer();
  }

  function updateTimer() {
    if (!run || run.locked) return;
    const remaining = Math.max(0, run.deadline - Date.now());
    const seconds = Math.ceil(remaining / 1000);
    const clock = play.querySelector("[data-clock]");
    const bar = play.querySelector("[data-timer-bar]");
    const track = play.querySelector("[data-timer-track]");
    if (clock) clock.textContent = seconds + "s";
    if (bar) bar.style.width = (remaining / (run.settings.seconds * 1000) * 100) + "%";
    if (track) track.classList.toggle("is-urgent", remaining <= 10000);
    if (remaining <= 0) answerQuestion(null, true);
  }

  function answerQuestion(choiceIndex, timedOut) {
    if (!run || run.locked) return;
    run.locked = true;
    window.clearInterval(run.timerId);
    const q = run.questions[run.index];
    const elapsed = Math.min(run.settings.seconds, (Date.now() - run.startedAt) / 1000);
    const remainingRatio = Math.max(0, 1 - elapsed / run.settings.seconds);
    const correct = !timedOut && choiceIndex === q.answer;
    const share = 100 / run.settings.count;
    const points = correct ? share * (0.6 + 0.4 * remainingRatio) : 0;
    run.score = Math.min(100, run.score + points);
    if (correct) run.correct += 1;
    run.history.push({prompt:q.prompt,answer:q.choices[q.answer],correct:correct,points:points,seconds:elapsed,explain:q.explain});
    [...play.querySelectorAll("[data-answer]")].forEach(function (button) {
      const index = Number(button.dataset.answer);
      button.disabled = true;
      if (index === q.answer) button.classList.add("is-right");
      else if (index === choiceIndex) button.classList.add("is-wrong");
    });
    const score = play.querySelector("[data-score]");
    if (score) score.textContent = run.score.toFixed(2);
    const feedback = play.querySelector("[data-feedback]");
    feedback.className = "round-feedback " + (correct ? "is-right" : "is-wrong");
    feedback.textContent = (timedOut ? "TIME EXPIRED — " : correct ? "CORRECT · +" + points.toFixed(2) + " POINTS — " : "NOT QUITE · +0 POINTS — ") + q.explain;
    const nextButton = play.querySelector("[data-action='next']");
    nextButton.hidden = false;
    nextButton.textContent = run.index + 1 === run.questions.length ? "VIEW RESULTS →" : "NEXT QUESTION →";
    nextButton.focus();
  }

  function finishSession() {
    if (!run) return;
    const score = Math.min(100, Number(run.score.toFixed(2)));
    const accuracy = Math.round(run.correct / run.settings.count * 100);
    const avg = run.history.length ? run.history.reduce(function (sum, item) { return sum + item.seconds; }, 0) / run.history.length : 0;
    const rank = score >= 85 ? "SIGNAL MASTER" : score >= 65 ? "PATTERN SCOUT" : "ROOKIE ANALYST";
    const review = run.history.map(function (item, index) {
      return "<div class='review-item'><strong>" + String(index + 1).padStart(2, "0") + " · " + (item.correct ? "Correct" : "Review") + " · " + item.points.toFixed(2) + " pts</strong><br>" + item.prompt + "<br>Answer: " + item.answer + " — " + item.explain + "</div>";
    }).join("");
    play.innerHTML = "<section class='game-results'><p class='result-rank'>" + rank + "</p><h2 class='setup-title'>Session complete.</h2><div class='result-score'>" + score.toFixed(2) + "<span> / 100</span></div><p class='result-summary'>" + game.title + " · " + run.settings.label + " run</p><div class='result-breakdown'><span class='result-chip'><strong>" + run.correct + "/" + run.settings.count + "</strong> correct</span><span class='result-chip'><strong>" + accuracy + "%</strong> accuracy</span><span class='result-chip'><strong>" + avg.toFixed(1) + "s</strong> average answer time</span></div><details class='review-list'><summary>Review all " + run.history.length + " questions</summary>" + review + "</details><div class='game-controls'><button class='primary-action' type='button' data-action='setup'>NEW RUN ↻</button><a class='secondary-action' href='../index.html'>BACK TO ARCADE</a></div></section>";
  }

  startButton.addEventListener("click", beginSession);
  play.addEventListener("click", function (event) {
    const answer = event.target.closest("[data-answer]");
    if (answer) { answerQuestion(Number(answer.dataset.answer), false); return; }
    const action = event.target.closest("[data-action]")?.dataset.action;
    if (action === "next" && run) { run.index += 1; renderQuestion(); }
    if (action === "setup") { window.clearInterval(run && run.timerId); run = null; play.hidden = true; setup.hidden = false; }
  });
})();
