export const store = {

  state: {
    numbers: [1, 2, 3]
  },

  addNumber(n) {
    this.state.numbers.push(n);
  }

};
