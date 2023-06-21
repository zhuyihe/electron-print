const admZip = require("adm-zip");
const request = require("request");
const https = require("https");
const fs = require("fs");
const yaml = require("js-yaml");
const path = require("path");
const baseUrl = path.resolve("./") + "/";
const configEnv = require("./config.js");
// 加载默认的 .env 文件
const downLoadZip = `${baseUrl}resources.zip`;
const curEnv = configEnv[process.env.VUE_APP_ENV];
const fileUrl = curEnv.VUE_APP_UPDATE_URL;
const fileUrlObj = {
  hostname: curEnv.VUE_APP_HOST_NAME,
  port: 443,
  path: curEnv.VUE_APP_PATH_NAME,
  method: "GET",
};
setTimeout(() => {
  global.logs.info(`当前参数${JSON.stringify(curEnv)}`);
}, 3000);
// global.logs.info(`当前环境:${process.env.VUE_APP_ENV}`)
// const curEnv = process.env;
// global.logs.info(`环境配置文件:${configEnv}`)
// global.logs.info(`当前环境:${process.env.ENV}`)
// const fileUrl = 'http://127.0.0.vscode-file://vscode-app/d:/Microsoft%20VS%20Code%20Insiders/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html1:5500/'
// const fileDefualtUrl = "https://10.102.11.76/printsoftware/";
// console.log(curEnv.VUE_APP_UPDATE_URL, "fileUrl");
// let fileUrl = curEnv.VUE_APP_UPDATE_URL;

import { app, ipcMain } from "electron";

/**
 * 更新
 */
const downLoad = (updateMsg) => {
  return new Promise((resolve, reject) => {
    // 创建一个可以写入的流，
    const stream = fs.createWriteStream(downLoadZip);
    const url = `${fileUrl}resources.zip`;
    const req = request({
      url,
      rejectUnauthorized: false,
    }).pipe(stream);
    req.on("finish", function (response) {
      console.log("finish");
    });
    req.on("close", function () {
      sendUpdateMessage("UpdatePartMsg", updateMsg);
      resolve(true);
    });
  });
};
const emptyDir = (path, type) => {
  if (type) {
    // fs.unlinkSync(path)
    fs.unlink(path, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        global.logs.info(`删除${path}文件成功`);
        console.log(`删除${path}文件成功`);
      }
    });
  } else {
    const files = fs.readdirSync(path);
    files.forEach((file) => {
      const filePath = `${path}/${file}`;
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        emptyDir(filePath);
      } else {
        fs.unlinkSync(filePath);
        global.logs.info(`删除${file}文件成功`);
        console.log(`删除${file}文件成功`);
      }
    });
  }
};
const checkForUpdates = (type) => {
  return new Promise((resolve, reject) => {
    const options = {
      rejectUnauthorized: false,
      ...fileUrlObj,
    };
    console.log(options, "options");
    const req = https.request(options, function (res) {
      const data = [];
      res.on("data", function (d) {
        //   process.stdout.write(d);
        data.push(d);
      });
      res.on("end", function (d) {
        const body = Buffer.concat(data).toString();
        var doc = yaml.load(body);
        const json = JSON.parse(JSON.stringify(doc, null, 2));
        const { version, releaseNotes } = json;
        console.log(version, releaseNotes, "releaseNotes");
        if (version) {
          /**
           * app.getVersion() 返回开发中的 Electron 版本号
           */
          const localVersion = app.getVersion();
          let flag = false;
          flag = version !== localVersion ? true : false;
          if (flag) {
            const updateMsg = { flag, releaseNotes, updateVersion: version };
            //判断是否存在resources.zip
            fs.stat(downLoadZip, async (err, stats) => {
              console.log(err, stats, "err");
              if (stats) {
                global.logs.info(`存在更新包，直接下载`);
                global.logs.info(JSON.stringify(stats));
                sendUpdateMessage("UpdatePartMsg", updateMsg);
              } else {
                global.$notification.create(
                  "消息提示",
                  "更新包正在下载中,请稍等..."
                );
                global.logs.info(`更新包正在下载中,请稍等...`);
                await downLoad(updateMsg);
              }
            });
          } else {
            type && global.$notification.create("消息提示", "暂无更新...");
            global.logs.info(`暂无更新`);
          }
        }

        ipcMain.on("Sure", (event, message) => {
          const unzip = new admZip(downLoadZip); //下载压缩更新包
          unzip.extractAllTo(`${baseUrl}`, true); //解压替换本地文件
          setTimeout(() => {
            global.forceQuit = true;
            emptyDir(downLoadZip, "zip");
            global.logs.info(`安装更新,重启项目`);
            app.exit();
            app.relaunch();
          }, 2000);
        });
      });
      res.on("error", (err) => {
        reject(err);
      });
    });
    req.end();
    req.on("error", function (e) {
      const { code } = e,
        map = {
          ETIMEDOUT: {
            title: "更新超时提醒",
            content: "请检查网络或者连接vpn",
          },
        };
      map[code] &&
        global.$notification.create(map[code].title, map[code].content);
      // throw 'Failed to update the version number, please contact the administrator'
    });
  });
};
function sendUpdateMessage(type, data, winshow) {
  const win = global.$windows;
  win.show();
  global.$windows.webContents.send(type, data);
}
export { downLoad, checkForUpdates };
