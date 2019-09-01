const extensionId = window._extensionId;

console.log(`intercepting ${window.location}`);

//debugger;

window.open = function (url) {
  console.log(`open ${url}`);
  chrome.runtime.sendMessage(extensionId, { open: url }, response => {
    if (chrome.runtime.lastError) {
      console.log(`Could not connect to extension`);
    }
    console.log(`response: ${response}`);
    return;
  });
}
