export default async function getPrinterList() {
    const { webContents } = global.$windows
    const list = await webContents.getPrintersAsync()
    global.$electronStore.set('printerList', list)
}
