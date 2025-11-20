// utils/request.js - API 请求封装
const app = getApp()

/**
 * 发起 HTTP 请求
 * @param {string} url - 请求地址
 * @param {object} options - 请求配置
 */
function request(url, options = {}) {
  const {
    method = 'GET',
    data = {},
    header = {}
  } = options

  // 完整的 API 地址
  const fullUrl = url.startsWith('http') ? url : `${app.globalData.apiBase}${url}`

  // 获取 token
  const token = app.globalData.apiToken

  // 构建请求头，添加 token
  const requestHeader = {
    'content-type': 'application/json',
    ...header
  }

  // 如果有 token，添加到请求头
  if (token) {
    requestHeader['token'] = token
    // 也可以使用 Authorization 方式（根据实际 API 要求选择）
    // requestHeader['Authorization'] = `Bearer ${token}`
  }

  console.log('========== API 请求 ==========')
  console.log('URL:', fullUrl)
  console.log('Method:', method)
  console.log('Data:', data)

  return new Promise((resolve, reject) => {
    wx.request({
      url: fullUrl,
      method,
      data,
      header: requestHeader,
      success: (res) => {
        console.log('API 响应状态码:', res.statusCode)
        console.log('API 响应数据:', res.data)

        if (res.statusCode === 200) {
          resolve(res.data)
        } else {
          const errorMsg = `请求失败: ${res.statusCode}`
          console.error(errorMsg)
          reject(new Error(errorMsg))
          wx.showToast({
            title: '请求失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('API 请求失败:', err)
        reject(err)
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
      }
    })
  })
}

/**
 * GET 请求
 */
function get(url, data = {}) {
  return request(url, { method: 'GET', data })
}

/**
 * POST 请求
 */
function post(url, data = {}) {
  return request(url, { method: 'POST', data })
}

module.exports = {
  request,
  get,
  post
}
