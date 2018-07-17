module.exports = (chromy, scenario, viewport, isReference, Chromy, callback, urlToNavigate) => {

    const username = (process.argv.find(arg => arg.indexOf('--username=') === 0) || '').substr(11);
    const password = (process.argv.find(arg => arg.indexOf('--password=') === 0) || '').substr(11);

    chromy.type('app-login .input-row [type="text"]', username);
    chromy.type('app-login .input-row [type="password"]', password);
    chromy.click('app-login .section-action button');
    chromy.wait('app-admin');

    if (urlToNavigate) {
        chromy.evaluate((urlToNavigate) => {
            window.$router.navigateByUrl(urlToNavigate);
        }, [urlToNavigate]);
    }

    if (callback) {
        setTimeout(callback, (urlToNavigate ? 1000 : 1));
    }
}