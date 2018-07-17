module.exports = function (chromy, selector) {
  chromy.wait(selector);
  chromy.click(selector);
};