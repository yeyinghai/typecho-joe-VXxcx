// utils/util.js - 通用工具函数

/**
 * 格式化时间
 * @param {number} timestamp - 时间戳（秒）
 * @param {string} format - 格式化模板
 */
function formatTime(timestamp, format = 'YYYY-MM-DD') {
  const date = new Date(timestamp * 1000)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')

  const map = {
    'YYYY': year,
    'MM': month,
    'DD': day,
    'HH': hour,
    'mm': minute,
    'ss': second
  }

  return format.replace(/YYYY|MM|DD|HH|mm|ss/g, matched => map[matched])
}

/**
 * 相对时间（多久前）
 * @param {number} timestamp - 时间戳（秒）
 */
function timeAgo(timestamp) {
  const now = Date.now()
  const past = timestamp * 1000
  const diff = now - past

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const month = 30 * day
  const year = 365 * day

  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)} 分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)} 小时前`
  } else if (diff < month) {
    return `${Math.floor(diff / day)} 天前`
  } else if (diff < year) {
    return `${Math.floor(diff / month)} 个月前`
  } else {
    return `${Math.floor(diff / year)} 年前`
  }
}

/**
 * 移除 HTML 标签
 * @param {string} html - HTML 字符串
 */
function stripHtml(html) {
  return html.replace(/<[^>]+>/g, '')
}

/**
 * 截取文本
 * @param {string} text - 文本
 * @param {number} length - 长度
 */
function truncate(text, length = 100) {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

/**
 * 防抖函数
 * @param {function} fn - 函数
 * @param {number} delay - 延迟时间（毫秒）
 */
function debounce(fn, delay = 300) {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

/**
 * 节流函数
 * @param {function} fn - 函数
 * @param {number} interval - 间隔时间（毫秒）
 */
function throttle(fn, interval = 300) {
  let lastTime = 0
  return function (...args) {
    const now = Date.now()
    if (now - lastTime >= interval) {
      fn.apply(this, args)
      lastTime = now
    }
  }
}

/**
 * 复制到剪贴板
 * @param {string} text - 文本
 */
function copyToClipboard(text) {
  return new Promise((resolve, reject) => {
    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({
          title: '已复制',
          icon: 'success'
        })
        resolve()
      },
      fail: reject
    })
  })
}

/**
 * 预览图片
 * @param {string} current - 当前图片
 * @param {array} urls - 图片列表
 */
function previewImage(current, urls = []) {
  wx.previewImage({
    current,
    urls: urls.length ? urls : [current]
  })
}

module.exports = {
  formatTime,
  timeAgo,
  stripHtml,
  truncate,
  debounce,
  throttle,
  copyToClipboard,
  previewImage
}
