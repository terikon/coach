let changeColor = document.getElementById('changeColor');
let selectTitle = document.getElementById('selectTitle');

chrome.storage.sync.get('color', function (data) {
  changeColor.style.backgroundColor = data.color;
  changeColor.setAttribute('value', data.color);
  changeColor.onclick = function (element) {
    let color = element.target.value;
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function (tabs) {
      chrome.tabs.executeScript(
        tabs[0].id, {
          //code: 'document.body.style.backgroundColor = "' + color + '";'
          file: 'contentScript.js'
        });
    });
  };
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
