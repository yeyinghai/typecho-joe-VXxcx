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
    const { value, label, cancopy } = e.currentTarget.dataset

    if (!cancopy) {
      wx.showToast({
        title: '此项不支持复制',
        icon: 'none'
      })
      return
    }

    if (!value) {
      wx.showToast({
        title: '暂无信息',
        icon: 'none'
      })
      return
    }

    copyToClipboard(value).then(() => {
      wx.showToast({
        title: `${label}已复制`,
        icon: 'success'
      })
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
