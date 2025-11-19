// pages/archive/archive.js
const api = require('../../utils/api')

Page({
  data: {
    archives: [],
    loading: true,
    expandedMonth: '' // 当前展开的月份
  },

  onLoad() {
    this.loadArchives()
  },

  async loadArchives() {
    try {
      this.setData({ loading: true })

      console.log('========== 开始加载归档 ==========')
      // 获取所有文章并按月份分组
      const res = await api.getPosts({ pageSize: 100 })
      console.log('API 响应数据:', res)

      // 解析文章列表 - 支持多种数据格式
      let posts = []
      if (Array.isArray(res)) {
        posts = res
      } else if (res.data && res.data.dataSet && Array.isArray(res.data.dataSet)) {
        posts = res.data.dataSet
      } else if (res.data && Array.isArray(res.data)) {
        posts = res.data
      } else if (res.dataSet && Array.isArray(res.dataSet)) {
        posts = res.dataSet
      }

      console.log('解析后的文章数量:', posts.length)

      if (!Array.isArray(posts)) {
        throw new Error('文章数据格式错误，不是数组')
      }

      // 按月份分组
      const archiveMap = {}
      posts.forEach(post => {
        // 处理时间戳 - 可能是秒或毫秒
        const timestamp = post.created || post.date || post.timestamp || 0
        const date = new Date(timestamp > 9999999999 ? timestamp : timestamp * 1000)
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

        if (!archiveMap[key]) {
          archiveMap[key] = {
            month: key,
            posts: []
          }
        }

        // 确保文章有 ID
        post.id = post.cid || post.id

        // 格式化日期为可读格式
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        post.formattedDate = `${year}-${month}-${day}`

        archiveMap[key].posts.push(post)
      })

      const archives = Object.values(archiveMap).sort((a, b) => b.month.localeCompare(a.month))

      console.log('归档数据:', archives.length, '个月份')

      // 默认展开当前月份
      const now = new Date()
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

      // 如果当前月份存在，展开它；否则展开第一个月份
      const defaultExpanded = archives.find(item => item.month === currentMonth)
        ? currentMonth
        : (archives.length > 0 ? archives[0].month : '')

      this.setData({
        archives,
        loading: false,
        expandedMonth: defaultExpanded
      })

      console.log('默认展开月份:', defaultExpanded)
    } catch (error) {
      console.error('加载归档失败:', error)
      this.setData({ loading: false })
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  /**
   * 切换月份展开/收起
   */
  toggleMonth(e) {
    const { month } = e.currentTarget.dataset
    this.setData({
      expandedMonth: this.data.expandedMonth === month ? '' : month
    })
  },

  handlePostTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/article/article?id=${id}`
    })
  }
})
