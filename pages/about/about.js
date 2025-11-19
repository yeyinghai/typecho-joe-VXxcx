// pages/about/about.js
const app = getApp()
const api = require('../../utils/api')
const { copyToClipboard } = require('../../utils/util')

Page({
  data: {
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

      // 方式1：使用统计 API（如果你的 Typecho 有这个端点）
      // const res = await api.getSiteStats()
      // this.setData({ stats: res.data || res })

      // 方式2：分别获取各项统计
      const [posts, categories, tags] = await Promise.all([
        api.getPosts({ pageSize: 1 }),
        api.getCategories(),
        api.getTags()
      ])

      console.log('文章API响应:', posts)
      console.log('分类API响应:', categories)
      console.log('标签API响应:', tags)

      // 解析文章总数
      // API 返回格式: { status: "success", data: { total: 31, dataSet: [...] } }
      let postsCount = 0

      // 情况1: data.total（标准格式）
      if (posts.data && posts.data.total !== undefined) {
        postsCount = posts.data.total
      }
      // 情况2: data.count
      else if (posts.data && posts.data.count !== undefined) {
        postsCount = posts.data.count
      }
      // 情况3: data.totalCount
      else if (posts.data && posts.data.totalCount !== undefined) {
        postsCount = posts.data.totalCount
      }
      // 情况4: 直接在顶层
      else if (posts.total !== undefined) {
        postsCount = posts.total
      } else if (posts.count !== undefined) {
        postsCount = posts.count
      }
      // 情况5: 从数组长度推断
      else if (posts.data && posts.data.dataSet && Array.isArray(posts.data.dataSet)) {
        postsCount = posts.data.dataSet.length
      } else if (posts.data && Array.isArray(posts.data)) {
        postsCount = posts.data.length
      } else if (Array.isArray(posts)) {
        postsCount = posts.length
      }

      // 解析分类数量
      let categoriesData = categories.data || categories
      let categoriesCount = Array.isArray(categoriesData) ? categoriesData.length : 0

      // 解析标签数量
      let tagsData = tags.data || tags
      let tagsCount = Array.isArray(tagsData) ? tagsData.length : 0

      console.log('解析结果 - 文章数:', postsCount, '分类数:', categoriesCount, '标签数:', tagsCount)

      this.setData({
        stats: {
          postsCount: postsCount,
          categoriesCount: categoriesCount,
          tagsCount: tagsCount,
          viewsCount: posts.totalViews || posts.views || 0
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
   * 复制联系方式
   */
  handleCopyContact(e) {
    const { type, value } = e.currentTarget.dataset

    if (!value) {
      wx.showToast({
        title: '暂无此联系方式',
        icon: 'none'
      })
      return
    }

    const typeNames = {
      qq: 'QQ',
      wechat: '微信',
      github: 'GitHub',
      gitee: 'Gitee',
      blog: '博客',
      email: '邮箱'
    }

    copyToClipboard(value).then(() => {
      wx.showToast({
        title: `${typeNames[type]}已复制`,
        icon: 'success'
      })
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
