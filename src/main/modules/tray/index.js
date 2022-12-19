import { app, Menu, Tray } from 'electron'
import { updateHandle } from '../update'
const version = require('../../../../package.json').version
let tray = null
const menus = [
    {
        click() {
            taryCheckUpdates()
        },
        label: `检测更新(当前版本${version})`
    },
    {
        click() {
            global.forceQuit = true
            app.quit()
        },
        label: '退出'
    }
]
const trayService = () => {
    tray = new Tray(global.appTrayPath)
    const contextMenu = Menu.buildFromTemplate(menus)
    tray.setContextMenu(contextMenu)
    tray.setToolTip('GlPrinter')
    tray.on('click', () => {
        const win = global.$windows
        win.show()
    })
}
const taryCheckUpdates = () => {
    const win = global.$windows
    win.show()
    updateHandle({ trayCheck: true })
}
export default trayService
