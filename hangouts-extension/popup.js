/**@type HTMLButtonElement*/ const buttonChangeColor = document.getElementById('buttonChangeColor');
/**@type HTMLButtonElement*/ const buttonToggleMute = document.getElementById('buttonToggleMute');
/**@type HTMLButtonElement*/ const buttonMessageTest = document.getElementById('buttonMessageTest');
/**@type HTMLSelectElement*/ const selectTitle = document.getElementById('selectTitle');

chrome.storage.sync.get('color', function (data) {
  buttonChangeColor.style.backgroundColor = data.color;
  buttonChangeColor.setAttribute('value', data.color);
  buttonChangeColor.onclick = function (element) {
    let color = element.target.value;
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function (tabs) {
      chrome.tabs.executeScript(
        tabs[0].id, {
          //code: 'document.body.style.backgroundColor = "' + color + '";'
          file: 'contentScript-toggleOthers.js'
        });
    });
  };
});

buttonToggleMute.addEventListener('click', () => {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    chrome.tabs.executeScript(
      tabs[0].id, {
        file: 'contentScript-toggleMute.js'
      });
  });
});

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   console.log(`popup script received ${sender.tab ?
//     "from a content script:" + sender.tab.url :
//     "from the extension"} message ${JSON.stringify(request)}`);
//   sendResponse({ farewell: "response" });
// });

buttonMessageTest.addEventListener('click', () => {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    // attach content script
    chrome.tabs.executeScript(
      tabs[0].id, {
        file: 'contentScript-messageTest.js'
      });
    // send messages to it
    // setInterval(() => {
    //   console.log('popup sent message');
    //   chrome.tabs.sendMessage(tabs[0].id, { greeting: "Hello from popup" }, response => {
    //     console.log(`popup received response: ${JSON.stringify(response)}`);
    //   });
    // }, 2000);


  });
});

selectTitle.addEventListener('change', function () {
  let selected = this.value;
  let title = 'Hangouts Video Call';
  if (selected > 0) {
    title = `Student - ${selected}`;
  }
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    chrome.tabs.executeScript(
      tabs[0].id, {
        code: `document.title = '${title}';`
      });
  });
});
