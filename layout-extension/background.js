chrome.extension.isAllowedFileSchemeAccess(allowed => {
  if (!allowed) {
    console.log("Please enable AllowedFileSchemeAccess for the extension in chrome://extensions");
  }
});

const client = io('http://viskin.dyndns.org:8080');
const socket = client.connect();

socket.emit('create or join', 'extensionRoom');

chrome.runtime.onInstalled.addListener(function () {

  chrome.browserAction.setTitle({ title: 'Styopa' });

  // Will only work if default_popup not set
  chrome.browserAction.onClicked.addListener(tab => {
    console.log('Clicked!');
  });

  const backgroundPage = chrome.extension.getBackgroundPage();
  //chrome.extension.getViews();
  //chrome.extension.getExtensionTabs();

  backgroundPage.backgroundPageExport();

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

// callable by chrome.extension.getBackgroundPage().backgroundPageExport();
function backgroundPageExport() {
  console.log('backgroundPageExport called');
}

// chrome.tabs.onCreated.addListener(tab => {
//   console.log(`tab ${tab.title} created`);
// });

// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   console.log(`tab ${tab} updated: ${JSON.stringify(changeInfo)}`);
// });

// chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
//   console.log(`tab ${tabId} removed: ${JSON.stringify(removeInfo)}`);
// });

// chrome.tabs.onMoved.addListener((tabId, moveInfo) => { // index moved
//   const tab = chrome.tabs.get(tabId, tab => {
//     console.log(`tab ${tab.name} moved: ${JSON.stringify(moveInfo)}`);
//   });
// });

// chrome.tabs.query({}, tabs => {
//   console.log(`all tabs: ${JSON.stringify(tabs)}`);
// });


// chrome.windows.getAll(windows => {
//   console.log(`all windows: ${JSON.stringify(windows)}`);
// });

// chrome.windows.onCreated.addListener(window => {
//   console.log(`window ${window.id} created`);

//   // chrome.windows.update(window.id, {
//   //   left: 400,
//   //   top: 400,
//   // }, _ => { });
// });

// chrome.windows.onRemoved.addListener(windowId => {
//   console.log(`window ${windowId} removed`);
// });
