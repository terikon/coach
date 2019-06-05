(function () {

  if (!window.studentMuteHandler) {
    window.studentMuteHandler = function () {

      setInterval(() => {

        const studentMute = window.studentMute;

        /**@type HTMLDivElement*/ const muteButton = document.querySelector('div[aria-label*="Mute microphone"]');
        /**@type HTMLDivElement*/ const unmuteButton = document.querySelector('div[aria-label*="Unmute microphone"]');

        if (studentMute === true) {

          if (muteButton) {
            muteButton.click();
          }
          else if (!unmuteButton) {
            console.log('Could not mute hangouts');
          }

        } else if (studentMute === false) {

          if (unmuteButton) {
            unmuteButton.click();
          }
          else if (!muteButton) {
            console.log('Could not unmute hangouts');
          }
        }

        if (muteButton || unmuteButton) {
          delete(window.studentMute);
        }


      }, 20);

    };
    window.studentMuteHandler();
  }
})();
