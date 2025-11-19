# 快速启动指南

## 🚀 30分钟上手

### 第一步：后端准备（5分钟）

1. **安装 Typecho REST API 插件**
   ```bash
   cd /path/to/typecho/usr/plugins
   git clone https://github.com/moefront/typecho-rest-api.git Rest
   ```

2. **启用插件**
   - 登录 Typecho 后台
   - 控制台 → 插件 → Rest → 启用

3. **验证 API**
   - 访问：`https://你的域名/api/`
   - 应该能看到 API 文档

### 第二步：小程序配置（10分钟）

1. **修改 app.js**
   ```javascript
   // 第6行开始
   globalData: {
     apiBase: 'https://你的域名/api',
     siteUrl: 'https://你的域名',
     siteInfo: {
       name: '你的博客名',
       description: '你的描述',
       contacts: {
         qq: '你的QQ',
         // ... 其他联系方式
       }
     }
   }
   ```

2. **修改 project.config.json**
   ```json
   {
     "appid": "你的小程序AppID"
   }
   ```

3. **准备图标资源**
   - 参考 `ICONS.md` 准备图标
   - 放置到 `assets/` 目录

### 第三步：导入微信开发者工具（5分钟）

1. 打开微信开发者工具
2. 导入项目 → 选择 `miniprogram` 文件夹
3. 填写 AppID
4. 点击导入

### 第四步：本地调试（5分钟）

1. 开发者工具右上角「详情」
2. 勾选「不校验合法域名...」
3. 点击「编译」测试

### 第五步：配置服务器域名（5分钟）

1. 登录[微信小程序后台](https://mp.weixin.qq.com)
2. 开发 → 开发管理 → 开发设置
3. 服务器域名 → request合法域名
4. 添加：`https://你的域名`

### 完成！🎉

现在你可以：
- 在开发者工具中预览小程序
- 点击「预览」扫码在手机上测试
- 准备就绪后提交审核上线

## ⚡ 核心功能

- ✅ 启动页展示
- ✅ 首页瀑布流
- ✅ 分类浏览
- ✅ 文章搜索
- ✅ 文章详情
- ✅ 友情链接
- ✅ 关于页面
- ✅ 文章归档
- ✅ 标签云

## 📚 完整文档

- `README.md` - 详细配置说明
- `ICONS.md` - 图标资源准备
- 本文件 - 快速启动

## ❓ 遇到问题？

查看 `README.md` 的「常见问题」章节。

---

**祝您开发顺利！** 🚀
