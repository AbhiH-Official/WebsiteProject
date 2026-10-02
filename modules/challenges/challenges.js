const missionChecks = [...document.querySelectorAll("[data-mission]")];
const missionProgress = document.getElementById("missionProgress");
const missionProgressBar = document.getElementById("missionProgressBar");
const missionProgressText = document.getElementById("missionProgressText");
const missionStorageKey = "infoverse-field-mission-briefs-v1";

function updateMissionProgress() {
  const count = missionChecks.filter((check) => check.checked).length;
  missionProgress.setAttribute("aria-valuenow", String(count));
  missionProgressBar.style.width = `${count / missionChecks.length * 100}%`;
  missionProgressText.textContent = `${count} / ${missionChecks.length} briefs reviewed`;
}

try {
  const saved = JSON.parse(localStorage.getItem(missionStorageKey) || "[]");
  missionChecks.forEach((check) => { check.checked = saved.includes(check.dataset.mission); });
} catch {
  // Missions remain usable if this browser blocks local storage.
}

missionChecks.forEach((check) => {
  check.addEventListener("change", () => {
    try {
      const reviewed = missionChecks.filter((item) => item.checked).map((item) => item.dataset.mission);
      localStorage.setItem(missionStorageKey, JSON.stringify(reviewed));
    } catch {
      // Keep changes for this visit if persistent storage is unavailable.
    }
    updateMissionProgress();
  });
});

updateMissionProgress();
