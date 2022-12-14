const express = require('express')
const printRouter = require('./print') // 引入print路由模块
const router = express.Router() // 注册路由

router.use('/api', printRouter) // 注入打印路由模块
// 自定义统一异常处理中间件，需要放在代码最后
router.use((err, req, res, next) => {
    // 自定义用户认证失败的错误返回
    console.log('err===', err)
    const { output } = err || {}
    // 错误码和错误信息
    const errCode = (output && output.statusCode) || 500
    const errMsg = (output && output.payload && output.payload.error) || err.message
    res.status(errCode).json({
        code: errCode,
        msg: errMsg
    })
})

module.exports = router
