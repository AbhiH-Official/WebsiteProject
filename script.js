const intro = document.getElementById("intro");
const enterButton = document.getElementById("enterButton");
const mainPage = document.getElementById("mainPage");

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
