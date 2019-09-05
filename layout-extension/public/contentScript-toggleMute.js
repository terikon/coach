function toggleMute() {
  /**@type HTMLDivElement*/ const muteButton = document.querySelector('div[aria-label*="mute microphone" i]'); // Mute microphone / Unmute microphone

  muteButton.click();
}

toggleMute();
