module.exports = {
  ifCond: function (a, b, options) {
    if (a === b) {
      return options.fn(this);
    }
    return options.inverse(this);
  },

  multply: function (a, b) {
    let c = a * b
    return c
  }
}