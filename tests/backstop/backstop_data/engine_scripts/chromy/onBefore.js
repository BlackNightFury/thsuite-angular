module.exports = async (chromy, scenario, viewport, isReference, Chromy) => {
  require('./loadCookies')(chromy, scenario);

  // IGNORE ANY CERT WARNINGS
  chromy.ignoreCertificateErrors();
};