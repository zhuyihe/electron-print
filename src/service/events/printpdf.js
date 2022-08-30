const path = require('path')
const https = require('https')
const fs = require('fs')
const cp = require('child_process')
const staticPath = './public'
// let pdfPath = path.join(__static, 'pdf/' + url.slice(url.lastIndexOf('/') + 1))
// const isPrdEnv = process.env.NODE_ENV === 'production'
const executePrint = (pdfPath, deviceName = 'TOSHIBA Universal PS3') => {
    console.log(path.resolve(__static, ''), 'aaa')
    return new Promise((resolve, reject) => {
        cp.exec(
            `SumatraPDF.exe -print-to "${deviceName}"  "${pdfPath}"`,
            {
                windowsHide: true,
                cwd: path.resolve(__static, '')
            },
            e => {
                if (e) {
                    reject(`在${deviceName}上打印失败`)
                } else {
                    resolve(true)
                }
                /* 打印完成后删除创建的临时文件 */
                // fs.unlink(pdfPath, Function.prototype)
            }
        )
    })
}

module.exports = { executePrint }
