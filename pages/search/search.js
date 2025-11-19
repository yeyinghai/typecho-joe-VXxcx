// pages/search/search.js
const api = require('../../utils/api')
const { debounce } = require('../../utils/util')

Page({
  data: {
    keyword: '',
    searchResults: [],
    loading: false,
    searched: false,
    page: 1,
    hasMore: true,

    // 搜索历史
    searchHistory: [],

    // 最新文章
    latestPosts: []
  },

  onLoad() {
    // 加载搜索历史
    const history = wx.getStorageSync('searchHistory') || []
    this.setData({ searchHistory: history })

    // 加载最新文章
    this.loadLatestPosts()
  },

  /**
   * 加载最新文章
   */
  async loadLatestPosts() {
    try {
      console.log('========== 加载最新文章 ==========')
      const res = await api.getPosts({ page: 1, pageSize: 3 })
      console.log('最新文章 API 返回:', res)

      // 解析文章列表
      let posts = []
      if (Array.isArray(res)) {
        posts = res
      } else if (res.data && res.data.dataSet && Array.isArray(res.data.dataSet)) {
        posts = res.data.dataSet
      } else if (res.data && Array.isArray(res.data)) {
        posts = res.data
      }

      console.log('解析后的最新文章数量:', posts.length)

      // 处理文章数据
      posts = posts.map((post, index) => {
        console.log(`\n========== 处理文章 ${index + 1}: ${post.title} ==========`)

        // 统一 ID
        post.id = post.cid || post.id
        console.log('文章 ID:', post.id)

        // 打印原始数据
        console.log('原始 thumbnail:', post.thumbnail)
        console.log('原始 thumb:', post.thumb)
        console.log('原始 image:', post.image)
        console.log('原始 cover:', post.cover)
        console.log('fields.thumb:', post.fields?.thumb)

        // 提取图片 - 优化逻辑
        let thumbnail = post.thumbnail || post.thumb || post.image || post.cover

        // 如果是对象，尝试提取 URL
        if (thumbnail && typeof thumbnail === 'object') {
          console.log('thumbnail 是对象:', thumbnail)
          thumbnail = thumbnail.url || thumbnail.src || thumbnail.path || ''
          console.log('从对象提取的 URL:', thumbnail)
        }

        // 从 fields 中提取
        if (!thumbnail && post.fields && post.fields.thumb) {
          const thumbField = post.fields.thumb
          console.log('从 fields.thumb 提取, 类型:', typeof thumbField, '值:', thumbField)
          if (typeof thumbField === 'string') {
            thumbnail = thumbField
          } else if (thumbField && typeof thumbField === 'object') {
            thumbnail = thumbField.value || thumbField.url || thumbField.src || ''
          }
        }

        // 从内容中提取第一张图片
        if (!thumbnail && (post.digest || post.content)) {
          const content = post.digest || post.content
          console.log('尝试从内容提取图片, 内容长度:', content?.length)
          const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i)
          if (imgMatch && imgMatch[1]) {
            thumbnail = imgMatch[1]
            console.log('从内容提取的图片:', thumbnail)
          }
        }

        // 确保 thumbnail 是字符串
        post.thumbnail = (typeof thumbnail === 'string' && thumbnail.trim()) ? thumbnail : ''
        console.log('最终 thumbnail:', post.thumbnail)

        // 格式化日期
        if (post.created) {
          const timestamp = post.created > 9999999999 ? post.created : post.created * 1000
          const date = new Date(timestamp)
          post.created = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        }

        return post
      })

      this.setData({ latestPosts: posts })
    } catch (error) {
      console.error('加载最新文章失败:', error)
    }
  },

  /**
   * 输入搜索关键词
   */
  handleInput(e) {
    const keyword = e.detail.value.trim()
    this.setData({ keyword })

    // 防抖搜索
    if (keyword) {
      this.debouncedSearch()
    }
  },

  /**
   * 防抖搜索
   */
  debouncedSearch: debounce(function() {
    this.handleSearch()
  }, 500),

  /**
   * 点击搜索按钮
   */
  handleSearchButton() {
    if (!this.data.keyword.trim()) {
      wx.showToast({
        title: '请输入搜索关键词',
        icon: 'none'
      })
      return
    }
    this.handleSearch()
  },

  /**
   * 执行搜索
   */
  async handleSearch() {
    const { keyword } = this.data

    if (!keyword.trim()) return

    try {
      this.setData({
        loading: true,
        searched: true,
        page: 1,
        searchResults: [],
        hasMore: true
      })

      console.log('========== 开始搜索 ==========')
      console.log('搜索关键词:', keyword)
      console.log('搜索参数: filterType=search, filterSlug=' + keyword)

      const res = await api.searchPosts(keyword, 1, 10)
      console.log('搜索 API 返回:', res)

      // 解析搜索结果 - 支持多种数据格式
      let results = []
      if (Array.isArray(res)) {
        results = res
      } else if (res.data && res.data.dataSet && Array.isArray(res.data.dataSet)) {
        results = res.data.dataSet
      } else if (res.data && Array.isArray(res.data)) {
        results = res.data
      }

      console.log('解析后的搜索结果数量:', results.length)

      // 处理搜索结果数据
      results = results.map(post => {
        // 统一 ID
        post.id = post.cid || post.id

        // 处理摘要
        if (!post.excerpt && post.digest) {
          post.excerpt = post.digest
        }
        if (!post.excerpt && post.content) {
          // 从内容中提取纯文本作为摘要
          post.excerpt = post.content.replace(/<[^>]+>/g, '').substring(0, 100) + '...'
        }

        // 格式化日期
        if (post.created) {
          const timestamp = post.created > 9999999999 ? post.created : post.created * 1000
          const date = new Date(timestamp)
          post.created = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        }

        return post
      })

      this.setData({
        searchResults: results,
        loading: false,
        page: 2,
        hasMore: results.length >= 10
      })

      console.log('搜索完成，结果数:', results.length)

      // 保存到搜索历史
      this.saveSearchHistory(keyword)

    } catch (error) {
      console.error('搜索失败:', error)
      console.error('错误详情:', error.message, error.stack)
      this.setData({ loading: false })
      wx.showToast({
        title: '搜索失败: ' + error.message,
        icon: 'none',
        duration: 3000
      })
    }
  },

  /**
   * 加载更多搜索结果
   */
  async loadMore() {
    if (!this.data.hasMore || this.data.loading) return

    const { keyword, page } = this.data

    try {
      this.setData({ loading: true })

      const res = await api.searchPosts(keyword, page, 10)

      // 解析数据
      let newResults = []
      if (Array.isArray(res)) {
        newResults = res
      } else if (res.data && res.data.dataSet && Array.isArray(res.data.dataSet)) {
        newResults = res.data.dataSet
      } else if (res.data && Array.isArray(res.data)) {
        newResults = res.data
      }

      // 处理数据
      newResults = newResults.map(post => {
        post.id = post.cid || post.id
        if (!post.excerpt && post.digest) {
          post.excerpt = post.digest
        }
        if (!post.excerpt && post.content) {
          post.excerpt = post.content.replace(/<[^>]+>/g, '').substring(0, 100) + '...'
        }
        return post
      })

      this.setData({
        searchResults: [...this.data.searchResults, ...newResults],
        page: page + 1,
        hasMore: newResults.length >= 10,
        loading: false
      })
    } catch (error) {
      console.error('加载更多失败:', error)
      this.setData({ loading: false })
    }
  },

  /**
   * 页面触底
   */
  onReachBottom() {
    this.loadMore()
  },

  /**
   * 保存搜索历史
   */
  saveSearchHistory(keyword) {
    let history = this.data.searchHistory.filter(item => item !== keyword)
    history.unshift(keyword)
    history = history.slice(0, 10) // 最多保存10条

    this.setData({ searchHistory: history })
    wx.setStorageSync('searchHistory', history)
  },

  /**
   * 点击历史记录
   */
  handleHistoryTap(e) {
    const { keyword } = e.currentTarget.dataset
    this.setData({ keyword })
    this.handleSearch()
  },

  /**
   * 清空搜索历史
   */
  handleClearHistory() {
    wx.showModal({
      title: '提示',
      content: '确定清空搜索历史吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ searchHistory: [] })
          wx.removeStorageSync('searchHistory')
          wx.showToast({
            title: '已清空',
            icon: 'success'
          })
        }
      }
    })
  },

  /**
   * 清空搜索框
   */
  handleClearInput() {
    this.setData({
      keyword: '',
      searchResults: [],
      searched: false
    })

    // 重新加载最新文章（如果之前没有加载）
    if (this.data.latestPosts.length === 0) {
      this.loadLatestPosts()
    }
  },

  /**
   * 查看文章详情
   */
  handlePostTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/article/article?id=${id}`
    })
  },

  /**
   * 分享
   */
  onShareAppMessage() {
    return {
      title: '搜索文章',
      path: '/pages/search/search'
    }
  }
})
