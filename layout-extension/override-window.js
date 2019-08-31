console.log(`intercepting ${window.location}`);
//debugger;
document.open = window.open = function (url) {
    console.log(`open ${url}`);
}
