window.onload = function () {
    const config = require('../../shared/config').config;

    if (typeof window.on_cc_cclivevc === 'function') {
        window.on_cc_cclivevc(config.app.version);
    }
};