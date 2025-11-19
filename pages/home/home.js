// pages/home/home.js
const api = require('../../utils/api')
const { timeAgo, stripHtml, truncate } = require('../../utils/util')

Page({
  data: {
    // 推荐文章
    featuredPosts: [],
    featuredLoading: true,

    // 分类统计
    categories: [],
    categoriesLoading: true,

    // 文章列表
    posts: [],
    postsLoading: false,  // 改为 false，否则会阻止加载
    page: 1,
    hasMore: true,

    // 瀑布流相关
    leftPosts: [],
    rightPosts: []
  },

  onLoad() {
    this.loadFeaturedPosts()
    this.loadCategories()
    this.loadPosts()
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.setData({
      page: 1,
      posts: [],
      leftPosts: [],
      rightPosts: [],
      hasMore: true
    })

    Promise.all([
      this.loadFeaturedPosts(),
      this.loadCategories(),
      this.loadPosts()
    ]).then(() => {
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 上拉加载更多
   */
  onReachBottom() {
    if (this.data.hasMore && !this.data.postsLoading) {
      this.loadPosts()
    }
  },

  /**
   * 加载推荐文章（随机5篇）
   */
  async loadFeaturedPosts() {
    try {
      this.setData({ featuredLoading: true })
      console.log('开始加载随机推荐文章')

      // 获取较多的文章用于随机选择
      const res = await api.getPosts({ page: 1, pageSize: 50 })
      console.log('文章列表 API 返回:', res)

      // 尝试多种数据格式
      let allPosts = []
      if (Array.isArray(res)) {
        // 直接是数组
        allPosts = res
      } else if (res.data && res.data.dataSet && Array.isArray(res.data.dataSet)) {
        // Typecho REST API 格式: res.data.dataSet
        allPosts = res.data.dataSet
      } else if (res.data && Array.isArray(res.data)) {
        // data 字段是数组
        allPosts = res.data
      } else if (res.data && res.data.list && Array.isArray(res.data.list)) {
        // data.list 是数组
        allPosts = res.data.list
      } else if (res.list && Array.isArray(res.list)) {
        // list 字段是数组
        allPosts = res.list
      }

      console.log('获取到的文章总数:', allPosts.length)

      // 随机打乱数组并取前5篇
      const shuffled = this.shuffleArray([...allPosts])
      const featuredPosts = shuffled.slice(0, 5)

      // 处理文章数据，提取图片字段
      const processedPosts = featuredPosts.map(post => {
        // 提取缩略图
        let thumbnail = post.thumbnail || post.thumb || post.image || post.cover

        // 如果没有缩略图，尝试从 fields.thumb.value 中提取
        if (!thumbnail && post.fields && post.fields.thumb) {
          thumbnail = post.fields.thumb.value || post.fields.thumb
        }

        // 如果 thumbnail 是对象，提取 url 字段
        if (thumbnail && typeof thumbnail === 'object') {
          thumbnail = thumbnail.url || thumbnail.src || thumbnail.path
        }

        // 如果还是没有缩略图，从文章内容中提取第一张图片
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
          // 从 digest 中提取纯文本作为摘要（去除 HTML 标签）
          excerpt = post.digest.replace(/<[^>]+>/g, '').substring(0, 100)
        }
        // 如果还是没有，从 fields.description 提取
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

      console.log('随机选择的推荐文章:', processedPosts.length, '篇')
      if (processedPosts[0]) {
        console.log('第一篇文章:', processedPosts[0].title)
      }

      this.setData({
        featuredPosts: processedPosts,
        featuredLoading: false
      })
    } catch (error) {
      console.error('加载推荐文章失败:', error)
      console.error('错误详情:', error.message)
      this.setData({ featuredLoading: false })
    }
  },

  /**
   * 加载分类
   */
  async loadCategories() {
    try {
      this.setData({ categoriesLoading: true })
      console.log('开始加载分类')

      const res = await api.getCategories()
      console.log('分类 API 返回:', res)

      // 尝试多种数据格式
      let categories = []
      if (Array.isArray(res)) {
        categories = res
      } else if (res.data && res.data.dataSet && Array.isArray(res.data.dataSet)) {
        // Typecho REST API 格式: res.data.dataSet
        categories = res.data.dataSet
      } else if (res.data && Array.isArray(res.data)) {
        categories = res.data
      } else if (res.data && res.data.list && Array.isArray(res.data.list)) {
        categories = res.data.list
      } else if (res.list && Array.isArray(res.list)) {
        categories = res.list
      }

      // 根据文章数量为分类分配样式类
      categories = categories.map(cat => {
        const count = cat.count || 0
        let styleClass = ''

        if (count <= 5) {
          styleClass = 'style-1'
        } else if (count <= 15) {
          styleClass = 'style-2'
        } else if (count <= 30) {
          styleClass = 'style-3'
        } else if (count <= 50) {
          styleClass = 'style-4'
        } else {
          styleClass = 'style-5'
        }

        return {
          ...cat,
          styleClass
        }
      })

      console.log('解析后的分类:', categories.length, '个')

      this.setData({
        categories,
        categoriesLoading: false
      })
    } catch (error) {
      console.error('加载分类失败:', error)
      console.error('错误详情:', error.message)
      this.setData({ categoriesLoading: false })
    }
  },

  /**
   * 加载文章列表
   */
  async loadPosts() {
    if (this.data.postsLoading) {
      console.log('文章正在加载中，跳过重复请求')
      return
    }

    try {
      console.log('========== 开始加载文章 ==========')
      this.setData({ postsLoading: true })

      const { page } = this.data
      console.log('请求页码:', page)

      const res = await api.getPosts({ page, pageSize: 10 })
      console.log('✅ API 请求成功')
      console.log('API 返回完整数据:', JSON.stringify(res, null, 2))

      // 尝试多种数据格式
      let newPosts = []
      if (Array.isArray(res)) {
        console.log('数据格式: 直接数组')
        newPosts = res
      } else if (res.data && res.data.dataSet && Array.isArray(res.data.dataSet)) {
        console.log('数据格式: res.data.dataSet')
        newPosts = res.data.dataSet
      } else if (res.data && Array.isArray(res.data)) {
        console.log('数据格式: res.data')
        newPosts = res.data
      } else if (res.data && res.data.list && Array.isArray(res.data.list)) {
        console.log('数据格式: res.data.list')
        newPosts = res.data.list
      } else if (res.list && Array.isArray(res.list)) {
        console.log('数据格式: res.list')
        newPosts = res.list
      } else {
        console.error('❌ 无法识别的数据格式:', res)
      }

      console.log('原始文章数量:', newPosts.length)

      // 处理文章数据，提取图片和其他字段
      newPosts = newPosts.map((post, index) => {
        console.log(`处理第 ${index + 1} 篇文章:`, post.title)

        // 提取缩略图
        let thumbnail = post.thumbnail || post.thumb || post.image || post.cover

        // 如果没有缩略图，尝试从 fields.thumb.value 中提取
        if (!thumbnail && post.fields && post.fields.thumb) {
          thumbnail = post.fields.thumb.value || post.fields.thumb
        }

        // 如果 thumbnail 是对象，提取 url 字段
        if (thumbnail && typeof thumbnail === 'object') {
          thumbnail = thumbnail.url || thumbnail.src || thumbnail.path
        }

        // 如果还是没有缩略图，从文章内容中提取第一张图片
        if (!thumbnail && (post.digest || post.content)) {
          const content = post.digest || post.content
          const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i)
          if (imgMatch && imgMatch[1]) {
            thumbnail = imgMatch[1]
            console.log(`  从内容提取缩略图:`, thumbnail)
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

        const processed = {
          ...post,
          id: post.cid || post.id,
          thumbnail,
          excerpt,
          created: post.date && post.date.year ?
            `${post.date.year}-${post.date.month}-${post.date.day}` :
            post.created
        }

        console.log(`  处理后 - ID: ${processed.id}, 有图: ${!!thumbnail}`)
        return processed
      })

      console.log('处理后的文章数量:', newPosts.length)

      const allPosts = page === 1 ? newPosts : [...this.data.posts, ...newPosts]
      console.log('总文章数量:', allPosts.length)

      // 瀑布流布局
      console.log('开始瀑布流布局...')
      const { leftPosts, rightPosts } = this.layoutWaterfall(allPosts)
      console.log('瀑布流布局完成 - 左列:', leftPosts.length, '右列:', rightPosts.length)

      this.setData({
        posts: allPosts,
        leftPosts,
        rightPosts,
        page: page + 1,
        hasMore: newPosts.length >= 10,
        postsLoading: false
      })

      console.log('✅ 数据已设置到页面')
      console.log('postsLoading 已设置为:', false)
      console.log('========== 文章加载完成 ==========')
    } catch (error) {
      console.error('❌ 加载文章失败')
      console.error('错误类型:', error.name)
      console.error('错误信息:', error.message)
      console.error('错误堆栈:', error.stack)

      this.setData({ postsLoading: false })
      console.log('postsLoading 已设置为:', false)

      wx.showToast({
        title: '加载失败: ' + error.message,
        icon: 'none',
        duration: 3000
      })
    }
  },

  /**
   * Fisher-Yates 随机打乱数组算法
   */
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]
    }
    return array
  },

  /**
   * 瀑布流布局算法
   */
  layoutWaterfall(posts) {
    const leftPosts = []
    const rightPosts = []
    let leftHeight = 0
    let rightHeight = 0

    posts.forEach(post => {
      // 简单的高度估算（实际项目中可能需要更精确的计算）
      const estimatedHeight = 200 + (post.excerpt ? post.excerpt.length * 0.5 : 0)

      if (leftHeight <= rightHeight) {
        leftPosts.push(post)
        leftHeight += estimatedHeight
      } else {
        rightPosts.push(post)
        rightHeight += estimatedHeight
      }
    })

    return { leftPosts, rightPosts }
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
   * 查看分类
   */
  handleCategoryTap(e) {
    const { id } = e.currentTarget.dataset
    console.log('跳转到分类页面, ID:', id)

    wx.switchTab({
      url: '/pages/category/category',
      success: () => {
        // 通过全局事件传递分类ID
        setTimeout(() => {
          const pages = getCurrentPages()
          const categoryPage = pages[pages.length - 1]
          if (categoryPage && categoryPage.route === 'pages/category/category') {
            // 直接调用分类页面的方法来选择分类
            if (typeof categoryPage.handleCategoryTap === 'function') {
              categoryPage.handleCategoryTap({
                currentTarget: {
                  dataset: { id }
                }
              })
            }
          }
        }, 100)
      }
    })
  },

  /**
   * 分享
   */
  onShareAppMessage() {
    return {
      title: 'Yey Home - 个人博客',
      path: '/pages/home/home'
    }
  }
})
