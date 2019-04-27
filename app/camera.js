window.addEventListener('load', () => {

    let videoElement = document.querySelector('.video');
    let camerasElement = document.querySelector('.cameras');
    let mirrorButtonElement = document.querySelector('.mirrorbutton');

    let mirror;

    function setCamera(deviceId) {
        // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
        navigator.mediaDevices.getUserMedia({
            video: {
                deviceId: deviceId,
                width: 1920,
                height: 1080,
                facingMode: 'environment', // 'user' or 'environment'
            },
        }).then(stream => {
            //video.src = window.URL.createObjectURL(stream);
            videoElement.srcObject = stream;
            videoElement.play();
        });
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.enumerateDevices().then(
            devices => {
                let videoDevices = devices.filter(d => d.kind === 'videoinput');

                videoDevices.forEach((dev,i) => {
                    let option = document.createElement("option");
                    option.value = dev.deviceId;
                    option.text = i;
                    camerasElement.appendChild(option);
                });

                camerasElement.addEventListener('change', function () {
                    let deviceId = this.value;
                    setCamera(deviceId);
                    localStorage.deviceId = deviceId;
                });

                mirrorButtonElement.addEventListener('click', function () {
                    mirror = !mirror;
                    localStorage.mirror = mirror;
                    videoElement.classList.toggle("mirror");
                });

                if (localStorage.deviceId) {
                    setCamera(localStorage.deviceId);
                    camerasElement.value = localStorage.deviceId;
                }

                if (localStorage.mirror === "true") {
                    mirror = true;
                    videoElement.classList.add("mirror");
                }
               
            });
    }
});
