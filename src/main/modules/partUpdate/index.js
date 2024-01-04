import { app, ipcMain } from "electron";
const admZip = require("adm-zip");
const request = require("request");
const https = require("https");
const fs = require("fs");
const yaml = require("js-yaml");
const path = require("path");
const baseUrl = path.resolve("./") + "/";
// 加载默认的 .env 文件
const downLoadZip = `${baseUrl}resources.zip`;
const axios = require('axios').default;
const getUpadteJson = () => {
  const isBuild = process.env.NODE_ENV === "production";
  const defualtEnv = require("./config");
  const pathToDbFile = path.join(
    isBuild ? __dirname : __static,
    "../public/update.json"
  );
  console.log(pathToDbFile,'pathToDbFile')
  const isExists = fs.existsSync(pathToDbFile);

  const curEnv = isExists
    ? JSON.parse(fs.readFileSync(pathToDbFile, { encoding: "utf-8" }))
    : defualtEnv;
    console.log(curEnv,'curEnv')
  // const fileUrl = curEnv.VUE_APP_UPDATE_URL;
  const fileUrlObj = {
    hostname: curEnv.VUE_APP_HOST_NAME,
    port: 443,
    path: curEnv.VUE_APP_PATH_NAME,
    method: "GET",
  };
  setTimeout(() => {
    global.logs.info(`当前参数${JSON.stringify(curEnv)}`);
  }, 3000);
  return { fileUrlObj, curEnv };
};

/**
 * 更新
 */
const downLoad = (updateMsg,curEnv) => {
  return new Promise((resolve, reject) => {
    // 创建一个可以写入的流，
    const stream = fs.createWriteStream(downLoadZip);
    const url = `${curEnv.VUE_APP_UPDATE_URL}resources.zip`;
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
  const { fileUrlObj ,curEnv} = getUpadteJson();
  return new Promise((resolve, reject) => {
    const options = {
      rejectUnauthorized: false,
      ...fileUrlObj,
    };
    console.log(options, "options");
    global.logs.info(`下载更新地址${JSON.stringify(options)}`);
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
          const packageVersion = app.getVersion();
          console.log(compareVersions(version,packageVersion),version,packageVersion)
          if (compareVersions(version,packageVersion)>0) {
            const updateMsg = { releaseNotes, updateVersion: version };
            //判断是否存在resources.zip
            fs.stat(downLoadZip, async (err, stats) => {
              console.log(err, stats, "err");
              if (stats) {
                global.logs.info(`存在更新包，直接更新`);
                global.logs.info(JSON.stringify(stats));
                sendUpdateMessage("UpdatePartMsg", updateMsg);
              } else {
                // const url = `${curEnv.VUE_APP_UPDATE_URL}resources.zip`;
              //   checkIfFileExists(url)
              //  console.log(' checkFileExists(url)')
                // const isExists = fs.existsSync(pathToDbFile);
                global.$notification.create(
                  "消息提示",
                  "更新包正在下载中,请稍等..."
                );
                global.logs.info(`更新包正在下载中,请稍等...`);
                await downLoad(updateMsg,curEnv);
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

function compareVersions(version1, version2) {
  // 将版本号字符串拆分成数组
  const arr1 = version1.split('.');
  const arr2 = version2.split('.');
  
  // 比较每个部分的大小
  for (let i = 0; i < Math.max(arr1.length, arr2.length); i++) {
    if (arr1[i] === undefined) {
      return -1;
    }
    if (arr2[i] === undefined) {
      return 1;
    }
    
    if (parseInt(arr1[i]) > parseInt(arr2[i])) {
      return 1;
    } else if (parseInt(arr1[i]) < parseInt(arr2[i])) {
      return -1;
    }
  }
  
  // 如果所有部分都相等，则版本号相等
  return 0;
}
async function checkIfFileExists(url) {
  // console.log(axios,'axios')
  try {
    const agent = new https.Agent({
      rejectUnauthorized: false,
    });
    let result=await axios.get(url, { httpsAgent: agent })
   console.log(result.status=='200','qqqq')
  } catch (error) {
   console.log(error,'error')
  }
 
  // 发送 GET 请求
  
    // .then(response => {
    //   // 如果响应状态码为 200，表示文件存在
    //   if (response.status === 200) {
    //     return true;
    //   } else {
    //     return false;
    //   }
    // })
    // .catch(error => {
    //   console.error('发生错误:', error);
    //   return false;
    // });
}


export { downLoad, checkForUpdates };
