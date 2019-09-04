function injectScriptFile(file) {
  var script = document.createElement('script');
  script.setAttribute('type', 'module');
  script.setAttribute('src', file);
  const head = document.head || document.getElementsByTagName('head')[0] || document.documentElement;
  head.insertBefore(script, head.lastChild);
}

function injectScriptText(scriptText) {
  var script = document.createElement('script');
  script.innerHTML = scriptText;
  const head = document.head || document.getElementsByTagName('head')[0] || document.documentElement;
  head.insertBefore(script, head.lastChild);
}

injectScriptText(`window._extensionId = '${chrome.runtime.id}'`);
injectScriptFile(chrome.extension.getURL('override-window.js'));
