window.addEventListener('load', () => {

    let videoElement = document.querySelector('#video');
    let camerasElement = document.querySelector('.cameras');
    let trainercontrolsElement = document.querySelector('.trainercontrols');
    let mirrorButtonElement = document.querySelector('.mirrorbutton');
    let trainerButtonElement = document.querySelector('.trainerbutton');

    let mirror, trainer;

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

                trainerButtonElement.addEventListener('click', function () {
                    trainer = !trainer;
                    localStorage.trainer = trainer;
                    trainercontrolsElement.style.display = trainer ? "block" : "none";
                });

                if (localStorage.deviceId) {
                    setCamera(localStorage.deviceId);
                    camerasElement.value = localStorage.deviceId;
                }

                if (localStorage.mirror === "true") {
                    mirror = true;
                    videoElement.classList.add("mirror");
                }

                if (localStorage.trainer === "true") {
                    trainer = true;
                }
                trainercontrolsElement.style.display = trainer ? "block" : "none";
               
            });
    }
});
