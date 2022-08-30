import Vue from 'vue'
import VueRouter from 'vue-router'

const checkStatus = require(/* webpackChunkName: "checkStatus" */ '@/views/checkStatus/index.vue').default

const printEmr = require(/* webpackChunkName: "printEmr" */ '@/views/printEmr/index.vue').default

const printPdf = require(/* webpackChunkName: "printPdf" */ '@/views/printPdf/index.vue').default

Vue.use(VueRouter)

const routes = [
    // {
    //   path: '/',
    //   name: 'Home',
    //   component: Home
    // },
    // {
    //   path: '/about',
    //   name: 'About',
    //   // route level code-splitting
    //   // this generates a separate chunk (about.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
    // }
    {
        path: '/',
        name: 'checkStatus',
        component: checkStatus
    },
    {
        path: '/printEmr',
        name: 'printEmr',
        component: printEmr
    },
    {
        path: '/printPdf',
        name: 'printPdf',
        component: printPdf
    }
]

const router = new VueRouter({
    mode: process.env.IS_ELECTRON ? 'hash' : 'history',
    routes
})

const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => err)
}
export default router
