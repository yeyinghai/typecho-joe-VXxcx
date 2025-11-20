// pages/article/article.js
const api = require('../../utils/api')
const { formatTime, copyToClipboard, previewImage } = require('../../utils/util')

Page({
  data: {
    article: null,
    loading: true,
    articleId: null,
    hasImages: false,  // 是否有图片
    articleImages: [],  // 文章中的所有图片
    contentParts: [],  // 分割后的内容部分
    articleUrl: ''  // 文章链接
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ articleId: options.id })
      this.loadArticle(options.id)
    }
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadArticle(this.data.articleId).then(() => {
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 加载文章详情
   */
  async loadArticle(id) {
    try {
      this.setData({ loading: true })
      console.log('========== 开始加载文章详情 ==========')
      console.log('文章 ID:', id)

      const res = await api.getPostDetail(id)
      console.log('API 返回:', res)

      // 尝试多种数据格式
      let article = null

      // 如果返回的是列表格式（通过 cid 查询）
      if (res.data && res.data.dataSet && Array.isArray(res.data.dataSet)) {
        article = res.data.dataSet[0] // 取第一个
      } else if (Array.isArray(res.data)) {
        article = res.data[0]
      } else if (Array.isArray(res)) {
        article = res[0]
      }
      // 如果是单个对象格式
      else if (res.data && res.data.cid) {
        article = res.data
      } else if (res.cid) {
        article = res
      } else if (res.data && res.data.data) {
        article = res.data.data
      }

      if (!article) {
        throw new Error('无法解析文章数据')
      }

      console.log('========== 文章详细信息 ==========')
      console.log('文章标题:', article.title)
      console.log('文章ID:', article.cid)
      console.log('标签数量:', article.tags ? article.tags.length : 0)

      // 获取文章内容 - 尝试多种字段名
      let content = article.content || article.text || article.digest || ''
      console.log('原始内容长度:', content.length)

      // 处理文章内容中的图片
      if (content) {
        content = this.processContent(content)
        article.content = content
      } else {
        console.warn('警告: 文章内容为空')
      }

      // 处理文章字段
      article.id = article.cid || article.id
      article.created = article.date && article.date.year ?
        `${article.date.year}-${article.date.month}-${article.date.day}` :
        article.created

      // 提取缩略图
      let thumbnail = article.thumbnail || article.thumb || article.image || article.cover
      if (!thumbnail && article.fields && article.fields.thumb) {
        thumbnail = article.fields.thumb.value || article.fields.thumb
      }
      if (thumbnail && typeof thumbnail === 'object') {
        thumbnail = thumbnail.url || thumbnail.src || thumbnail.path
      }
      if (!thumbnail && article.content) {
        const imgMatch = article.content.match(/<img[^>]+src=["']([^"']+)["']/i)
        if (imgMatch && imgMatch[1]) {
          thumbnail = imgMatch[1]
        }
      }
      article.thumbnail = thumbnail

      // 检查文章是否有图片
      const images = this.extractImages(content)
      const hasImages = images.length > 0

      // 将内容按图片分割，以便单独渲染图片支持点击
      const contentParts = this.splitContentByImages(content)

      // 处理标签 - 直接使用 API 返回的 tags 字段
      let tags = []
      if (article.tags && Array.isArray(article.tags)) {
        // API 返回的标签格式：[{ mid, name, slug, description, count }]
        tags = article.tags.map(tag => tag.name || tag.slug)
      }

      console.log('文章标签:', tags)
      article.tags = tags

      // 处理阅读量 - 直接使用 API 返回的 views 字段
      article.views = article.views || 0
      console.log('文章阅读量:', article.views)

      // 生成文章链接
      const app = getApp()
      const articleUrl = article.permalink || `${app.globalData.siteUrl}/?p=${id}`

      this.setData({
        article,
        loading: false,
        hasImages,
        articleImages: images,
        contentParts,
        articleUrl
      })

      console.log('✅ 文章加载成功')

      // 更新标题
      if (article.title) {
        wx.setNavigationBarTitle({
          title: article.title
        })
      }

    } catch (error) {
      console.error('❌ 加载文章失败:', error)
      console.error('错误类型:', error.name)
      console.error('错误信息:', error.message)
      console.error('错误堆栈:', error.stack)

      this.setData({ loading: false })
      wx.showToast({
        title: '加载失败: ' + error.message,
        icon: 'none',
        duration: 3000
      })
    }
  },

  /**
   * 处理文章内容
   * 注意：图片已经单独提取并渲染，这里不需要处理图片样式
   * 1. 给各种标签添加内联样式
   * 2. 处理代码块
   */
  processContent(content) {
    // 给段落添加样式
    content = content.replace(/<p>/gi, '<p style="margin-bottom:12px;line-height:1.8;text-align:justify;">')

    // 给标题添加样式
    content = content.replace(/<h1>/gi, '<h1 style="font-size:22px;font-weight:600;margin:16px 0 10px;color:#333;">')
    content = content.replace(/<h2>/gi, '<h2 style="font-size:20px;font-weight:600;margin:16px 0 10px;color:#333;">')
    content = content.replace(/<h3>/gi, '<h3 style="font-size:18px;font-weight:600;margin:16px 0 10px;color:#333;">')
    content = content.replace(/<h4>/gi, '<h4 style="font-size:16px;font-weight:600;margin:16px 0 10px;color:#333;">')

    // 给代码添加样式
    content = content.replace(/<code>/gi, '<code style="padding:2px 4px;background:#f5f5f5;border-radius:2px;font-size:14px;color:#d73a49;">')

    // 给代码块添加样式（白底黑字，易读）
    content = content.replace(/<pre>/gi, '<pre style="padding:12px;background:#f6f8fa;border:1px solid #e1e4e8;border-radius:6px;overflow-x:auto;margin:12px 0;">')
    content = content.replace(/<pre style="[^"]*"><code style="[^"]*">/gi, '<pre style="padding:12px;background:#f6f8fa;border:1px solid #e1e4e8;border-radius:6px;overflow-x:auto;margin:12px 0;"><code style="color:#24292e;background:transparent;padding:0;font-family:Consolas,Monaco,monospace;line-height:1.6;">')

    // 给引用添加样式
    content = content.replace(/<blockquote>/gi, '<blockquote style="margin:12px 0;padding:10px 12px;background:#f9f9f9;border-left:3px solid #667eea;color:#666;">')

    // 给列表添加样式
    content = content.replace(/<ul>/gi, '<ul style="padding-left:20px;margin:10px 0;">')
    content = content.replace(/<ol>/gi, '<ol style="padding-left:20px;margin:10px 0;">')
    content = content.replace(/<li>/gi, '<li style="margin-bottom:6px;">')

    // 给链接添加样式
    content = content.replace(/<a\s+/gi, '<a style="color:#1890ff;text-decoration:underline;" ')

    // 给表格添加样式
    content = content.replace(/<table>/gi, '<table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:14px;">')
    content = content.replace(/<th>/gi, '<th style="border:1px solid #e0e0e0;padding:8px;text-align:left;background:#f5f5f5;font-weight:600;">')
    content = content.replace(/<td>/gi, '<td style="border:1px solid #e0e0e0;padding:8px;text-align:left;">')

    return content
  },

  /**
   * 将内容按图片分割成多个部分
   * 返回格式：[{html: '文本内容', image: '图片URL'}, ...]
   */
  splitContentByImages(content) {
    const parts = []
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
    let lastIndex = 0
    let match

    while ((match = imgRegex.exec(content)) !== null) {
      // 添加图片前的文本内容
      const textBefore = content.substring(lastIndex, match.index)
      if (textBefore.trim()) {
        parts.push({
          type: 'html',
          content: textBefore
        })
      }

      // 添加图片
      parts.push({
        type: 'image',
        src: match[1]
      })

      lastIndex = imgRegex.lastIndex
    }

    // 添加最后的文本内容
    const textAfter = content.substring(lastIndex)
    if (textAfter.trim()) {
      parts.push({
        type: 'html',
        content: textAfter
      })
    }

    return parts
  },

  /**
   * rich-text 绑定的tap事件
   * 注意：小程序 rich-text 组件的 tap 事件不返回具体点击的元素信息
   */
  handleContentTap(e) {
    // rich-text 组件不支持获取点击的具体元素
    // 图片已经单独渲染，不需要在这里处理
  },

  /**
   * 点击图片预览
   */
  handleImageTap(e) {
    const { src } = e.currentTarget.dataset
    const { articleImages } = this.data

    if (src && articleImages.length > 0) {
      wx.previewImage({
        current: src,
        urls: articleImages
      })
    }
  },

  /**
   * 查看文章中的所有图片
   */
  handleViewImages() {
    const { articleImages } = this.data

    if (articleImages.length > 0) {
      wx.previewImage({
        current: articleImages[0],
        urls: articleImages
      })
    } else {
      wx.showToast({
        title: '文章中没有图片',
        icon: 'none'
      })
    }
  },

  /**
   * 从内容中提取所有图片URL
   */
  extractImages(content) {
    const regex = /<img[^>]+src="([^">]+)"/g
    const images = []
    let match

    while ((match = regex.exec(content)) !== null) {
      images.push(match[1])
    }

    return images
  },

  /**
   * 复制文章链接
   */
  handleShare() {
    const { articleUrl } = this.data

    if (articleUrl) {
      wx.setClipboardData({
        data: articleUrl,
        success: () => {
          wx.showToast({
            title: '链接已复制',
            icon: 'success'
          })
        }
      })
    }
  },

  /**
   * 分享
   */
  onShareAppMessage() {
    const { article } = this.data
    return {
      title: article ? article.title : '文章详情',
      path: `/pages/article/article?id=${this.data.articleId}`,
      imageUrl: article && article.thumbnail ? article.thumbnail : ''
    }
  }
})
