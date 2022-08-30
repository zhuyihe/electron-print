const path = require('path')
const { v4: uuidv4 } = require('uuid')
const { resStatus } = require('../events/resStatus')
const printEmr = (req, res) => {
    let { FileStream, showHtml } = req.body
    FileStream = FileStream.replace(/\SimSun/g, 'STSong')
    let emrConfig = {
        ...req.body,
        FileStream
    }
    global.$electronStore.set('emrConfig', emrConfig)

    if (showHtml) {
        global.$windows.webContents.send('printHtml', emrConfig)
    } else {
        loadHtml(emrConfig, res)
    }
}
const loadHtml = (emrConfig, res) => {
    const staticPath = path.join(__static, 'print.html')
    const option = {
        // show: false,
        webPreferences: {
            // Use pluginOptions.nodeIntegration, leave this alone
            // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
            enableRemoteModule: true, // 启用remote
            nodeIntegration: true,
            nodeIntegrationInSubFrames: true,
            webviewTag: true,
            contextIsolation: false
        }
    }
    const id = uuidv4()
    const win = global.$windowService.createWinItem(id, option, staticPath)
    win.loadURL(staticPath)
    printSilent(win, emrConfig, res, id)
    console.log(global, 'global')
}
const printSilent = (win, emrConfig, res, id) => {
    const { PrintSettings } = emrConfig
    let { PrintName, PrintNum, Duplex } = PrintSettings,
        duplexMode = ''
    switch (Duplex) {
        case 'Simplex':
            duplexMode = ''
            break
        case 'Vertical':
            duplexMode = 'longEdge'
            break
        case 'Horizontal':
            duplexMode = 'shortEdge'
            break
    }
    win.webContents.once('dom-ready', () => {
        if (!global.isDevMode) {
            win.webContents.openDevTools(true)
        }

        // 向print.htm发送打印数据
        win.webContents.send('webview-print-render', {
            content: emrConfig.FileStream,
            parent: 'win'
        })
    })
    win.webContents.on('ipc-message', (event, channel) => {
        let printerConfig = {
            silent: true,
            printBackground: false,
            deviceName: PrintName || 'Microsoft Print to PDF', // 打印机对象的name
            copies: parseInt(PrintNum) || 1,
            duplexMode
        }

        // 调用打印方法
        win.webContents.print(printerConfig, data => {
            let msg = ''
            if (!data) {
                msg = '打印失败，请检查打印机'
                resStatus(res, false, msg)
            } else {
                msg = '打印成功'
                resStatus(res, true, msg)
            }
            printerConfig.msg = msg
            global.logs.info(`print ${data}==>${JSON.stringify(printerConfig)}`)
            global.$windowService.closeWindow(id)
        })
    })
}
module.exports = printEmr
