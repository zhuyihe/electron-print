/* eslint-disable no-unused-vars */
const { body, validationResult } = require("express-validator");
// const boom = require('boom')
const path = require("path");
const { executePrint } = require("../events/printpdf");
const printEmr = require("../events/printEmr");
const { resStatus } = require("../events/resStatus");
// const request = require('request')
// const fs = require('fs')
// const printer = require('pdf-to-printer')
// const remote = require('electron').remote
// console.log(remote, 'remote')
// const electronStore = remote.getGlobal('electronStore')
// console.log(global, 'global')
const getEmrContent = (req, res, next) => {
  const err = validationResult(req);

  if (!err.isEmpty()) {
    const { msg } = err.errors[0];
    global.logs.error(JSON.stringify(err));
    resStatus(res, false, msg);
    // 抛出错误，交给我们自定义的统一异常处理程序进行错误返回
    // next(boom.badRequest(msg))
    // return res.status(200).json({
    //     code: 200,
    //     data: {
    //         success: false,
    //         message: err.array()[0].msg
    //     }
    // })
  } else {
    printEmr(req, res);
  }
};

const printPdf = (req, res, next) => {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    const { msg } = err.errors[0];
    // 抛出错误，交给我们自定义的统一异常处理程序进行错误返回
    // next(boom.badRequest(msg))
  } else {
    let { type, url, deviceName } = req.body;
    console.log(global.$windows);
    // global.$electronStore.set('pdf', {
    //     type,
    //     url
    // })
    // global.$windows.webContents.send('printPdf', {
    //     type,
    //     url
    // })
    let pdfPath = path.join(
      __static,
      "pdf/" + url.slice(url.lastIndexOf("/") + 1)
    );
    executePrint(pdfPath, deviceName);
    // printer(pdfPath)
    //     .then(res => {
    //         console.log(res)
    //     })
    //     .catch(err => {
    //         console.log(res)
    //     })
    // console.log(pdfPath, 'pdfPath')
    // request(url, err => {
    //     console.log(err, 'err')
    //     if (!err) {

    //     }
    // }).pipe(fs.createWriteStream(pdfPath))
    res.status(200).json({
      code: 200,
      data: {
        success: true,
        message: "操作成功",
        // win: global.electronStore.get('win')
      },
    });
  }
};
const getPrinters = async (req, res, next) => {
  const printers = await global.$windows.webContents.getPrintersAsync();
  console.log(printers, "printers");
  res.status(200).json({
    success: true,
    message: "打印机获取成功",
    data: {
      printers,
    },
  });
};
module.exports = {
  getEmrContent,
  printPdf,
  getPrinters,
};
