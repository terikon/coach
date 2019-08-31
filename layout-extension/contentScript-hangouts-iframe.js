function injectScriptFile(file) {
  var s = document.createElement('script');
  s.src = file;
  (document.head||document.documentElement).appendChild(s);
}

function injectScriptText(scriptText) {
  var s = document.createElement('script');
  s.innerHTML = scriptText;
  (document.head||document.documentElement).appendChild(s);
}

injectScriptFile( chrome.extension.getURL('override-window.js'));
