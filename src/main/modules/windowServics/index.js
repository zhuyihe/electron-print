import { BrowserWindow } from 'electron'
import { browserWindowOptions, winURL } from '@/main/constants/browserWindow'

const WindowService = () => {
    return {
        mainWindow: null,
        viewWins: null,
        winItems: {},
        // constructor() {
        //     global.windowService = this
        //     global.viewWins = this.viewWins
        // },
        createBrowserWindow({ option, url }) { 
            const win = new BrowserWindow(option)
            // win.loadURL(winURL)
            win.setIcon(global.appLogoPath)
            return win
        },
        createMainWin() {
            const option = browserWindowOptions.main
            const url = this.getWebUrl()
            const mainWindow = this.createBrowserWindow({ option, url })

            require('@electron/remote/main').enable(mainWindow.webContents)
            require('@electron/remote/main').initialize()
            global.$windows = mainWindow
            mainWindow.webContents.openDevTools(true)
            if (global.isDevMode) {
                mainWindow.webContents.openDevTools()
            }
            this.mainWindow = mainWindow
            this.mainWindow.setIcon(global.appLogoPath)
            return this.mainWindow
        },
        toggleMainWindow() {
            const mainWindow = this.mainWindow
            if (mainWindow.isVisible()) {
                mainWindow.hide()
            } else {
                mainWindow.show()
            }
        },
        addWinItem(winId, data) {
            this.winItems[winId] = data
        },
        deleteWindow(winId) {
            delete this.winItems[winId]
        },
        createWinItem(winId, option, url) {
            const win = this.createBrowserWindow({ option, url })
            this.addWinItem(winId, win)
            return win
        },
        /**
         * 获取web地址
         * @param routerPath
         * @returns
         */
        getWebUrl(routerPath = '') {
            return `${winURL}/#/${routerPath}`
        },
        getWinItemByWindowId(windowId) {
            return this.winItems[windowId]
        },
        getWindowById(windowId) {
            if (windowId === 1) {
                return this.mainWindow
            } else {
                return this.getWinItemByWindowId(windowId)
            }
        },
        /**
         * 隐藏窗体
         * @param windowId 窗体ID
         */
        hideWindow(windowId) {
            const win = this.getWindowById(windowId)
            win.hide()
        },
        closeWindow(windowId) {
            const win = this.winItems[windowId]
            if (!win.isDestroyed()) {
                win.destroy()
            }
            //  移除内存中的窗体对象
            this.deleteWindow(windowId)
        }
    }
}
global.$windowService = WindowService()
export default WindowService
