# Typecho 博客微信小程序

基于 Typecho 后端的微信小程序，支持文章展示、分类浏览、搜索、友链、关于等功能。

## 项目结构

```
miniprogram/
├── pages/              # 页面目录
│   ├── splash/        # 启动页
│   ├── home/          # 首页（推荐+分类+瀑布流）
│   ├── category/      # 分类页（左右结构）
│   ├── links/         # 友链页
│   ├── about/         # 关于页
│   ├── search/        # 搜索页
│   ├── article/       # 文章详情页
│   ├── archive/       # 归档页
│   └── tags/          # 标签云页
├── utils/             # 工具类
│   ├── request.js    # HTTP 请求封装
│   ├── api.js        # API 接口管理
│   └── util.js       # 通用工具函数
├── assets/            # 静态资源（需自行添加）
│   ├── logo.png      # 小程序 logo
│   ├── avatar.png    # 默认头像
│   └── icons/        # 底部导航图标
├── app.js            # 小程序入口
├── app.json          # 全局配置
├── app.wxss          # 全局样式
└── project.config.json  # 项目配置
```

## 安装步骤

### 1. 安装 Typecho REST API 插件

**方法一：使用 typecho-rest-api 插件**

```bash
# 进入 Typecho 插件目录
cd /path/to/your/typecho/usr/plugins

# 克隆插件
git clone https://github.com/moefront/typecho-rest-api.git Rest

# 或者下载后手动解压到 usr/plugins/Rest 目录
```

**启用插件：**
1. 登录 Typecho 后台
2. 进入「控制台」→「插件」
3. 找到 Rest 插件，点击「启用」

**验证安装：**
访问 `https://www.yeyhome.com/api/` 应该能看到 API 文档

### 2. 配置小程序

#### 2.1 修改 app.js 配置

打开 `app.js`，修改全局配置：

```javascript
globalData: {
  // API 基础地址（修改为你的域名）
  apiBase: 'https://www.yeyhome.com/api',

  // 网站地址
  siteUrl: 'https://www.yeyhome.com',

  // 网站信息
  siteInfo: {
    name: 'Yey Home',          // 小程序名称
    description: '个人技术博客',  // 描述
    avatar: '/assets/avatar.png', // 头像路径

    // 联系方式（在关于页面显示）
    contacts: {
      qq: '你的QQ号',
      wechat: '你的微信号',
      github: '你的GitHub用户名',
      gitee: '你的Gitee用户名',
      blog: 'https://www.yeyhome.com',
      email: 'your@email.com'
    }
  }
}
```

#### 2.2 修改 project.config.json

打开 `project.config.json`，修改 appid：

```json
{
  "appid": "你的小程序AppID"
}
```

#### 2.3 添加静态资源

需要在 `assets/` 目录下添加以下文件：

**必需文件：**
- `logo.png` - 启动页 logo（推荐 200x200px）
- `avatar.png` - 默认头像（推荐 160x160px）

**底部导航图标（`assets/icons/` 目录）：**
- `home.png` / `home-active.png` - 首页图标
- `category.png` / `category-active.png` - 分类图标
- `link.png` / `link-active.png` - 友链图标
- `about.png` / `about-active.png` - 关于图标
- `search.png` / `search-active.png` - 搜索图标

图标推荐尺寸：81x81px

### 3. 配置服务器域名

**在微信小程序后台配置：**

1. 登录 [微信小程序后台](https://mp.weixin.qq.com)
2. 进入「开发」→「开发管理」→「开发设置」
3. 找到「服务器域名」
4. 在「request 合法域名」中添加：`https://www.yeyhome.com`

⚠️ **注意：**
- 小程序只支持 HTTPS 请求
- 确保你的 Typecho 网站已启用 HTTPS
- 域名需要备案

### 4. 配置友情链接（可选）

友链数据存储方式有两种：

**方式一：在 Typecho 创建独立页面**

1. 在 Typecho 后台创建新页面
2. 设置页面缩略名（slug）为 `links`
3. 在内容中添加友链数据（JSON 格式）：

```json
[
  {
    "name": "博客名称",
    "url": "https://example.com",
    "description": "博客描述",
    "avatar": "https://example.com/avatar.png"
  }
]
```

**方式二：修改代码使用临时数据**

打开 `pages/links/links.js`，修改 `getMockLinks()` 函数中的数据。

## 功能说明

### 1. 启动页
- 首次打开显示，包含 logo、名称、描述
- 点击「进入小程序」后不再显示
- 可清除小程序缓存重新显示

### 2. 首页
- **上部**：轮播展示推荐文章
- **中部**：分类统计卡片
- **下部**：瀑布流文章列表
- 支持下拉刷新、上拉加载更多

### 3. 分类页
- 左侧显示分类列表
- 右侧显示选中分类的文章
- 支持下拉刷新、滚动加载

### 4. 友链页
- 展示友情链接列表
- 点击复制链接到剪贴板

### 5. 关于页
- 个人信息展示
- 网站统计（文章数、分类数、标签数、访问量）
- 文章归档、标签云入口
- 联系方式（点击复制）

### 6. 搜索页
- 实时搜索文章
- 搜索历史记录
- 支持分页加载

### 7. 文章详情
- 富文本展示文章内容
- 支持图片点击预览
- 复制文章链接
- 分享功能

## API 接口说明

小程序使用的 API 接口（需确保 Typecho REST API 插件已安装）：

| 接口 | 说明 |
|------|------|
| `/api/posts` | 获取文章列表 |
| `/api/posts/{id}` | 获取文章详情 |
| `/api/categories` | 获取分类列表 |
| `/api/tags` | 获取标签列表 |
| `/api/pages/{slug}` | 获取独立页面 |

## 开发调试

### 导入项目

1. 打开微信开发者工具
2. 选择「导入项目」
3. 项目目录选择 `miniprogram` 文件夹
4. 填写 AppID
5. 点击「导入」

### 本地调试

在微信开发者工具中：
1. 点击右上角「详情」
2. 勾选「不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书」
3. 即可在本地调试

### 真机预览

1. 确保服务器域名已配置
2. 点击工具栏「预览」
3. 扫码在手机上预览

## 常见问题

### Q1: 请求失败，提示域名不合法

**解决方案：**
- 确保在小程序后台配置了服务器域名
- 域名必须是 HTTPS
- 开发时可在开发者工具中勾选「不校验合法域名」

### Q2: API 返回 404

**解决方案：**
- 检查 Typecho REST API 插件是否已启用
- 访问 `你的域名/api/` 测试 API 是否可用
- 检查 `app.js` 中的 `apiBase` 配置是否正确

### Q3: 图片不显示

**解决方案：**
- 确保 `assets/` 目录下有相应的图片文件
- 检查图片路径是否正确
- 图片需要放在小程序目录内，或使用 HTTPS 外部链接

### Q4: 友链数据为空

**解决方案：**
- 检查是否在 Typecho 创建了 slug 为 `links` 的页面
- 或使用 `getMockLinks()` 中的模拟数据
- 确保友链数据格式正确

### Q5: 搜索功能不可用

**解决方案：**
- 确保 Typecho REST API 插件支持搜索功能
- 检查 API 接口 `/api/posts?search=关键词` 是否可用
- 如不支持，需要自行扩展 API 或使用其他搜索方案

## 自定义开发

### 修改主题色

打开 `app.wxss`，修改以下变量：

```css
/* 主色调：紫色渐变 */
linear-gradient(135deg, #667eea 0%, #764ba2 100%)

/* 可替换为其他颜色，例如蓝色： */
linear-gradient(135deg, #1890ff 0%, #0050b3 100%)
```

### 添加新页面

1. 在 `pages/` 目录下创建新页面文件夹
2. 在 `app.json` 的 `pages` 数组中添加页面路径
3. 如需底部导航，在 `tabBar.list` 中配置

### 修改 API 数据格式

如果你的 API 返回格式与代码中不同，需要修改 `utils/api.js` 中的数据处理逻辑。

## 技术栈

- **框架**：微信小程序原生框架
- **后端**：Typecho + REST API 插件
- **样式**：WXSS（类 CSS）
- **数据请求**：wx.request

## 许可证

MIT License

## 联系方式

如有问题或建议，请通过以下方式联系：

- 博客：https://www.yeyhome.com
- 在小程序「关于」页面查看更多联系方式

---

**开发完成！祝您使用愉快！** 🎉
