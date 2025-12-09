// pages/favorites/favorites.js
const favorites = require('../../utils/favorites')

Page({
  data: {
    favoritesList: [],
    loading: true,
    isEmpty: false
  },

  onLoad() {
    this.loadFavorites()
  },

  /**
   * 页面显示时重新加载（从详情页返回可能有变化）
   */
  onShow() {
    this.loadFavorites()
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadFavorites().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 加载收藏列表
   */
  async loadFavorites() {
    try {
      this.setData({ loading: true })

      const app = getApp()
      const favoritesList = favorites.getFavorites().map(item => {
        // 如果没有缩略图，使用随机图片（与首页保持一致）
        let thumbnail = item.thumbnail
        if (!thumbnail) {
          const postId = item.cid || item.id || Math.random()
          thumbnail = `${app.globalData.randomImageUrl}?id=${postId}`
        }

        return {
          ...item,
          thumbnail,
          formattedFavoriteTime: this.formatDate(item.favoriteTime)
        }
      })

      this.setData({
        favoritesList,
        isEmpty: favoritesList.length === 0,
        loading: false
      })
    } catch (error) {
      console.error('加载收藏列表失败:', error)
      this.setData({ loading: false })
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  /**
   * 点击文章跳转详情页
   */
  handleArticleTap(e) {
    const { cid } = e.currentTarget.dataset
    if (cid) {
      wx.navigateTo({
        url: `/pages/article/article?id=${cid}`
      })
    }
  },

  /**
   * 取消收藏
   */
  handleUnfavorite(e) {
    const { cid, title } = e.currentTarget.dataset

    wx.showModal({
      title: '取消收藏',
      content: `确定要取消收藏「${title}」吗？`,
      confirmText: '取消收藏',
      confirmColor: '#f56c6c',
      success: (res) => {
        if (res.confirm) {
          favorites.removeFavorite(cid)
          this.loadFavorites()
        }
      }
    })
  },

  /**
   * 清空收藏
   */
  handleClearAll() {
    const { favoritesList } = this.data

    if (favoritesList.length === 0) {
      wx.showToast({
        title: '收藏列表为空',
        icon: 'none'
      })
      return
    }

    wx.showModal({
      title: '清空收藏',
      content: `确定要清空所有收藏吗？共 ${favoritesList.length} 篇文章`,
      confirmText: '清空',
      confirmColor: '#f56c6c',
      success: (res) => {
        if (res.confirm) {
          favorites.clearFavorites()
          this.loadFavorites()
        }
      }
    })
  },

  /**
   * 格式化时间
   */
  formatDate(timestamp) {
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
})
