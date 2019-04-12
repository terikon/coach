window.addEventListener('load', () => {

    let videoElement = document.querySelector('.video');

    videoElement.addEventListener('dragover', function(ev) {
        ev.preventDefault();
    });

    videoElement.addEventListener('drop', function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        console.log('drop ' +JSON.stringify(this) );

        let file = [...ev.dataTransfer.items].find(x=>x.kind === 'file').getAsFile();
        console.log('... file.name = ' + file.name);

        // https://www.w3schools.com/tags/ref_av_dom.asp

        videoElement.src = URL.createObjectURL(file);
    });
});
