const { Notification } = require('electron')

const notification = () => {
    return {
        notice: null,
        create(title = '标题', body = '正文文本，显示在标题下方') {
            const isSupported = Notification.isSupported()
            if (this.notice) {
                this.close()
            }
            let notice = null
            if (isSupported) {
                const options = {
                    title,
                    body,
                    silent: true
                }
                notice = new Notification(options)
            }
            notice.show()
            this.notice = notice
        },
        close() {
            this.notice.close()
        }
    }
}
global.$notification = notification()
module.exports = notification
