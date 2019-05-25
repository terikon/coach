const port = chrome.runtime.connect({ name: 'myConnection' });

port.onMessage.addListener(msg => {
  console.log(`content script got message ${JSON.stringify(msg)}`);
});

console.log('content script posts message');
setInterval(() => {
  port.postMessage({ message: `content script sending a message from ${window.document.location.href}` });
}, 2000);
