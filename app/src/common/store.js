export const store = {

  state: {
    numbers: [1, 2, 3],
    options: {
      selfCamera: {
        mirror: false,
      }
    }
  },

  addNumber(n) {
    this.state.numbers.push(n);
  },

  setSelfCameraMirror(mirror) {
    this.state.options.selfCamera.mirror = mirror;
  }

};
