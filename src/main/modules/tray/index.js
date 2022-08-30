import { app, Menu, Tray } from 'electron'
let tray = null
const menus = [
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
export default trayService
