// config/links.js - 友链配置文件
// 如果 API 无法获取友链数据，将使用这里的配置
// 你可以直接在这里维护友链列表

module.exports = {
  // 友链列表
  links: [
    {
      name: '夜影小窝',
      url: 'https://nas.yeyhome.com:282',
      description: '个人技术博客',
      avatar: '/assets/avatar.png'
    }
    // 在这里添加更多友链...
    // {
    //   name: '友链名称',
    //   url: 'https://example.com',
    //   description: '友链描述',
    //   avatar: '头像URL或留空'
    // }
  ],

  // 是否优先使用 API（如果设为 false，将直接使用上面的配置）
  useApi: true,

  // API 端点配置（按优先级尝试）
  apiEndpoints: [
    '/page?slug=links',      // Typecho REST API 标准格式1
    '/pages?slug=links',     // Typecho REST API 标准格式2
    '/page/links',           // RESTful 格式1
    '/pages/links'           // RESTful 格式2
  ]
}
