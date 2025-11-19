// pages/splash/splash.js
const app = getApp()

Page({
  data: {
    appName: 'Yey Home',
    appDesc: '记录生活，分享技术-90后，从事弱电安防智能化工程，包含监控系统，楼宇对讲系统，LED系统，广播音箱系统，停车场系统，楼宇对讲系统喜欢分享捣鼓有趣的代码。',
    logoUrl: '/assets/logo.png',
    doorOpening: false  // 门是否正在打开
  },

  onLoad() {
    // 可以从全局配置中获取信息
    if (app.globalData.siteInfo) {
      this.setData({
        appName: app.globalData.siteInfo.name,
        appDesc: app.globalData.siteInfo.description
      })
    }
  },

  /**
   * 进入小程序
   */
  handleEnter() {
    // 防止重复点击
    if (this.data.doorOpening) return

    // 触发开门动画
    this.setData({ doorOpening: true })

    // 标记已访问
    wx.setStorageSync('hasVisited', true)

    // 等待动画完成后跳转（1秒动画时间）
    setTimeout(() => {
      wx.switchTab({
        url: '/pages/home/home'
      })
    }, 1000)
  }
})
