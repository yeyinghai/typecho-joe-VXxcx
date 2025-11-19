// pages/category/category.js
const api = require('../../utils/api')

Page({
  data: {
    // 分类列表
    categories: [],
    categoriesLoading: true,

    // 当前选中的分类
    activeCategory: null,

    // 当前分类的文章
    posts: [],
    postsLoading: false,
    page: 1,
    hasMore: true
  },

  onLoad(options) {
    this.loadCategories()

    // 如果从首页传递了分类ID
    if (options.id) {
      this.setData({ activeCategory: options.id })
    }
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadCategories().then(() => {
      if (this.data.activeCategory) {
        this.loadCategoryPosts(this.data.activeCategory, true)
      }
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 加载分类列表
   */
  async loadCategories() {
    try {
      this.setData({ categoriesLoading: true })
      console.log('========== 开始加载分类 ==========')

      const res = await api.getCategories()
      console.log('分类 API 返回:', res)

      // 解析数据格式
      let categories = []
      if (Array.isArray(res)) {
        categories = res
      } else if (res.data && res.data.dataSet && Array.isArray(res.data.dataSet)) {
        categories = res.data.dataSet
      } else if (res.data && Array.isArray(res.data)) {
        categories = res.data
      } else if (res.list && Array.isArray(res.list)) {
        categories = res.list
      }

      console.log('解析后的分类数量:', categories.length)
      if (categories.length > 0) {
        console.log('第一个分类:', categories[0])
      }

      this.setData({
        categories,
        categoriesLoading: false
      })

      // 如果没有选中分类，默认选中第一个
      if (!this.data.activeCategory && categories.length > 0) {
        const firstCategoryId = categories[0].mid || categories[0].id || categories[0].cid
        console.log('自动选中第一个分类, ID:', firstCategoryId)

        this.setData({ activeCategory: firstCategoryId })
        this.loadCategoryPosts(firstCategoryId, true)
      } else if (this.data.activeCategory) {
        // 如果已有选中的分类，加载该分类的文章
        console.log('加载已选中的分类文章, ID:', this.data.activeCategory)
        this.loadCategoryPosts(this.data.activeCategory, true)
      }
    } catch (error) {
      console.error('加载分类失败:', error)
      this.setData({ categoriesLoading: false })
    }
  },

  /**
   * 选择分类
   */
  handleCategoryTap(e) {
    const { id } = e.currentTarget.dataset
    console.log('点击分类, ID:', id, '当前选中:', this.data.activeCategory)

    // 使用 == 而不是 === 来比较（因为可能是字符串和数字的比较）
    if (id == this.data.activeCategory) {
      console.log('已经是当前分类，跳过')
      return
    }

    this.setData({
      activeCategory: id,
      posts: [],
      page: 1,
      hasMore: true
    })

    this.loadCategoryPosts(id, true)
  },

  /**
   * 加载分类文章
   */
  async loadCategoryPosts(categoryId, reset = false) {
    if (this.data.postsLoading) {
      console.log('文章正在加载中，跳过')
      return
    }

    try {
      const page = reset ? 1 : this.data.page
      console.log(`========== 加载分类 ${categoryId} 的文章 ==========`)
      console.log('页码:', page, '是否重置:', reset)

      this.setData({ postsLoading: true })

      const res = await api.getCategoryPosts(categoryId, page)
      console.log('分类文章 API 返回:', res)

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

      // 处理文章数据，提取图片和其他字段
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

      const allPosts = reset ? newPosts : [...this.data.posts, ...newPosts]
      console.log('总文章数量:', allPosts.length)

      this.setData({
        posts: allPosts,
        page: page + 1,
        hasMore: newPosts.length >= 10,
        postsLoading: false
      })

      console.log('========== 文章加载完成 ==========')
    } catch (error) {
      console.error('加载文章失败:', error)
      this.setData({ postsLoading: false })
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  /**
   * 滚动到底部加载更多
   */
  handleScrollToLower() {
    if (this.data.hasMore && !this.data.postsLoading && this.data.activeCategory) {
      this.loadCategoryPosts(this.data.activeCategory, false)
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
      title: '文章分类',
      path: '/pages/category/category'
    }
  }
})
