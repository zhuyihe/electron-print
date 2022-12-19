export default async function getPrinterList() {
    const { webContents } = global.$windows
    const list = await webContents.getPrinters()
    console.log(list, 'list')
    global.$electronStore.set('printerList', list)
}
