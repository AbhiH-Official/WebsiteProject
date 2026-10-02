const intro = document.getElementById("intro");
const enterButton = document.getElementById("enterButton");
const mainPage = document.getElementById("mainPage");
let entered = false;

function showModules() {
  if (entered) return;
  entered = true;
  if (intro.isConnected) intro.remove();
  mainPage.classList.add("visible");
  mainPage.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "auto";
}

if (new URLSearchParams(window.location.search).get("home") === "1") {
  showModules();
} else {
  enterButton.addEventListener("click", () => {
    if (entered) return;
    intro.classList.add("leaving");
    window.setTimeout(() => {
      mainPage.classList.add("visible");
      mainPage.setAttribute("aria-hidden", "false");
    }, 250);
    window.setTimeout(showModules, 900);
  });
}
