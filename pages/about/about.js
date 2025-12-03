// pages/about/about.js
const app = getApp()
const api = require('../../utils/api')
const { copyToClipboard } = require('../../utils/util')

Page({
  data: {
    // 小程序版本号
    version: '2.5.0',

    // 个人信息（初始值会被 globalData 覆盖）
    profile: {
      avatar: '/assets/avatar.png',
      name: '',
      description: ''
    },

    // 网站统计
    stats: {
      postsCount: 0,
      categoriesCount: 0,
      tagsCount: 0,
      viewsCount: 0
    },

    // 联系方式
    contacts: {
      qq: '',
      wechat: '',
      github: '',
      gitee: '',
      blog: 'https://www.yeyhome.com',
      email: ''
    },

    loading: true
  },

  onLoad() {
    this.loadProfile()
    this.loadStats()
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    Promise.all([
      this.loadProfile(),
      this.loadStats()
    ]).then(() => {
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 加载个人资料
   * 从 app.js 的 globalData.siteInfo 获取配置
   */
  async loadProfile() {
    try {
      // 从全局配置获取
      const siteInfo = app.globalData.siteInfo || {}

      this.setData({
        profile: {
          avatar: siteInfo.avatar || '/assets/avatar.png',
          name: siteInfo.name || '博主',
          description: siteInfo.description || '欢迎来到我的博客'
        },
        contacts: siteInfo.contacts || this.data.contacts
      })

      console.log('关于页面信息已加载:', this.data.profile)

      // 可选：也可以从 API 获取关于页面内容
      // const res = await api.getPage('about')
      // 解析页面内容中的个人信息...

    } catch (error) {
      console.error('加载个人资料失败:', error)
    }
  },

  /**
   * 加载统计数据
   */
  async loadStats() {
    try {
      this.setData({ loading: true })

      console.log('========== 开始加载统计数据 ==========')

      // 获取所有文章（用于计算阅读量总和）、分类、标签
      const [allPosts, categories, tags] = await Promise.all([
        api.getPosts({ pageSize: 100 }),  // 获取较多文章用于计算阅读量
        api.getCategories(),
        api.getTags()
      ])

      console.log('文章API响应:', allPosts)

      // 解析文章总数
      let postsCount = 0
      let postsList = []

      if (allPosts.data && allPosts.data.count !== undefined) {
        postsCount = allPosts.data.count
      }
      if (allPosts.data && allPosts.data.dataSet && Array.isArray(allPosts.data.dataSet)) {
        postsList = allPosts.data.dataSet
      } else if (allPosts.data && Array.isArray(allPosts.data)) {
        postsList = allPosts.data
        postsCount = postsCount || postsList.length
      }

      // 计算所有文章阅读量之和
      let totalViews = 0
      postsList.forEach(post => {
        totalViews += parseInt(post.views) || 0
      })

      console.log('文章阅读量总和:', totalViews)

      // 根据访客数量设置颜色类名
      let viewsColorClass = 'views-low'
      if (totalViews >= 10000) {
        viewsColorClass = 'views-high'
      } else if (totalViews >= 1000) {
        viewsColorClass = 'views-medium'
      } else if (totalViews >= 100) {
        viewsColorClass = 'views-normal'
      }

      // 解析分类数量
      let categoriesData = categories.data || categories
      let categoriesCount = Array.isArray(categoriesData) ? categoriesData.length : 0

      // 解析标签数量
      let tagsData = tags.data || tags
      let tagsCount = Array.isArray(tagsData) ? tagsData.length : 0

      console.log('解析结果 - 文章数:', postsCount, '分类数:', categoriesCount, '标签数:', tagsCount, '访客数:', totalViews)

      this.setData({
        stats: {
          postsCount: postsCount,
          categoriesCount: categoriesCount,
          tagsCount: tagsCount,
          totalViews: totalViews,
          viewsColorClass: viewsColorClass
        },
        loading: false
      })

      console.log('========== 统计数据加载完成 ==========')

    } catch (error) {
      console.error('加载统计失败:', error)
      this.setData({ loading: false })
    }
  },

  /**
   * 前往归档页面
   */
  handleArchive() {
    wx.navigateTo({
      url: '/pages/archive/archive'
    })
  },

  /**
   * 前往标签云页面
   */
  handleTags() {
    wx.navigateTo({
      url: '/pages/tags/tags'
    })
  },

  /**
   * 前往关于项目页面
   */
  handleProject() {
    wx.navigateTo({
      url: '/pages/project/project'
    })
  },

  /**
   * 前往收藏页面
   */
  handleFavorites() {
    wx.navigateTo({
      url: '/pages/favorites/favorites'
    })
  },

  /**
   * 复制联系方式
   */
  handleCopyContact(e) {
    console.log('点击了联系方式')
    const { type, value } = e.currentTarget.dataset
    console.log('联系方式类型:', type, '值:', value)

    if (!value) {
      console.warn('联系方式值为空')
      wx.showToast({
        title: '暂无此联系方式',
        icon: 'none'
      })
      return
    }

    const typeNames = {
      qq: 'QQ号',
      wechat: '微信号',
      github: 'GitHub地址',
      gitee: 'Gitee地址',
      blog: '博客地址',
      email: '邮箱地址'
    }

    wx.setClipboardData({
      data: value,
      success: () => {
        console.log('复制成功:', value)
        wx.showToast({
          title: `${typeNames[type]}已复制`,
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
      title: '关于我',
      path: '/pages/about/about'
    }
  }
})
