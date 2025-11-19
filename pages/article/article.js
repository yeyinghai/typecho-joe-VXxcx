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
      console.log('文章所有字段名:', Object.keys(article))
      console.log('标签字段 (tags):', article.tags)
      console.log('阅读量字段 (views):', article.views)
      console.log('阅读量字段 (viewsNum):', article.viewsNum)
      console.log('分类字段 (category):', article.category)
      console.log('========== fields 字段 ==========')
      console.log('fields 对象:', article.fields)
      if (article.fields) {
        console.log('fields 包含的字段:', Object.keys(article.fields))
      }
      console.log('========== categories 字段 ==========')
      console.log('categories:', article.categories)
      console.log('category:', article.category)
      if (article.categories && article.categories.length > 0) {
        console.log('categories 总数:', article.categories.length)
        article.categories.forEach((item, index) => {
          console.log(`  [${index}] name: ${item.name}, type: ${item.type}, slug: ${item.slug}`)
        })
      }

      // 获取文章内容 - 尝试多种字段名
      let content = article.content || article.text || article.digest || ''
      console.log('原始内容长度:', content.length)
      console.log('原始内容前100字符:', content.substring(0, 100))

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

      // 处理标签 - 从 categories 数组中筛选出 type 为 "tag" 的项目
      let tags = []

      if (article.categories && Array.isArray(article.categories)) {
        // 从 categories 中筛选出标签（type === "tag"）
        tags = article.categories
          .filter(item => item.type === 'tag')
          .map(item => item.name)
      }

      // 如果 categories 中没有标签，尝试从 fields.keywords 提取
      if (tags.length === 0 && article.fields && article.fields.keywords) {
        const keywords = article.fields.keywords.value || article.fields.keywords
        if (keywords) {
          // keywords 可能是逗号分隔的字符串
          if (typeof keywords === 'string') {
            tags = keywords.split(',').map(t => t.trim()).filter(t => t)
          }
        }
      }

      console.log('初步提取的标签:', tags)

      // 如果还是没有标签，从全局标签数据中反向匹配
      if (tags.length === 0) {
        console.log('尝试从全局标签数据反向匹配...')

        // 清除缓存以便测试新逻辑
        const cacheKey = `article_tags_${article.cid || article.id}`
        wx.removeStorageSync(cacheKey)
        console.log('已清除标签缓存:', cacheKey)

        this.matchTagsFromGlobal(article.cid || article.id).then(matchedTags => {
          if (matchedTags.length > 0) {
            console.log('反向匹配到的标签:', matchedTags)
            this.setData({
              'article.tags': matchedTags
            })
          }
        })
      }

      article.tags = tags

      // 处理阅读量 - 从多个可能的位置提取
      let views = article.views || article.viewsNum || 0

      // 尝试从 fields 中提取阅读量
      if (!views && article.fields) {
        views = article.fields.views?.value || article.fields.views ||
                article.fields.viewsNum?.value || article.fields.viewsNum || 0
      }

      console.log('处理后的阅读量:', views)
      article.views = views

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
   * 从全局标签数据中反向匹配文章标签
   * 通过查询每个标签下的文章列表，判断当前文章是否属于该标签
   */
  async matchTagsFromGlobal(articleId) {
    try {
      const app = getApp()
      let allTags = app.globalData.allTags || []

      // 如果全局没有标签数据，先加载
      if (allTags.length === 0) {
        console.log('全局标签数据为空，开始加载...')
        const res = await api.getTags()

        // 解析数据格式
        if (Array.isArray(res)) {
          allTags = res
        } else if (res.data && res.data.dataSet && Array.isArray(res.data.dataSet)) {
          allTags = res.data.dataSet
        } else if (res.data && Array.isArray(res.data)) {
          allTags = res.data
        } else if (res.list && Array.isArray(res.list)) {
          allTags = res.list
        }

        // 保存到全局
        app.globalData.allTags = allTags
      }

      console.log('标签总数:', allTags.length)

      // 检查缓存
      const cacheKey = `article_tags_${articleId}`
      const cachedTags = wx.getStorageSync(cacheKey)
      if (cachedTags) {
        console.log('使用缓存的标签:', cachedTags)
        return cachedTags
      }

      // 限制检查的标签数量，避免太多 API 调用
      const tagsToCheck = allTags.slice(0, 20) // 只检查前 20 个标签
      const matchedTags = []

      // 逐个检查标签
      for (const tag of tagsToCheck) {
        try {
          const slug = tag.slug
          console.log(`\n>>> 检查标签: ${tag.name} (slug: ${slug})`)

          // 调用标签文章列表 API，只获取第一页的一部分
          const res = await api.getTagPosts(slug, 1, 5)
          console.log(`标签 ${tag.name} API 原始返回:`, JSON.stringify(res).substring(0, 200))

          // 解析文章列表
          let posts = []
          if (Array.isArray(res)) {
            posts = res
          } else if (res.data && res.data.dataSet && Array.isArray(res.data.dataSet)) {
            posts = res.data.dataSet
          } else if (res.data && Array.isArray(res.data)) {
            posts = res.data
          }

          console.log(`标签 ${tag.name} 包含 ${posts.length} 篇文章`)

          // 打印该标签下的所有文章 ID 和标题
          if (posts.length > 0) {
            console.log(`标签 ${tag.name} 下的文章:`)
            posts.forEach((post, idx) => {
              const postId = post.cid || post.id
              const postTitle = post.title || '无标题'
              console.log(`  [${idx}] ID: ${postId} (类型: ${typeof postId}), 标题: ${postTitle}`)
            })
          }

          console.log(`当前要匹配的文章 ID: ${articleId} (类型: ${typeof articleId})`)

          // 检查当前文章是否在这个标签的文章列表中
          const found = posts.some(post => {
            const postId = post.cid || post.id
            const matched = postId == articleId
            if (matched) {
              console.log(`  ✓ 匹配成功: postId ${postId} == articleId ${articleId}`)
            }
            return matched
          })

          if (found) {
            matchedTags.push(tag.name)
            console.log(`✅ 文章属于标签: ${tag.name}`)
          } else {
            console.log(`❌ 文章不属于标签: ${tag.name}`)
          }

        } catch (error) {
          console.error(`检查标签 ${tag.name} 失败:`, error)
        }
      }

      // 缓存结果（1小时）
      wx.setStorageSync(cacheKey, matchedTags)

      return matchedTags

    } catch (error) {
      console.error('反向匹配标签失败:', error)
      return []
    }
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
