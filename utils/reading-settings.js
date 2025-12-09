/**
 * 阅读设置工具
 * 用于管理文章阅读的字体大小、行距等设置
 */

const STORAGE_KEY = 'reading_settings'

// 默认设置
const DEFAULT_SETTINGS = {
  fontSize: 16,        // 字号（单位：px）
  lineHeight: 1.8,     // 行距
  theme: 'light'       // 主题：light/dark/sepia
}

// 字号选项
const FONT_SIZE_OPTIONS = [
  { label: '小', value: 14 },
  { label: '标准', value: 16 },
  { label: '大', value: 18 },
  { label: '超大', value: 20 },
  { label: '巨大', value: 22 }
]

// 行距选项
const LINE_HEIGHT_OPTIONS = [
  { label: '紧凑', value: 1.5 },
  { label: '标准', value: 1.8 },
  { label: '宽松', value: 2.0 },
  { label: '超宽', value: 2.3 }
]

// 主题选项
const THEME_OPTIONS = [
  { label: '白天', value: 'light', bgColor: '#ffffff', textColor: '#333333' },
  { label: '夜间', value: 'dark', bgColor: '#1a1a1a', textColor: '#e0e0e0' },
  { label: '护眼', value: 'sepia', bgColor: '#f4ecd8', textColor: '#5b4636' }
]

/**
 * 获取阅读设置
 * @returns {Object} 阅读设置对象
 */
function getSettings() {
  try {
    const settings = wx.getStorageSync(STORAGE_KEY)
    return settings || { ...DEFAULT_SETTINGS }
  } catch (e) {
    console.error('获取阅读设置失败:', e)
    return { ...DEFAULT_SETTINGS }
  }
}

/**
 * 保存阅读设置
 * @param {Object} settings 阅读设置对象
 * @returns {Boolean} 是否保存成功
 */
function saveSettings(settings) {
  try {
    wx.setStorageSync(STORAGE_KEY, settings)
    return true
  } catch (e) {
    console.error('保存阅读设置失败:', e)
    return false
  }
}

/**
 * 设置字号
 * @param {Number} fontSize 字号值
 * @returns {Object} 更新后的设置
 */
function setFontSize(fontSize) {
  const settings = getSettings()
  settings.fontSize = fontSize
  saveSettings(settings)
  return settings
}

/**
 * 设置行距
 * @param {Number} lineHeight 行距值
 * @returns {Object} 更新后的设置
 */
function setLineHeight(lineHeight) {
  const settings = getSettings()
  settings.lineHeight = lineHeight
  saveSettings(settings)
  return settings
}

/**
 * 设置主题
 * @param {String} theme 主题值
 * @returns {Object} 更新后的设置
 */
function setTheme(theme) {
  const settings = getSettings()
  settings.theme = theme
  saveSettings(settings)
  return settings
}

/**
 * 重置为默认设置
 * @returns {Object} 默认设置
 */
function resetSettings() {
  const settings = { ...DEFAULT_SETTINGS }
  saveSettings(settings)
  return settings
}

/**
 * 获取当前主题样式
 * @returns {Object} 主题样式对象
 */
function getThemeStyle() {
  const settings = getSettings()
  const theme = THEME_OPTIONS.find(t => t.value === settings.theme)
  return theme || THEME_OPTIONS[0]
}

/**
 * 获取内容样式字符串（用于内联样式）
 * @returns {String} CSS 样式字符串
 */
function getContentStyle() {
  const settings = getSettings()
  const theme = getThemeStyle()

  return `
    font-size: ${settings.fontSize}px;
    line-height: ${settings.lineHeight};
    color: ${theme.textColor};
  `.trim()
}

/**
 * 增大字号
 * @returns {Object} 更新后的设置
 */
function increaseFontSize() {
  const settings = getSettings()
  const currentIndex = FONT_SIZE_OPTIONS.findIndex(opt => opt.value === settings.fontSize)
  const nextIndex = Math.min(currentIndex + 1, FONT_SIZE_OPTIONS.length - 1)
  return setFontSize(FONT_SIZE_OPTIONS[nextIndex].value)
}

/**
 * 减小字号
 * @returns {Object} 更新后的设置
 */
function decreaseFontSize() {
  const settings = getSettings()
  const currentIndex = FONT_SIZE_OPTIONS.findIndex(opt => opt.value === settings.fontSize)
  const nextIndex = Math.max(currentIndex - 1, 0)
  return setFontSize(FONT_SIZE_OPTIONS[nextIndex].value)
}

module.exports = {
  // 设置管理
  getSettings,
  saveSettings,
  setFontSize,
  setLineHeight,
  setTheme,
  resetSettings,

  // 样式获取
  getThemeStyle,
  getContentStyle,

  // 快捷操作
  increaseFontSize,
  decreaseFontSize,

  // 选项常量
  FONT_SIZE_OPTIONS,
  LINE_HEIGHT_OPTIONS,
  THEME_OPTIONS,
  DEFAULT_SETTINGS
}
