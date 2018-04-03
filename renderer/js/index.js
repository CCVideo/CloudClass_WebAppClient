const {ipcRenderer, remote} = require('electron');
// const moment = require('moment');
// const path = require('path');
// const log4js = require('log4js');
// log4js.configure({
//     appenders: {
//         cclivevc: {
//             type: 'file',
//             filename: path.join(app.getPath('appData'), 'cclivevc', 'logs', 'renderer.' + moment(new Date()).format('YYYY-MM-DD') + '.log')
//         }
//     },
//     categories: {
//         default: {appenders: ['cclivevc'], level: 'info'}
//     }
// });
// const logger = log4js.getLogger('cclivevc');
//
// logger.info('renderer start');

const CHANNEL_SIGNAL_CORPS = 'signal_corps';
const SIGNAL_CORPS_ACTION = {
    CHANGE_WEBVIEW_SRC: 'change_webview_src',
    LOCK_SCREEN: 'lock_screen',
    UNLOCK_SCREEN: 'unlock_screen',
    ERROR_PARAMS: 'error_params',
    QUIT_APP: 'quit_app',
    UPDATE_YUNCLASS: 'update_yunclass',
    OPEN_DEV_TOOLS: 'open_dev_tools',
    DEBUG_LOG: 'debug_log'
};

const viewer = document.getElementById('viewer');
const loading = document.getElementById('loading');
const offline = document.getElementById('offline');
const unLockScreen = document.getElementById('unLockScreen');
const lockScreen = document.getElementById('lockScreen');
const errMsg = document.getElementById('errMsg');
const offlineMsg = document.getElementById('offlineMsg');

if (!window.navigator.onLine) {
    offlineMsg.style.display = 'block';
}

const updateMsg = document.getElementById('updateMsg');
let updateURL = '';


// viewer.openDevTools();

onload = () => {
    viewer.addEventListener('did-start-loading', function () {
    });

    viewer.addEventListener('did-stop-loading', function () {
        viewer.style.display = 'block';
        loading.style.display = 'none';
    });

    /**
     * 该消息来自viewer的guest页面
     * */
    viewer.addEventListener('ipc-message', (event) => {
        if (CHANNEL_SIGNAL_CORPS != event.channel) {
            return;
        }

        var action = '';
        if (event.args && event.args.length) {
            action = event.args[0];
        }

        // logger.info('from guest action ' + action);

        if (action === SIGNAL_CORPS_ACTION.LOCK_SCREEN) {
            lockScreen.style.display = 'block';
            setTimeout(function () {
                lockScreen.style.display = 'none';
            }, 2000);
            sendMsgToMain(SIGNAL_CORPS_ACTION.LOCK_SCREEN);
        } else if (action === SIGNAL_CORPS_ACTION.UNLOCK_SCREEN) {
            unLockScreen.style.display = 'block';
            setTimeout(function () {
                unLockScreen.style.display = 'none';
            }, 2000);
            sendMsgToMain(SIGNAL_CORPS_ACTION.UNLOCK_SCREEN);
        } else if (action === SIGNAL_CORPS_ACTION.OPEN_DEV_TOOLS) {
            // remote.getCurrentWindow().openDevTools();
        } else if (action === SIGNAL_CORPS_ACTION.ERROR_PARAMS) {
            errMsg.style.display = 'block';
        } else if (action === SIGNAL_CORPS_ACTION.UPDATE_YUNCLASS) {

            if (event.args.length >= 2) {
                updateURL = event.args[1];
                updateMsg.style.display = 'block';
            }
        }
    });
};


const {shell} = require('electron');

document.getElementById('updateMsgBtn').addEventListener("click", function () {
    if (updateURL) {
        shell.openExternal(updateURL);
        updateMsg.style.display = 'none';
    }
});

document.getElementById('refresh').addEventListener("click", function () {
    remote.getCurrentWebContents().reload();
});

ipcRenderer.on(CHANNEL_SIGNAL_CORPS, (event, arg) => {
    var action = arg.action;
    if (action === SIGNAL_CORPS_ACTION.CHANGE_WEBVIEW_SRC) {
        // viewer.src = arg.data;
        console.log(arg.data);
    } else if (action === SIGNAL_CORPS_ACTION.ERROR_PARAMS) {
        errMsg.style.display = 'block';
    } else if (action === SIGNAL_CORPS_ACTION.DEBUG_LOG) {
        console.log(SIGNAL_CORPS_ACTION.DEBUG_LOG, arg.data);
    }
});

document.getElementById('errMsgBtn').addEventListener("click", function () {
    sendMsgToMain(SIGNAL_CORPS_ACTION.QUIT_APP);
});

window.addEventListener('online', function () {
    offline.style.display = 'none';

    if (offlineMsg.style.display === 'block') {
        document.getElementById('refresh').click()
    }
});

window.addEventListener('offline', function () {
    offline.style.display = 'block';
});

/**
 * 发送信息到渲染进程
 * */
function sendMsgToMain(action, data) {
    ipcRenderer.send(CHANNEL_SIGNAL_CORPS, {
        action: action,
        data: data
    });
}
