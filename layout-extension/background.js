chrome.runtime.onInstalled.addListener(function () {

  chrome.browserAction.setTitle({title: 'Styopa'});

  chrome.storage.sync.set({
    color: '#3aa757'
  }, function () {
    console.log("The color is green.");
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


