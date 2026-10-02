const intro = document.getElementById("intro");
const enterButton = document.getElementById("enterButton");
const mainPage = document.getElementById("mainPage");
const moduleGrid = document.getElementById("home");
const moduleViews = [...document.querySelectorAll(".module-view")];

function showCurrentModule() {
  const requestedModule = window.location.hash.slice(1);
  const selectedView = moduleViews.find((view) => view.id === requestedModule);

  moduleGrid.hidden = Boolean(selectedView);
  moduleViews.forEach((view) => {
    view.hidden = view !== selectedView;
  });
}

mainPage.addEventListener("click", (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;

  const route = link.getAttribute("href").slice(1);
  if (route !== "home" && !moduleViews.some((view) => view.id === route)) return;

  event.preventDefault();
  if (window.location.hash !== `#${route}`) window.history.pushState(null, "", `#${route}`);
  showCurrentModule();
  mainPage.scrollTo({ top: 0, behavior: "smooth" });
});

window.addEventListener("hashchange", showCurrentModule);
window.addEventListener("popstate", () => {
  showCurrentModule();
  mainPage.scrollTop = 0;
});
showCurrentModule();

const roadmapCheckboxes = [...document.querySelectorAll("[data-roadmap-complete]")];
const roadmapProgress = document.getElementById("roadmapProgress");
const roadmapProgressBar = document.getElementById("roadmapProgressBar");
const roadmapProgressText = document.getElementById("roadmapProgressText");
const roadmapStorageKey = "infoverse-ba-roadmap-progress-v1";

function updateRoadmapProgress() {
  const complete = roadmapCheckboxes.filter((checkbox) => checkbox.checked).length;
  roadmapProgress.setAttribute("aria-valuenow", String(complete));
  roadmapProgressBar.style.width = `${complete / roadmapCheckboxes.length * 100}%`;
  roadmapProgressText.textContent = `${complete} / ${roadmapCheckboxes.length} stages complete`;
}

try {
  const savedRoadmapProgress = JSON.parse(window.localStorage.getItem(roadmapStorageKey) || "[]");
  roadmapCheckboxes.forEach((checkbox) => {
    checkbox.checked = savedRoadmapProgress.includes(checkbox.dataset.roadmapComplete);
  });
} catch {
  // Progress still works for this visit if browser storage is unavailable.
}

roadmapCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    try {
      const completed = roadmapCheckboxes
        .filter((item) => item.checked)
        .map((item) => item.dataset.roadmapComplete);
      window.localStorage.setItem(roadmapStorageKey, JSON.stringify(completed));
    } catch {
      // Keep the checkbox state for this visit when browser storage is unavailable.
    }
    updateRoadmapProgress();
  });
});
updateRoadmapProgress();

let hasEntered = false;

enterButton.addEventListener("click", () => {
  if (hasEntered) return;

  hasEntered = true;
  intro.classList.add("leaving");

  // Reveal the main page while the two logo halves travel outward.
  window.setTimeout(() => {
    mainPage.classList.add("visible");
    mainPage.setAttribute("aria-hidden", "false");
  }, 250);

  // Remove the intro after the split animation has finished.
  window.setTimeout(() => {
    intro.remove();
    document.body.style.overflow = "auto";
  }, 900);
});
