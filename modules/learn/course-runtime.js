(function () {
  const course = window.INFO_COURSE;
  const nodesRoot = document.getElementById("roadmapNodes");
  const panel = document.getElementById("lessonPanel");
  const progressText = document.getElementById("progressText");
  const progressBar = document.getElementById("progressBar");
  const progressTrack = progressBar.parentElement;
  const previous = document.getElementById("previousNode");
  const next = document.getElementById("nextNode");
  const position = document.getElementById("nodePosition");
  const key = "infoverse-course-" + course.id + "-v1";
  let completed = new Set();
  let selected = -1;

  document.title = course.title + " | Infoverse";
  document.getElementById("courseEyebrow").textContent = course.number + " / " + course.category;
  document.getElementById("courseTitle").textContent = course.title;
  document.getElementById("courseIntro").textContent = course.intro;

  try {
    completed = new Set(JSON.parse(localStorage.getItem(key) || "[]"));
  } catch (error) {
    completed = new Set();
  }

  function updateProgress() {
    const count = completed.size;
    progressText.textContent = count + " / " + course.nodes.length + " stages complete";
    progressBar.style.width = (count / course.nodes.length * 100) + "%";
    progressTrack.setAttribute("aria-valuemax", String(course.nodes.length));
    progressTrack.setAttribute("aria-valuenow", String(count));
  }

  function renderRoadmap() {
    nodesRoot.replaceChildren();
    course.nodes.forEach(function (node, index) {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "roadmap-node";
      button.setAttribute("aria-pressed", String(completed.has(String(index))));
      if (index === selected) {
        button.setAttribute("aria-current", "step");
      }
      button.setAttribute("aria-label", "Stage " + String(index + 1).padStart(2, "0") + ": " + node.title + (completed.has(String(index)) ? ", complete" : ""));
      const number = document.createElement("span");
      number.className = "node-number";
      number.textContent = String(index + 1).padStart(2, "0");
      const copy = document.createElement("span");
      copy.className = "node-copy";
      const title = document.createElement("strong");
      title.textContent = node.title;
      const phase = document.createElement("small");
      phase.textContent = node.phase;
      copy.append(title, phase);
      const state = document.createElement("span");
      state.className = "node-state";
      state.textContent = completed.has(String(index)) ? "✓" : "↗";
      button.append(number, copy, state);
      button.addEventListener("click", function () { selectNode(index); });
      item.append(button);
      nodesRoot.append(item);
    });
  }

  function section(title, text, className) {
    const sectionNode = document.createElement("section");
    sectionNode.className = "lesson-section" + (className ? " " + className : "");
    const heading = document.createElement("h3");
    heading.textContent = title;
    const body = document.createElement("p");
    body.textContent = text;
    sectionNode.append(heading, body);
    return sectionNode;
  }

  function selectNode(index) {
    selected = index;
    const node = course.nodes[index];
    panel.replaceChildren();
    const kicker = document.createElement("div");
    kicker.className = "lesson-kicker";
    kicker.textContent = "STAGE " + String(index + 1).padStart(2, "0") + " / " + node.phase.toUpperCase();
    const title = document.createElement("h2");
    title.className = "lesson-title";
    title.textContent = node.title;
    const lead = document.createElement("p");
    lead.className = "lesson-lead";
    lead.textContent = node.lead;
    panel.append(kicker, title, lead, section("The concept", node.definition), section("How to use it", node.explanation));

    const flow = document.createElement("section");
    flow.className = "lesson-section";
    const flowHeading = document.createElement("h3");
    flowHeading.textContent = "Visual model";
    const flowRow = document.createElement("div");
    flowRow.className = "lesson-flow";
    node.flow.forEach(function (label, flowIndex) {
      const step = document.createElement("span");
      step.textContent = label;
      flowRow.append(step);
      if (flowIndex < node.flow.length - 1) {
        const arrow = document.createElement("b");
        arrow.setAttribute("aria-hidden", "true");
        arrow.textContent = "→";
        flowRow.append(arrow);
      }
    });
    flow.append(flowHeading, flowRow);
    panel.append(flow);

    const example = document.createElement("section");
    example.className = "lesson-section";
    const exampleHeading = document.createElement("h3");
    exampleHeading.textContent = node.exampleTitle || "Worked example";
    const code = document.createElement("pre");
    code.className = "lesson-example";
    code.textContent = node.example;
    example.append(exampleHeading, code);
    panel.append(example, section("Practice", node.practice, "practice-box"));

    const label = document.createElement("label");
    label.className = "complete-lesson";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = completed.has(String(index));
    checkbox.addEventListener("change", function () {
      if (checkbox.checked) completed.add(String(index));
      else completed.delete(String(index));
      try { localStorage.setItem(key, JSON.stringify(Array.from(completed))); } catch (error) { /* usable for this visit */ }
      updateProgress();
      renderRoadmap();
    });
    const labelText = document.createElement("span");
    labelText.textContent = "Mark this stage complete";
    label.append(checkbox, labelText);
    panel.append(label);

    position.textContent = String(index + 1) + " / " + course.nodes.length;
    previous.setAttribute("aria-disabled", index === 0 ? "true" : "false");
    next.setAttribute("aria-disabled", index === course.nodes.length - 1 ? "true" : "false");
    renderRoadmap();
    if (window.matchMedia("(max-width: 760px)").matches) {
      window.requestAnimationFrame(function () { panel.scrollIntoView({ behavior: "smooth", block: "start" }); });
    }
  }

  previous.addEventListener("click", function (event) { event.preventDefault(); if (selected > 0) selectNode(selected - 1); });
  next.addEventListener("click", function (event) { event.preventDefault(); if (selected < course.nodes.length - 1) selectNode(selected + 1); });
  updateProgress();
  renderRoadmap();
})();



