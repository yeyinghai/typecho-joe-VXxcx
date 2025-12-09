// pages/links/links.js
const api = require('../../utils/api')

Page({
  data: {
    links: [],
    loading: true,
    // 我的站点信息
    mySite: {
      name: '夜影小窝',
      url: 'https://www.yeyhome.com/',
      logo: 'https://www.yeyhome.com/image/logo.png',
      description: '学习感兴趣的，分享有趣的，收集自己使用过程中遇到问题的解决方法。'
    }
  },

  onLoad() {
    this.loadLinks()
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadLinks().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 加载友情链接
   * 直接从 API 获取友链数据
   */
  async loadLinks() {
    try {
      this.setData({ loading: true })

      console.log('========== 开始加载友链 ==========')

      // 调用友链API
      const res = await api.getLinks()
      console.log('友链API返回:', res)

      // 解析友链数据
      let links = []

      // 情况1：数据在 res.data.dataSet 中（Typecho REST API 标准格式）
      if (res.data && res.data.dataSet && Array.isArray(res.data.dataSet)) {
        links = res.data.dataSet
      }
      // 情况2：API直接返回数组
      else if (Array.isArray(res)) {
        links = res
      }
      // 情况3：数据在 res.data 中
      else if (res.data && Array.isArray(res.data)) {
        links = res.data
      }
      // 情况4：数据在 res.data.list 中
      else if (res.data && res.data.list && Array.isArray(res.data.list)) {
        links = res.data.list
      }
      // 情况5：数据在 res.links 中
      else if (res.links && Array.isArray(res.links)) {
        links = res.links
      }

      // 处理字段名差异：统一 avatar 和 logo
      links = links.map(link => ({
        name: link.name,
        url: link.url,
        description: link.description || '',
        avatar: link.avatar || link.logo || ''  // 兼容 avatar 和 logo 字段
      }))

      console.log('解析后的友链数量:', links.length)
      console.log('友链数据:', links)

      this.setData({
        links,
        loading: false
      })

      if (links.length === 0) {
        wx.showToast({
          title: '暂无友链数据',
          icon: 'none'
        })
      }

      console.log('========== 友链加载完成 ==========')

    } catch (error) {
      console.error('加载友链失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
      this.setData({
        loading: false,
        links: []
      })
    }
  },

  /**
   * 复制站点信息
   */
  handleCopyInfo(e) {
    console.log('点击了复制全部信息')
    const { mySite } = this.data
    console.log('站点信息:', mySite)

    // 格式化站点信息
    const info = `站点名称：${mySite.name}
站点网址：${mySite.url}
站点Logo：${mySite.logo}
个人描述：${mySite.description}`

    console.log('准备复制的内容:', info)

    wx.setClipboardData({
      data: info,
      success: () => {
        console.log('复制成功')
        wx.showToast({
          title: '站点信息已复制',
          icon: 'success',
          duration: 2000
        })
      },
      fail: (err) => {
        console.error('复制失败:', err)
        wx.showToast({
          title: '复制失败，请重试',
          icon: 'none'
        })
      }
    })
  },

  /**
   * 点击友链 - 直接复制链接
   */
  handleLinkTap(e) {
    console.log('点击了友链')
    const { url, name } = e.currentTarget.dataset
    console.log('友链名称:', name, '链接:', url)

    if (!url) {
      console.warn('友链URL为空')
      wx.showToast({
        title: '链接地址为空',
        icon: 'none'
      })
      return
    }

    // 直接复制链接，不弹出确认框
    wx.setClipboardData({
      data: url,
      success: () => {
        console.log('复制成功:', url)
        wx.showToast({
          title: `${name} 的链接已复制`,
          icon: 'success',
          duration: 2000
        })
      },
      fail: (err) => {
        console.error('复制失败:', err)
        wx.showToast({
          title: '复制失败，请重试',
          icon: 'none'
        })
      }
    })
  },

  /**
   * 分享
   */
  onShareAppMessage() {
    return {
      title: '友情链接',
      path: '/pages/links/links'
    }
  }
})
