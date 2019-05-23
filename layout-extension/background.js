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
