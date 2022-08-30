const app = require('express')()
const server = require('http').createServer(app)
const port = process.env.PORT || 5555
const bodyParser = require('body-parser')
const cors = require('cors')
const routes = require('./routes') //导入自定义路由文件，创建模块化路由
//解决跨域
app.use(cors())
//express内置的post参数解析
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb', parameterLimit: 1000000 }))
app.use(
    bodyParser.json({
        limit: '10mb'
    })
) // 解析json数据格式

app.use('/', routes)
const service = () => {
    server.listen(port, () => {
        console.log(`server is running on port http://localhost:${port}`)
    })
}

export default service
