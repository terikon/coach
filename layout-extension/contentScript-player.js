setInterval(() => {

  // const evt = document.createEvent('myCustomEvent', {
  //   bubbles: true,
  //   cancellable: false,
  // });
  //evt.initEvent('myCustomEvent', true, false);

  // fire the event
  document.dispatchEvent(new CustomEvent('myCustomEvent', { detail: { message: 'dispatchEvent from content script'} }));

}, 2000);
