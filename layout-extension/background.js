console.log(`extension ID: ${chrome.runtime.id}`);

chrome.extension.isAllowedFileSchemeAccess(allowed => {
  if (!allowed) {
    console.log("Please enable AllowedFileSchemeAccess for the extension in chrome://extensions");
  }
});

const client = io('http://viskin.dyndns.org:8080');
const socket = client.connect();

socket.emit('create or join', 'extensionRoom');

chrome.runtime.onInstalled.addListener(function () {

  //chrome.browserAction.setTitle({ title: 'Styopa' });

  // Will only work if default_popup not set
  // chrome.browserAction.onClicked.addListener(tab => {
  //   console.log('Clicked!');
  // });

  //const backgroundPage = chrome.extension.getBackgroundPage();
  //chrome.extension.getViews();
  //chrome.extension.getExtensionTabs();

  //backgroundPage.backgroundPageExport();

  // chrome.storage.sync.set({
  //   color: '#3aa757'
  // }, function () {
  //   console.log('The color is green.');
  // });

  // chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
  //   chrome.declarativeContent.onPageChanged.addRules([{
  //     conditions: [new chrome.declarativeContent.PageStateMatcher({
  //       pageUrl: {
  //         urlMatches: 'hangouts.google.com/call'
  //       },
  //     })],
  //     actions: [new chrome.declarativeContent.ShowPageAction()]
  //   }]);
  // });

});

// callable by chrome.extension.getBackgroundPage().backgroundPageExport();
// function backgroundPageExport() {
//   console.log('backgroundPageExport called');
// }

// chrome.tabs.onCreated.addListener(tab => {
//   console.log(`tab ${tab.title} created`);
// });


function injectScript(/** @type chrome.tabs.Tab */tab, contentScriptName) {
  chrome.tabs.executeScript(tab.id, { file: contentScriptName });
}

const hangoutsUrlRegex = /https:\/\/hangouts.google.com\/call\//g;
const playerUrlRegex = /player.html/g;

function injectIfMatches(/** @type chrome.tabs.Tab */tab) {
  if (tab.url.match(hangoutsUrlRegex)) {
    injectScript(tab, 'contentScript-hangouts.js');
  }
  if (tab.url.match(playerUrlRegex)) {
    injectScript(tab, 'contentScript-player.js');
  }
}

// inject exising windows
chrome.tabs.query({}, tabs => {
  tabs.forEach(tab => {
    //injectIfMatches(tab);
  });
});

// inject new windows
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log(`tab ${tab.id} updated: ${JSON.stringify(changeInfo)}`);
  if (changeInfo.status === 'complete' /*|| changeInfo.title*/) {
    console.log(`tab ${JSON.stringify(tab)}`);

    //injectIfMatches(tab);
  }
});

chrome.runtime.onConnect.addListener(port => {

  if (port.name === 'myConnection') {
    port.onMessage.addListener(msg => {
      console.log(`background script got message ${JSON.stringify(msg)}`);
      //port.postMessage({ message: 'answer from background script' });
    });
    port.onDisconnect.addListener(_ => {
      console.log(`port ${port.name} was disconnected`);
    });
  }

  if (port.name === 'playerConnection') {
    // setInterval(() => {
    //   port.postMessage({ message: 'from background script to player' });
    // }, 2000);

    port.onDisconnect.addListener(_ => {
      console.log(`port ${port.name} was disconnected`);
    });
  }

});

chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {

  if (!sender.url.match(playerUrlRegex)) return;

  console.log(`background script got external player request ${JSON.stringify(request)}`);

  if (request.command === 'hangountsMuteMyself') {
    chrome.tabs.query({}, tabs => {
      tabs.forEach(tab => {
        if (tab.url.match(hangoutsUrlRegex) && (!request.titleRegex || tab.title.match(request.titleRegex)) ) {
          injectScript(tab, request.mute ? 'contentScript-hangouts-mute.js' : 'contentScript-hangouts-unmute.js');
        }
      });
    });
  }

});

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

