// setInterval(() => {

//   // fire the event
//   document.dispatchEvent(new CustomEvent('myCustomEvent', { detail: { message: 'dispatchEvent from content script'} }));

// }, 2000);


// redirect background script's messages to player

const port = chrome.runtime.connect({ name: 'playerConnection' });

port.onMessage.addListener(msg => {
  document.dispatchEvent(new CustomEvent('myCustomEvent', { detail: msg }));
});
