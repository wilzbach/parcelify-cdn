module.exports = {
  isArray: function(k) {
    return Object.prototype.toString.call(k) === '[object Array]';
  }
}
