// pages/links/links.js
const api = require('../../utils/api')
const { get } = require('../../utils/request')
const linksConfig = require('../../config/links')

Page({
  data: {
    links: [],
    loading: true
  },

  onLoad() {
    this.loadLinks()
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadLinks().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 加载友情链接
   * 1. 如果配置了使用API，会尝试多个API端点
   * 2. 如果所有API都失败，使用配置文件中的数据
   * 3. 如果配置为不使用API，直接使用配置文件数据
   */
  async loadLinks() {
    try {
      this.setData({ loading: true })

      let links = []

      // 检查是否使用 API
      if (linksConfig.useApi) {
        console.log('尝试从 API 获取友链数据...')
        links = await this.tryFetchFromApi()
      }

      // 如果 API 失败或不使用 API，使用配置文件数据
      if (links.length === 0) {
        console.log('使用配置文件中的友链数据')
        links = linksConfig.links || []
      }

      this.setData({
        links,
        loading: false
      })

      if (links.length === 0) {
        wx.showToast({
          title: '暂无友链数据',
          icon: 'none'
        })
      }

    } catch (error) {
      console.error('加载友链失败:', error)
      // 最后的降级方案：使用配置文件
      this.setData({
        loading: false,
        links: linksConfig.links || []
      })
    }
  },

  /**
   * 尝试从 API 获取友链（会尝试多个端点）
   */
  async tryFetchFromApi() {
    const endpoints = linksConfig.apiEndpoints || ['/page?slug=links']

    // 依次尝试每个端点
    for (let i = 0; i < endpoints.length; i++) {
      const endpoint = endpoints[i]
      console.log(`尝试端点 ${i + 1}/${endpoints.length}: ${endpoint}`)

      try {
        const res = await get(endpoint)
        console.log(`端点 ${endpoint} 响应:`, res)

        // 解析友链数据
        let links = []

        // 情况1：API直接返回了格式化的友链数组
        if (Array.isArray(res)) {
          links = res
        }
        // 情况2：数据在 res.data 中
        else if (res.data && Array.isArray(res.data)) {
          links = res.data
        }
        // 情况3：从页面内容中解析友链
        else if (res.content || res.text) {
          const content = res.content || res.text
          links = this.parseLinksFromContent(content)
        }

        if (links.length > 0) {
          console.log(`✓ 成功从 ${endpoint} 获取到 ${links.length} 个友链`)
          return links
        } else {
          console.log(`✗ 端点 ${endpoint} 返回数据为空`)
        }

      } catch (error) {
        console.log(`✗ 端点 ${endpoint} 请求失败:`, error.message)
        // 继续尝试下一个端点
      }
    }

    console.log('所有 API 端点都失败了')
    return []
  },

  /**
   * 从页面内容中解析友链
   * 支持 JSON 格式或 HTML 列表格式
   */
  parseLinksFromContent(content) {
    try {
      console.log('开始解析友链内容，内容长度:', content.length)

      // 方式1: 尝试解析整个内容为 JSON 数组
      try {
        const parsed = JSON.parse(content)
        if (Array.isArray(parsed)) {
          console.log('成功解析为JSON数组，友链数量:', parsed.length)
          return parsed
        }
      } catch (e) {
        // 不是纯JSON，继续其他方式
      }

      // 方式2: 从内容中提取 JSON 数组（可能包含在 HTML 或其他文本中）
      const jsonMatch = content.match(/\[[\s\S]*?\{[\s\S]*?"name"[\s\S]*?\}[\s\S]*?\]/)
      if (jsonMatch) {
        try {
          const links = JSON.parse(jsonMatch[0])
          console.log('从内容中提取JSON数组成功，友链数量:', links.length)
          return links
        } catch (e) {
          console.error('提取的JSON解析失败:', e)
        }
      }

      // 方式3: 解析 HTML 链接（从 <a> 标签提取）
      const links = []
      const linkRegex = /<a[^>]*href=["']([^"']*)["'][^>]*>([^<]*)<\/a>/gi
      let match

      while ((match = linkRegex.exec(content)) !== null) {
        const url = match[1]
        const name = match[2].trim()

        // 过滤掉空链接或无效链接
        if (url && name && !url.startsWith('#') && !url.startsWith('javascript:')) {
          links.push({
            name: name,
            url: url,
            description: '',
            avatar: ''
          })
        }
      }

      if (links.length > 0) {
        console.log('从HTML解析友链成功，数量:', links.length)
        return links
      }

      console.warn('无法从内容中解析出友链数据')
      return []

    } catch (error) {
      console.error('解析友链失败:', error)
      return []
    }
  },

  /**
   * 点击友链
   */
  handleLinkTap(e) {
    const { url, name } = e.currentTarget.dataset

    wx.showModal({
      title: '提示',
      content: `即将跳转到外部链接：${name}`,
      confirmText: '继续',
      success: (res) => {
        if (res.confirm) {
          // 复制链接到剪贴板（小程序无法直接打开外部链接）
          wx.setClipboardData({
            data: url,
            success: () => {
              wx.showToast({
                title: '链接已复制',
                icon: 'success'
              })
            }
          })
        }
      }
    })
  },

  /**
   * 分享
   */
  onShareAppMessage() {
    return {
      title: '友情链接',
      path: '/pages/links/links'
    }
  }
})
