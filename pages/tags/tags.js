// pages/tags/tags.js
const api = require('../../utils/api')

Page({
  data: {
    tags: [],
    loading: true
  },

  onLoad() {
    this.loadTags()
  },

  async loadTags() {
    try {
      this.setData({ loading: true })
      console.log('开始加载标签')

      const res = await api.getTags()
      console.log('标签 API 返回:', res)

      // 解析数据格式
      let tags = []
      if (Array.isArray(res)) {
        tags = res
      } else if (res.data && res.data.dataSet && Array.isArray(res.data.dataSet)) {
        tags = res.data.dataSet
      } else if (res.data && Array.isArray(res.data)) {
        tags = res.data
      } else if (res.list && Array.isArray(res.list)) {
        tags = res.list
      }

      // 添加随机字体大小（标签云效果）
      tags = tags.map(tag => ({
        ...tag,
        fontSize: 12 + Math.random() * 8
      }))

      console.log('解析后的标签数量:', tags.length)
      if (tags.length > 0) {
        console.log('第一个标签:', tags[0])
      }

      this.setData({
        tags,
        loading: false
      })

      // 保存标签数据到全局，供文章详情页使用
      const app = getApp()
      app.globalData.allTags = tags

    } catch (error) {
      console.error('加载标签失败:', error)
      this.setData({ loading: false })
    }
  },

  handleTagTap(e) {
    const { id, slug, name } = e.currentTarget.dataset
    console.log('点击标签:', { id, slug, name })

    // 跳转到标签文章列表页面
    wx.navigateTo({
      url: `/pages/tag-posts/tag-posts?slug=${slug}&name=${encodeURIComponent(name)}`
    })
  }
})
