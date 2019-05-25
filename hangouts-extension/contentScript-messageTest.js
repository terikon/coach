//setInterval(() => {
  // chrome.runtime.sendMessage({ greeting: "hello from content script" }, response => {
  //   console.log(`Content script received response: ${JSON.stringify(response)}`);
  // });
//}, 2000);

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   console.log(`Content script received ${sender.tab ?
//     "from a content script:" + sender.tab.url :
//     "from the extension"} message ${JSON.stringify(request)}`);
//   sendResponse({ farewell: "response" });
// });


// const port = chrome.runtime.connect({ name: 'myConnection' });
// port.onMessage.addListener(msg => {
//   console.log(`contentScript got message ${JSON.stringify(msg)}`);
// });
// console.log('contentScript posts message');
// port.postMessage({ message: 'contentScript sending a message' });

const port = chrome.runtime.connect({ name: 'myConnection' });
port.onMessage.addListener(msg => {
  console.log(`content script got message ${JSON.stringify(msg)}`);
});
console.log('content script posts message');
port.postMessage({ message: 'content script sending a message' });
