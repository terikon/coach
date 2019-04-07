(function () {
  function removeSelfCamera() {
    document.querySelector('div[aria-label*="video on the main screen"]').parentElement.remove();
  }
  removeSelfCamera();
})();
