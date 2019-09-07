<template>

  <div class="root-html">
    <div class="root-body">

      <div class="controls">
        <select class="cameras">
          <option
            v-for="camera in cameras"
            :key="camera.deviceId"
            :value="camera.deviceId"
          >{{camera.name}}</option>
        </select>
        <button class="mirrorbutton">toggle mirror</button>
        <button class="trainerbutton">toggle trainer</button>
      </div>
      <video
        class="video"
        id="video"
        autoplay
      >
        <p>Browser doesn't support HTML5 video</p>
      </video>
      <img
        src="images/trainer-layers.png"
        class="video trainercontrols"
      />

    </div>
  </div>

</template>

<script>
  export default {
    data() {
      var cameras = [{ deviceId: "aaa", name: 1 }, { deviceId: "bbb", name: 2 }];
      return {
        cameras: []
      };
    },
    methods: {
      getCameras() {
        window.addEventListener('load', () => {
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.enumerateDevices().then(devices => {
              let videoDevices = devices.filter(d => d.kind === "videoinput");
              this.cameras = videoDevices.map((dev, i) => ({
                deviceId: dev.deviceId,
                name: i
              }));
            });
          }
        });
      }
    },
    beforeCreate: function() {},
    created: function() {
      this.getCameras();
    },
    beforeMount: function() {},
    mounted: function() {},
    beforeUpdate: function() {},
    updated: function() {},
    beforeDestroy: function() {},
    destroyed: function() {}
  };
</script>

<style scoped>
  .root-html,
  .root-body {
    height: 100%;
    background: black;
  }

  .root-html {
    display: table;
    margin: auto;
  }

  .root-body {
    display: table-cell;
    vertical-align: middle;
  }

  .video {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .mirror {
    transform: scaleX(-1);
  }

  /* https://fvsch.com/video-background/ */

  @media (min-aspect-ratio: 16/9) {
    .video {
      height: 300%;
      top: -100%;
    }
  }

  @media (max-aspect-ratio: 16/9) {
    .video {
      width: 300%;
      left: -100%;
    }
  }

  @supports (object-fit: cover) {
    .video {
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .controls {
    position: absolute;
    z-index: 1;
    top: 0;
    right: 0;
    opacity: 0;
    animation: fadeout 3s;
  }
  .controls:hover {
    opacity: 1;
  }
  @keyframes fadein {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  @keyframes fadeout {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  .trainercontrols {
    object-fit: unset;
    pointer-events: none;
    height: auto;
  }
</style>
