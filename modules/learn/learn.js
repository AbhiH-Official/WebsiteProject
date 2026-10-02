const checks = [...document.querySelectorAll("[data-roadmap-complete]")];
const progress = document.getElementById("roadmapProgress");
const progressBar = document.getElementById("roadmapProgressBar");
const progressText = document.getElementById("roadmapProgressText");
const storageKey = "infoverse-ba-roadmap-progress-v1";

function refreshProgress() {
  const count = checks.filter((check) => check.checked).length;
  progress.setAttribute("aria-valuenow", String(count));
  progressBar.style.width = `${count / checks.length * 100}%`;
  progressText.textContent = `${count} / ${checks.length} stages complete`;
}

try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
  checks.forEach((check) => { check.checked = saved.includes(check.dataset.roadmapComplete); });
} catch {
  // The roadmap remains usable if this browser blocks local storage.
}

checks.forEach((check) => {
  check.addEventListener("change", () => {
    try {
      const complete = checks.filter((item) => item.checked).map((item) => item.dataset.roadmapComplete);
      localStorage.setItem(storageKey, JSON.stringify(complete));
    } catch {
      // Keep changes for this visit if persistent storage is unavailable.
    }
    refreshProgress();
  });
});

refreshProgress();
