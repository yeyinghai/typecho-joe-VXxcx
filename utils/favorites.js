/**
 * 收藏管理工具
 * 用于管理文章的收藏和点赞功能
 */

const STORAGE_KEY = {
  FAVORITES: 'article_favorites',  // 收藏列表
  LIKES: 'article_likes'            // 点赞列表
}

/**
 * 获取所有收藏的文章
 * @returns {Array} 收藏的文章列表
 */
function getFavorites() {
  try {
    const favorites = wx.getStorageSync(STORAGE_KEY.FAVORITES)
    return favorites || []
  } catch (e) {
    console.error('获取收藏列表失败:', e)
    return []
  }
}

/**
 * 添加收藏
 * @param {Object} article 文章对象
 * @returns {Boolean} 是否添加成功
 */
function addFavorite(article) {
  try {
    const favorites = getFavorites()

    // 检查是否已收藏
    if (isFavorited(article.cid)) {
      return false
    }

    // 添加收藏时间戳
    const favoriteItem = {
      ...article,
      favoriteTime: Date.now()
    }

    favorites.unshift(favoriteItem)
    wx.setStorageSync(STORAGE_KEY.FAVORITES, favorites)

    // 显示提示
    wx.showToast({
      title: '收藏成功',
      icon: 'success',
      duration: 1500
    })

    return true
  } catch (e) {
    console.error('添加收藏失败:', e)
    wx.showToast({
      title: '收藏失败',
      icon: 'none'
    })
    return false
  }
}

/**
 * 移除收藏
 * @param {Number} cid 文章ID
 * @returns {Boolean} 是否移除成功
 */
function removeFavorite(cid) {
  try {
    let favorites = getFavorites()
    favorites = favorites.filter(item => item.cid !== cid)
    wx.setStorageSync(STORAGE_KEY.FAVORITES, favorites)

    wx.showToast({
      title: '已取消收藏',
      icon: 'success',
      duration: 1500
    })

    return true
  } catch (e) {
    console.error('移除收藏失败:', e)
    wx.showToast({
      title: '操作失败',
      icon: 'none'
    })
    return false
  }
}

/**
 * 切换收藏状态
 * @param {Object} article 文章对象
 * @returns {Boolean} 当前收藏状态
 */
function toggleFavorite(article) {
  if (isFavorited(article.cid)) {
    removeFavorite(article.cid)
    return false
  } else {
    addFavorite(article)
    return true
  }
}

/**
 * 检查文章是否已收藏
 * @param {Number} cid 文章ID
 * @returns {Boolean} 是否已收藏
 */
function isFavorited(cid) {
  const favorites = getFavorites()
  return favorites.some(item => item.cid === cid)
}

/**
 * 获取收藏数量
 * @returns {Number} 收藏数量
 */
function getFavoriteCount() {
  const favorites = getFavorites()
  return favorites.length
}

/**
 * 清空所有收藏
 * @returns {Boolean} 是否清空成功
 */
function clearFavorites() {
  try {
    wx.removeStorageSync(STORAGE_KEY.FAVORITES)
    wx.showToast({
      title: '已清空收藏',
      icon: 'success'
    })
    return true
  } catch (e) {
    console.error('清空收藏失败:', e)
    return false
  }
}

// ========== 点赞相关 ==========

/**
 * 获取所有点赞的文章ID
 * @returns {Array} 点赞的文章ID列表
 */
function getLikes() {
  try {
    const likes = wx.getStorageSync(STORAGE_KEY.LIKES)
    return likes || []
  } catch (e) {
    console.error('获取点赞列表失败:', e)
    return []
  }
}

/**
 * 添加点赞
 * @param {Number} cid 文章ID
 * @returns {Boolean} 是否添加成功
 */
function addLike(cid) {
  try {
    const likes = getLikes()

    if (isLiked(cid)) {
      return false
    }

    likes.push(cid)
    wx.setStorageSync(STORAGE_KEY.LIKES, likes)

    // 显示动画效果
    wx.vibrateShort({
      type: 'light'
    })

    return true
  } catch (e) {
    console.error('添加点赞失败:', e)
    return false
  }
}

/**
 * 移除点赞
 * @param {Number} cid 文章ID
 * @returns {Boolean} 是否移除成功
 */
function removeLike(cid) {
  try {
    let likes = getLikes()
    likes = likes.filter(id => id !== cid)
    wx.setStorageSync(STORAGE_KEY.LIKES, likes)
    return true
  } catch (e) {
    console.error('移除点赞失败:', e)
    return false
  }
}

/**
 * 切换点赞状态
 * @param {Number} cid 文章ID
 * @returns {Boolean} 当前点赞状态
 */
function toggleLike(cid) {
  if (isLiked(cid)) {
    removeLike(cid)
    return false
  } else {
    addLike(cid)
    return true
  }
}

/**
 * 检查文章是否已点赞
 * @param {Number} cid 文章ID
 * @returns {Boolean} 是否已点赞
 */
function isLiked(cid) {
  const likes = getLikes()
  return likes.includes(cid)
}

/**
 * 获取点赞数量
 * @returns {Number} 点赞数量
 */
function getLikeCount() {
  const likes = getLikes()
  return likes.length
}

module.exports = {
  // 收藏相关
  getFavorites,
  addFavorite,
  removeFavorite,
  toggleFavorite,
  isFavorited,
  getFavoriteCount,
  clearFavorites,

  // 点赞相关
  getLikes,
  addLike,
  removeLike,
  toggleLike,
  isLiked,
  getLikeCount
}
