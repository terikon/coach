console.log(`extension ID: ${chrome.runtime.id}`);

//////////// iframe handling ////
var HEADERS_TO_STRIP_LOWERCASE = [
  'content-security-policy',
  'x-frame-options',
];

chrome.webRequest.onHeadersReceived.addListener(
  function (details) {
    return {
      responseHeaders: details.responseHeaders.filter(function (header) {
        return HEADERS_TO_STRIP_LOWERCASE.indexOf(header.name.toLowerCase()) < 0;
      })
    };
  }, {
    urls: ["<all_urls>"]
  }, ["blocking", "responseHeaders"]);
//////////////////////////////////


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

const hangoutsCallUrlRegex = /https:\/\/hangouts.google.com\/call\//g;
const playerUrlRegex = /player.html/g;
const hangoutsUrlRegex = /hangouts.google.com/g;

function injectIfMatches(/** @type chrome.tabs.Tab */tab) {
  if (tab.url.match(hangoutsCallUrlRegex)) {
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

var onTopWindowIds = {};
var onBottomWindowIds = {};

async function handleHangoutsMessage(request, sender, sendResponse) {
  console.log(`background script got external hangouts request ${JSON.stringify(request)}`);
}

async function handlePlayerMessage(request, sender, sendResponse) {
  console.log(`background script got external player request ${JSON.stringify(request)}`);

  switch (request.command) {
    case 'hangountsMuteMyself':
      chrome.tabs.query({}, tabs => {
        console.log(`background script handled external player request ${JSON.stringify(request)}`);
        tabs.forEach(tab => {
          if (tab.url.match(hangoutsUrlRegex) && (!request.titleRegex || tab.title.match(request.titleRegex))) {
            injectScript(tab, 'contentScript-hangouts-loop.js');
            injectScript(tab, request.mute ? 'contentScript-hangouts-mute.js' : 'contentScript-hangouts-unmute.js');
          }
        });
      });
      break;
    case 'switchScreenLayout':
      const mode = await getMode();
      if (mode === request.mode) {
        /** @type Array */let screenLayouts = (await loadScreenLayouts()).screenLayouts;

        console.log(`switchScreenLayout: mode ${request.mode}, layout: ${request.layout}`);

        screenLayouts = screenLayouts.filter(l => l.mode === request.mode && (!request.layout || l.layout === request.layout));

        console.log(`screenLayouts: ${JSON.stringify(screenLayouts)}`);

        screenLayouts.forEach(screenLayout => {

          chrome.tabs.query({title: screenLayout.titleRegex}, tabs => {
            console.log(`tabs of ${screenLayout.titleRegex}: ${JSON.stringify(tabs)}`);

            tabs.forEach(t => {
              const windowId = t.windowId;
              // chrome.windows.get(windowId, window => {
              //   console.log(JSON.stringify(window));
              // });
              const alwaysOnTop = screenLayout.alwaysOnTop || false;
              chrome.windows.update(windowId, {
                left: screenLayout.left,
                top: screenLayout.top,
                width: screenLayout.width,
                height: screenLayout.height,
                focused: alwaysOnTop,
              });

              if (alwaysOnTop) {
                onTopWindowIds[windowId] = true;
                delete onBottomWindowIds[windowId];
              } else {
                onBottomWindowIds[windowId] = true;
                delete onTopWindowIds[windowId];
              }
            });

          });

        });

        break;
      }
    case 'whoAmI':
      chrome.storage.sync.get('layout', layout => {
        sendResponse(layout);
      });
  }
}

chrome.runtime.onMessageExternal.addListener(async (request, sender, sendResponse) => {

  if (sender.url.match(hangoutsUrlRegex)) await handleHangoutsMessage(request, sender, sendResponse);

  if (sender.url.match(playerUrlRegex)) await handlePlayerMessage(request, sender, sendResponse);

});

// implementation of alwaysOnTop
chrome.windows.onFocusChanged.addListener(focusedWindowId => {
  if (!onBottomWindowIds[focusedWindowId]) return;
  // focused window should be on bottom
  setTimeout(() => { // delay to make other window somehow usable
    for (let windowIdstr in onTopWindowIds) {
      const windowId = Number(windowIdstr);
      chrome.windows.update(windowId, {
        focused: true,
      });
    }
  }, 500);
});

function getMode() {
  return new Promise(resolve => {-+5
    chrome.storage.sync.get('mode', data => {
      const mode = data.mode || 'student';
      resolve(mode);
    });
  });
}

async function loadScreenLayouts() {
  const response = await fetch('screenlayouts.json');
  return response.json();
}

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

