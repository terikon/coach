/**@type HTMLButtonElement*/ const buttonChangeColor = document.getElementById('buttonChangeColor');
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
