// app.js
App({
  onLaunch() {
    // 检查是否首次启动
    const hasVisited = wx.getStorageSync('hasVisited')
    if (!hasVisited) {
      // 首次启动，跳转到启动页
      wx.reLaunch({
        url: '/pages/splash/splash'
      })
    }
  },

  globalData: {
    // API 基础地址（未开启伪静态需要加 /index.php）
    apiBase: 'https://www.yeyhome.com/index.php/api',
    // API Token（如果需要认证）
    apiToken: '后台插件的token',
    // 网站地址
    siteUrl: 'https://www.yeyhome.com',
    // 网站信息（可在关于页配置）
    siteInfo: {
      name: '夜影小窝',
      description: '热爱技术，喜欢分享 - 90后，从事弱电安防智能化工程，包含监控系统、楼宇对讲系统、LED系统、广播音箱系统、停车场系统。喜欢捣鼓有趣的代码。',
      avatar: '/assets/avatar.png',
      contacts: {
        qq: '327982852',
        wechat: 'daidonghailove',
        github: 'https://github.com/yeyinghai',
        gitee: '',
        blog: 'https://www.yeyhome.com',
        email: 'ddh6126459@126.com'
      }
    }
  }
})
