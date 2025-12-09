/**
 * 分享工具
 * 用于生成分享海报、处理分享逻辑
 */

/**
 * 生成文章分享海报
 * @param {Object} article 文章对象
 * @param {Object} options 配置选项
 * @returns {Promise<string>} 海报图片临时路径
 */
function generateSharePoster(article, options = {}) {
  return new Promise((resolve, reject) => {
    const {
      width = 750,
      height = 1334,
      bgColor = '#ffffff'
    } = options

    // 创建离屏 Canvas
    const query = wx.createSelectorQuery()
    query.select('#shareCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res || !res[0]) {
          reject(new Error('获取Canvas节点失败'))
          return
        }

        const canvas = res[0].node
        const ctx = canvas.getContext('2d')

        // 设置 Canvas 尺寸
        const dpr = wx.getSystemInfoSync().pixelRatio
        canvas.width = width * dpr
        canvas.height = height * dpr
        ctx.scale(dpr, dpr)

        // 绘制背景
        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, width, height)

        // 绘制渐变背景
        const gradient = ctx.createLinearGradient(0, 0, 0, 300)
        gradient.addColorStop(0, '#667eea')
        gradient.addColorStop(1, '#764ba2')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, 300)

        // 绘制标题
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 32px sans-serif'
        ctx.textAlign = 'center'
        const title = article.title || '分享文章'
        const maxTitleWidth = width - 80
        const titleLines = wrapText(ctx, title, maxTitleWidth)

        let titleY = 120
        titleLines.forEach((line, index) => {
          if (index < 2) { // 最多显示2行
            ctx.fillText(line, width / 2, titleY + index * 45)
          }
        })

        // 绘制白色卡片区域
        const cardY = 320
        const cardHeight = height - cardY - 180
        ctx.fillStyle = '#ffffff'
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
        ctx.shadowBlur = 20
        ctx.shadowOffsetY = 10
        roundRect(ctx, 40, cardY, width - 80, cardHeight, 20)
        ctx.fill()
        ctx.shadowBlur = 0

        // 绘制文章摘要
        ctx.fillStyle = '#666666'
        ctx.font = '24px sans-serif'
        ctx.textAlign = 'left'
        const summary = article.summary || article.excerpt || '阅读更多精彩内容...'
        const summaryLines = wrapText(ctx, summary, width - 160)

        let summaryY = cardY + 60
        summaryLines.forEach((line, index) => {
          if (index < 3) { // 最多显示3行
            ctx.fillText(line, 80, summaryY + index * 36)
          }
        })

        // 绘制分隔线
        const lineY = cardY + cardHeight - 200
        ctx.strokeStyle = '#eeeeee'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(80, lineY)
        ctx.lineTo(width - 80, lineY)
        ctx.stroke()

        // 绘制底部信息
        ctx.fillStyle = '#999999'
        ctx.font = '20px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('长按识别小程序码查看', width / 2, lineY + 50)

        // 绘制小程序码占位
        ctx.strokeStyle = '#dddddd'
        ctx.lineWidth = 2
        ctx.strokeRect(width / 2 - 60, lineY + 80, 120, 120)
        ctx.fillStyle = '#cccccc'
        ctx.font = '16px sans-serif'
        ctx.fillText('小程序码', width / 2, lineY + 140)

        // 导出图片
        wx.canvasToTempFilePath({
          canvas,
          success: (res) => {
            resolve(res.tempFilePath)
          },
          fail: (err) => {
            reject(err)
          }
        })
      })
  })
}

/**
 * 文本换行处理
 * @param {CanvasContext} ctx
 * @param {string} text
 * @param {number} maxWidth
 * @returns {Array<string>}
 */
function wrapText(ctx, text, maxWidth) {
  const lines = []
  let currentLine = ''

  for (let i = 0; i < text.length; i++) {
    const testLine = currentLine + text[i]
    const metrics = ctx.measureText(testLine)

    if (metrics.width > maxWidth && currentLine !== '') {
      lines.push(currentLine)
      currentLine = text[i]
    } else {
      currentLine = testLine
    }
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}

/**
 * 绘制圆角矩形
 * @param {CanvasContext} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {number} radius
 */
function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

/**
 * 简化版：直接使用微信分享功能
 * @param {Object} article 文章对象
 * @returns {Object} 分享配置
 */
function getShareConfig(article) {
  return {
    title: article.title || '分享文章',
    path: `/pages/article/article?id=${article.cid}`,
    imageUrl: article.thumbnail || ''
  }
}

/**
 * 保存图片到相册
 * @param {string} filePath 图片临时路径
 * @returns {Promise}
 */
function saveImageToAlbum(filePath) {
  return new Promise((resolve, reject) => {
    // 先请求授权
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          // 请求授权
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: () => {
              saveImage(filePath, resolve, reject)
            },
            fail: () => {
              // 授权失败，引导用户打开设置
              wx.showModal({
                title: '需要相册权限',
                content: '需要您授权保存图片到相册',
                confirmText: '去设置',
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    wx.openSetting()
                  }
                }
              })
              reject(new Error('用户拒绝授权'))
            }
          })
        } else {
          // 已授权，直接保存
          saveImage(filePath, resolve, reject)
        }
      }
    })
  })
}

/**
 * 保存图片
 * @param {string} filePath
 * @param {Function} resolve
 * @param {Function} reject
 */
function saveImage(filePath, resolve, reject) {
  wx.saveImageToPhotosAlbum({
    filePath,
    success: () => {
      wx.showToast({
        title: '已保存到相册',
        icon: 'success'
      })
      resolve()
    },
    fail: (err) => {
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      })
      reject(err)
    }
  })
}

module.exports = {
  generateSharePoster,
  getShareConfig,
  saveImageToAlbum
}
