(function () {

  /**@type HTMLDivElement*/ const unmuteButton = document.querySelector('div[aria-label*="Unmute microphone"]');

  if (unmuteButton) {
    unmuteButton.click();
  }
  else {
    console.log('Could not unmute hangouts');
  }

})();
