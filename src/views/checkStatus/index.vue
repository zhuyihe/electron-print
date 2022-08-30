<template>
    <div class="connectToweb">
        <!-- <div class="tip">
            <div>{{ ioStatus.msg }}</div>
            <div>
                <svg class="icon" aria-hidden="true" v-if="ioStatus.type == 'disconnect'">
                    <use xlink:href="#icon-shibai" />
                </svg>
                <svg class="icon" aria-hidden="true" v-else>
                    <use xlink:href="#icon-chenggong" />
                </svg>
            </div>
        </div> -->
        <div class="tip">
            <div>{{ printerStutas.msg }}</div>
            <div>
                <svg class="icon" aria-hidden="true" v-if="!printerStutas.type">
                    <use xlink:href="#icon-shibai" />
                </svg>
                <svg class="icon" aria-hidden="true" v-else>
                    <use xlink:href="#icon-chenggong" />
                </svg>
            </div>
        </div>
    </div>
</template>

<script>
import { ipcRenderer } from 'electron'
// import checkIoStutas from '@/mixins/checkIoStutas'
export default {
    name: 'connectToweb',
    data() {
        return {
            ioStatus: {
                msg: '请与客户端链接',
                type: 'disconnect'
            },
            printerStutas: {
                msg: '打印服务异常请重启电脑',
                type: false
            },
            printList: []
            // tip: '请与客户端链接'
        }
    },
    // mixins: [checkIoStutas],
    mounted() {
        this.init()
    },
    methods: {
        async init() {
            // await this.linstenerIo()
            this.linstenerPrinter()
            this.togoPrint()
        },
        // linstenerIo() {
        //     ipcRenderer.send('checkIoStutas')
        //     ipcRenderer.on('checkIoStutas', (event, data) => {
        //         // console.log(event, data, 'qq')
        //         this.ioStatus = data
        //     })
        // },
        linstenerPrinter() {
            this.getPrintListHandle()
        },
        // 获取打印机列表
        getPrintListHandle() {
            // // 改用ipc异步方式获取列表，解决打印列数量多的时候导致卡死的问题
            // ipcRenderer.send('getPrinterList')
            // ipcRenderer.once('getPrinterList', (event, data) => {
            const data = this.$electronStore.get('printerList')
            console.log(data, 'wqdqwdqw')
            // 过滤可用打印机
            this.printList = data.filter(element => element.status === 0)
            console.log(this.printList, 'this.printList')
            // 1.判断是否有打印服务
            if (this.printList.length <= 0) {
                this.printerStutas = {
                    msg: '打印服务异常,请尝试重启电脑',
                    type: false
                }
            } else {
                this.printerStutas = {
                    msg: '打印功能准备就绪',
                    type: true
                }
                // console.log(data, 'ccc')
                // this.checkPrinter()
                this.$electronStore.set('printList', this.printList)
            }
            // })
        },
        async togoPrint() {
            this.$ipcRenderers.printHtml.get('on', (event, data) => {
                if (data) this.checkStatus()
            })
            this.$ipcRenderers.printPdf.get('on', (event, data) => {
                console.log(data, 'qqq')
                if (data) this.checkStatus(data)
            })
        },
        checkStatus(data) {
            if (this.printerStutas.type) {
                this.$windows.show()
                console.log(this.$windows, data, ' this.$window')
                if (!data) {
                    this.$router.push('printEmr')
                } else {
                    this.$router.push('printPdf')
                    // console.log(data.url, 'data.url')
                    // window.open(data.url)
                    // this.$windows.loadURL(data.url)
                }
            }
        }
    }
}
</script>

<style lang="scss">
.connectToweb {
    .tip {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 18px;
        .icon {
            width: 30px;
            height: 30px;
            margin-left: 10px;
        }
        line-height: 16px;
        margin-top: 30px;
    }
}
</style>
