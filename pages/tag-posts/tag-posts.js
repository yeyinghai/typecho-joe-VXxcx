// pages/tag-posts/tag-posts.js
const api = require('../../utils/api')

Page({
  data: {
    tagSlug: '',
    tagName: '',
    posts: [],
    loading: false,
    page: 1,
    hasMore: true
  },

  onLoad(options) {
    const { slug, name } = options
    if (slug && name) {
      this.setData({
        tagSlug: slug,
        tagName: decodeURIComponent(name)
      })

      // 设置导航栏标题
      wx.setNavigationBarTitle({
        title: `标签: ${decodeURIComponent(name)}`
      })

      this.loadPosts()
    }
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.setData({
      page: 1,
      posts: [],
      hasMore: true
    })

    this.loadPosts().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 上拉加载更多
   */
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadPosts()
    }
  },

  /**
   * 加载文章列表
   */
  async loadPosts() {
    if (this.data.loading) return

    try {
      console.log('========== 开始加载标签文章 ==========')
      console.log('标签 slug:', this.data.tagSlug)
      console.log('页码:', this.data.page)

      this.setData({ loading: true })

      const { tagSlug, page } = this.data
      const res = await api.getTagPosts(tagSlug, page, 10)

      console.log('API 返回:', res)

      // 解析数据格式
      let newPosts = []
      if (Array.isArray(res)) {
        newPosts = res
      } else if (res.data && res.data.dataSet && Array.isArray(res.data.dataSet)) {
        newPosts = res.data.dataSet
      } else if (res.data && Array.isArray(res.data)) {
        newPosts = res.data
      } else if (res.list && Array.isArray(res.list)) {
        newPosts = res.list
      }

      console.log('获取到文章数量:', newPosts.length)

      // 处理文章数据
      const app = getApp()
      newPosts = newPosts.map(post => {
        // 提取缩略图
        let thumbnail = post.thumbnail || post.thumb || post.image || post.cover

        if (!thumbnail && post.fields && post.fields.thumb) {
          thumbnail = post.fields.thumb.value || post.fields.thumb
        }

        if (thumbnail && typeof thumbnail === 'object') {
          thumbnail = thumbnail.url || thumbnail.src || thumbnail.path
        }

        // 从内容中提取第一张图片
        if (!thumbnail && (post.digest || post.content)) {
          const content = post.digest || post.content
          const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i)
          if (imgMatch && imgMatch[1]) {
            thumbnail = imgMatch[1]
          }
        }

        // 如果仍然没有缩略图，使用随机图片
        if (!thumbnail) {
          const postId = post.cid || post.id || Math.random()
          thumbnail = `${app.globalData.randomImageUrl}?id=${postId}`
        }

        // 提取摘要
        let excerpt = post.excerpt || post.description || post.summary
        if (!excerpt && post.digest) {
          excerpt = post.digest.replace(/<[^>]+>/g, '').substring(0, 150)
        }
        if (!excerpt && post.fields && post.fields.description) {
          excerpt = post.fields.description.value || post.fields.description
        }

        return {
          ...post,
          id: post.cid || post.id,
          thumbnail,
          excerpt,
          created: post.date && post.date.year ?
            `${post.date.year}-${post.date.month}-${post.date.day}` :
            post.created
        }
      })

      const allPosts = page === 1 ? newPosts : [...this.data.posts, ...newPosts]

      this.setData({
        posts: allPosts,
        page: page + 1,
        hasMore: newPosts.length >= 10,
        loading: false
      })

      console.log('✅ 标签文章加载完成，总数:', allPosts.length)

    } catch (error) {
      console.error('❌ 加载标签文章失败:', error)
      this.setData({ loading: false })
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
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
      title: `标签: ${this.data.tagName}`,
      path: `/pages/tag-posts/tag-posts?slug=${this.data.tagSlug}&name=${encodeURIComponent(this.data.tagName)}`
    }
  }
})
