// utils/api.js - API 接口统一管理
const { get, post } = require('./request')

/**
 * 构建查询字符串（小程序不支持 URLSearchParams）
 */
function buildQuery(params) {
  const query = []
  for (const key in params) {
    if (params[key] !== undefined && params[key] !== null) {
      query.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    }
  }
  return query.length > 0 ? query.join('&') : ''
}

/**
 * 获取文章列表
 * @param {object} params - { page, pageSize, category, tag }
 */
function getPosts(params = {}) {
  const { page = 1, pageSize = 10, category, tag } = params
  const queryParams = { page, pageSize }

  if (category) queryParams.category = category
  if (tag) queryParams.tag = tag

  const query = buildQuery(queryParams)
  return get(`/posts${query ? '?' + query : ''}`)
}

/**
 * 获取文章详情
 * @param {string|number} id - 文章ID (cid)
 */
function getPostDetail(id) {
  // Typecho REST API 使用 GET /api/post?cid={id}
  return get(`/post?cid=${id}`)
}

/**
 * 获取推荐文章
 */
function getFeaturedPosts() {
  return get('/posts?featured=1&pageSize=5')
}

/**
 * 搜索文章
 * @param {string} keyword - 搜索关键词
 * @param {number} page - 页码
 * @param {number} pageSize - 每页数量
 */
function searchPosts(keyword, page = 1, pageSize = 10) {
  const queryParams = {
    filterType: 'search',
    filterSlug: keyword,
    page,
    pageSize
  }
  const query = buildQuery(queryParams)
  return get(`/posts${query ? '?' + query : ''}`)
}

/**
 * 获取分类列表
 */
function getCategories() {
  return get('/categories')
}

/**
 * 获取某分类下的文章
 * @param {string|number} id - 分类ID
 * @param {number} page - 页码
 */
function getCategoryPosts(id, page = 1) {
  return get(`/posts?category=${id}&page=${page}`)
}

/**
 * 获取标签列表
 */
function getTags() {
  return get('/tags')
}

/**
 * 获取某标签下的文章
 * @param {string} slug - 标签slug
 * @param {number} page - 页码
 */
function getTagPosts(slug, page = 1, pageSize = 10) {
  const queryParams = {
    filterType: 'tag',
    filterSlug: slug,
    page,
    pageSize
  }
  const query = buildQuery(queryParams)
  return get(`/posts${query ? '?' + query : ''}`)
}

/**
 * 获取页面数据（友链等）
 * @param {string} slug - 页面标识
 */
function getPage(slug) {
  // Typecho REST API 独立页面端点格式：/page?slug={slug}
  return get(`/page?slug=${slug}`)
}

/**
 * 获取友链列表
 */
function getLinks() {
  return get('/links')
}

/**
 * 获取网站统计信息
 */
function getSiteStats() {
  return get('/site/stats')
}

/**
 * 获取文章归档（按月份）
 */
function getArchives() {
  return get('/archives')
}

module.exports = {
  getPosts,
  getPostDetail,
  getFeaturedPosts,
  searchPosts,
  getCategories,
  getCategoryPosts,
  getTags,
  getTagPosts,
  getPage,
  getLinks,
  getSiteStats,
  getArchives
}
