chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set({
    color: '#3aa757'
  }, function () {
      console.log('The color is green.');
    });

  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {
          urlMatches: 'hangouts.google.com/call'
        },
      })],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

// setInterval(() => {
//   console.log('background script sent message');
//   chrome.runtime.sendMessage({ greeting: "Hello from background script" }, response => {
//     console.log(`background script received response: ${JSON.stringify(response)}`);
//   });
// }, 2000);

chrome.runtime.onConnect.addListener(port => {
  console.assert(port.name === 'myConnection');
  port.onMessage.addListener(msg => {
    console.log(`background script got message ${JSON.stringify(msg)}`);
    port.postMessage({ message: 'answer from background script' });
  });
});
