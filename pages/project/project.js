// pages/project/project.js
const { copyToClipboard } = require('../../utils/util')

Page({
  data: {
    // 项目信息
    project: {
      logo: '/assets/logo.png',
      name: 'Typecho 微信小程序'
    },

    // 项目详情
    info: [
      {
        label: '开源组织',
        value: '夜影',
        icon: '🏢',
        canCopy: false
      },
      {
        label: '开源作者',
        value: '代东海',
        icon: '👤',
        canCopy: false
      },
      {
        label: '作者博客',
        value: 'https://www.yeyhome.com',
        icon: '🌐',
        canCopy: true
      },
      {
        label: 'Github库',
        value: 'https://github.com/yeyinghai/typecho-joe-VXxcx',
        icon: '📦',
        canCopy: true
      }
    ]
  },

  /**
   * 复制信息
   */
  handleCopy(e) {
    console.log('点击了项目信息')
    const { value, label, cancopy } = e.currentTarget.dataset
    console.log('项目信息 - 标签:', label, '值:', value, '可复制:', cancopy)

    // 检查是否支持复制
    if (!cancopy) {
      console.warn('此项不支持复制')
      wx.showToast({
        title: '此项不支持复制',
        icon: 'none'
      })
      return
    }

    // 检查值是否为空
    if (!value) {
      console.warn('值为空')
      wx.showToast({
        title: '暂无信息',
        icon: 'none'
      })
      return
    }

    // 执行复制
    wx.setClipboardData({
      data: value,
      success: () => {
        console.log('复制成功:', value)
        wx.showToast({
          title: `${label}已复制`,
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
      title: '关于项目 - Typecho 微信小程序',
      path: '/pages/project/project'
    }
  }
})
