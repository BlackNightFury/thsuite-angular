const waitAndClick = require('../../waitAndClickHelper');

module.exports = (chromy, scenario, viewport, isReference, Chromy) => {
    require('../_login')(chromy, scenario, viewport, isReference, Chromy, ()=>{

        // Wait till everything is loaded
        chromy.wait('app-inventory .inventory-packages-table tbody tr:nth-child(12)');
        chromy.sleep(1000);

        waitAndClick(chromy, 'app-inventory .inventory-packages-table tbody tr:first-child');
        waitAndClick(chromy, 'app-package-details .content-section .btn.blue');

        chromy.wait('.notifyjs-corner .notifyjs-container');
        chromy.sleep(100);

    }, '/admin/inventory/packages/dashboard');
}