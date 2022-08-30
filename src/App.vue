<template>
    <div id="app">
        <!-- <printDialog :dialog-visible="dialogVisible" @cancel="handlePrintDialogCancel" /> -->
        <!-- <PinterWeb ref="print"></PinterWeb>
        <el-table :data="tableData" style="width: 100%">
            <el-table-column prop="date" label="日期" width="180" column-key="date"> </el-table-column>
            <el-table-column prop="name" label="姓名" width="180"> </el-table-column>
            <el-table-column prop="address" label="地址"> </el-table-column>
            <el-table-column label="操作">
                <template slot-scope="scope">
                    <el-button type="primary" @click="doPrint(scope.row)">打印</el-button>
                </template>
            </el-table-column>
        </el-table> -->
        <router-view />
    </div>
</template>
<script>
// import { ipcRenderer } from 'electron'
// import printDialog from './components/PrintDialog.vue'
// import PinterWeb from '@/components/PinterWeb.vue'
export default {
    name: 'App',
    components: {
        // PinterWeb
        // printDialog
    },
    data() {
        return {
            // dialogVisible: false,
            // HtmlData: '',
            // printList: [],
            // tableData: []
        }
    },
    mounted() {},
    methods: {
        // handlePrintDialogCancel() {
        //     this.dialogVisible = false
        // },
        // doPrint(row) {
        //     this.HtmlData = row.name
        //     this.$refs.print.print(row.name)
        // }
    }
}
</script>

<style>
#app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    /* -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50; */
    /* margin-top: 60px; */
}
</style>
