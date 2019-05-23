(function () {
  function toggleOthers() {
    /**@type HTMLDivElement*/ const element = document.querySelector('div[aria-label*="video on the main screen"]').parentElement;
    if (element.style.display === "none") {
      element.style.display = "block";
    } else {
      element.style.display = "none";
    }
  }
  toggleOthers();
})();
