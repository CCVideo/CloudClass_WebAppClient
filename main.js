/**
 * yunclass 程序入口
 *
 * */
// const electron = require('electron');
//electron.app, electron.BrowserWindow, electron.ipcMain; //require('electron');
const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const url = require('url');
const moment = require('moment');
const config = require('./shared/config').config;
const log4js = require('log4js');


log4js.configure({
    appenders: {
        console: {type: 'console'},
        yunclass: {
            type: 'file',
            filename: path.join(app.getPath('appData'), 'yunclass', 'logs', 'main.' + moment(new Date()).format('YYYY-MM-DD') + '.log')
        }
    },
    categories: {
        default: {
            appenders: ['console', 'yunclass'],
            level: 'debug'
        }
    }
});

const logger = log4js.getLogger('yunclass');
logger.info('yunclass start version is ' + config.app.version);

let viewerWindow;

let viewerWindowWidth = 1210;
let viewerWindowHeight = 700;

var params = '';
if (process.platform === 'win32') {

    viewerWindowWidth = 1220;

    var args = process.argv;

    logger.debug('params ' + args);

    if (args && args.length >= 2) {
        var splits = args[1].split('?');
        if (splits.length > 1) {
            params = splits[1];
        }
    }
} else if (process.platform === 'darwin') {
    var args = process.argv;

    logger.debug('params ' + args);

    params = args[2];
}

params = '/?roomid=645B41C5DC8361019C33DC5901307461&userid=E9607DAFB705A798&role=presenter';

function createViewerWindow() {
    viewerWindow = new BrowserWindow({
        width: viewerWindowWidth,
        height: viewerWindowHeight,
        minWidth: viewerWindowWidth,
        minHeight: viewerWindowHeight,
        nodeIntegration: true,
        autoHideMenuBar: true,
        backgroundColor: '#FFF',
        title: 'V' + config.app.version + ' 云课堂',
        icon: path.join(__dirname, 'favicon.ico'),
        webPreferences: {}
    });

    viewerWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'renderer', 'index.html'),
        protocol: 'file:',
        slashes: true
    }));
    logger.info('params:', params);
    viewerWindow.webContents.on('did-finish-load', function () {

        //if (params && params.indexOf('roomid') >= 0 && params.indexOf('userid') >= 0 && params.indexOf('role') >=0) {
        var room = url.parse(params, true).query;
        logger.debug("params parse to room:", room);
        var s = 'https://class.csslcloud.net/index/' + room.role + '/?roomid=' + room.roomid + '&userid=' + room.userid;
        logger.info('webview load url ' + s);

        sendMsgToRenderer(SIGNAL_CORPS_ACTION.CHANGE_WEBVIEW_SRC, s);
        //} else {
        //    sendMsgToRenderer(SIGNAL_CORPS_ACTION.ERROR_PARAMS);
        //}
    });
    viewerWindow.webContents.openDevTools();
    viewerWindow.on('closed', function () {
        viewerWindow = null;
    });
}

app.on('ready', createViewerWindow);

app.on('window-all-closed', function () {
    if (app) {
        app.quit();
    }
});

/**
 * 隐藏默认菜单栏
 * */
app.on('browser-window-created', function (e, window) {
    window.setMenu(null);
});


var shouldQuit = app.makeSingleInstance(function (commandLine, workingDirectory) {
    // 当另一个实例运行的时候，这里将会被调用，我们需要激活应用的窗口
    if (viewerWindow) {
        if (viewerWindow.isMinimized()) {
            viewerWindow.restore();
        }
        viewerWindow.focus();
    }
    return true;
});

// 这个实例是多余的实例，需要退出
if (shouldQuit) {
    app.quit();
    return;
}

app.on('activate', function () {
    logger.debug('app activate');

    if (viewerWindow === null) {
        createViewerWindow()
    }
});

const CHANNEL_SIGNAL_CORPS = 'signal_corps';
const SIGNAL_CORPS_ACTION = {
    CHANGE_WEBVIEW_SRC: 'change_webview_src',
    LOCK_SCREEN: 'lock_screen',
    UNLOCK_SCREEN: 'unlock_screen',
    ERROR_PARAMS: 'error_params',
    QUIT_APP: 'quit_app',
    OPEN_DEV_TOOLS: 'open_dev_tools',
    DEBUG_LOG: 'debug_log'
};

function sendMsgToRenderer(action, data) {
    viewerWindow.webContents.send(CHANNEL_SIGNAL_CORPS, {
        action: action,
        data: data
    });
}


let isLockScreen = false;
ipcMain.on(CHANNEL_SIGNAL_CORPS, (event, datas) => {
    var action = datas.action;

    if (action === SIGNAL_CORPS_ACTION.LOCK_SCREEN) {
        isLockScreen = true;
        if (viewerWindow) {
            if (viewerWindow.isMinimized()) {
                viewerWindow.restore();
            }

            if (!viewerWindow.isFocused()) {
                viewerWindow.focus();
            }

            viewerWindow.setAlwaysOnTop(true);
            viewerWindow.setFullScreen(true);
        }
    } else if (action === SIGNAL_CORPS_ACTION.UNLOCK_SCREEN) {
        isLockScreen = false;
        if (viewerWindow) {
            viewerWindow.setAlwaysOnTop(false);
            viewerWindow.setFullScreen(false);
        }
    } else if (action === SIGNAL_CORPS_ACTION.QUIT_APP) {
        if (app) {
            app.quit();
        }
    } else if (action === SIGNAL_CORPS_ACTION.OPEN_DEV_TOOLS) {
        viewerWindow.openDevTools();
    }
});


setInterval(function () {
    if (!viewerWindow) {
        return;
    }
    viewerWindow.setAlwaysOnTop(isLockScreen);
}, 10000);


function debugLog(msg) {
    sendMsgToRenderer(SIGNAL_CORPS_ACTION.DEBUG_LOG, msg);
}
