(function () {

/**@type HTMLDivElement*/ const muteButton = document.querySelector('div[aria-label*="Mute microphone"]');

  if (muteButton) {
    muteButton.click();
  }
  else {
    console.log('Could not mute hangouts');
  }

})();
