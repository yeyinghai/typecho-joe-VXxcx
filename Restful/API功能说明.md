# Typecho Restful API 插件 - 新增功能说明

## 📋 功能概览

本次更新为 Typecho Restful API 插件新增了以下功能：

1. ✅ **友链 API** - 获取网站友情链接
2. ✅ **文章标签** - 在文章详情中添加标签信息
3. ✅ **文章分类** - 在文章详情中添加分类信息
4. ✅ **文章阅读量** - 在文章详情中添加浏览次数

---

## 🔗 1. 友链 API

### API 端点
```
GET /index.php/api/links
```

### 请求参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `order` | string | 否 | 排序方式：`asc`（升序，默认）或 `desc`（降序） |

### 请求头
```
token: 你的API Token
```

### 响应格式
```json
{
    "status": "success",
    "message": "",
    "data": {
        "count": 2,
        "dataSet": [
            {
                "name": "Joe的博客",
                "url": "https://78.al",
                "logo": "https://npm.elemecdn.com/typecho-joe-latest/assets/img/link.png",
                "description": "Eternity is not a distance but a decision"
            },
            {
                "name": "夜影halo",
                "url": "https://nas.yeyhome.com:282",
                "logo": "https://nas.yeyhome.com:282/logo.png",
                "description": "夜影halo分享心得，记录网络知识"
            }
        ]
    }
}
```

### 数据源支持（按优先级）

#### 方案1：Joe 主题配置（推荐）
友链数据从 `typecho_options` 表的 `theme:Joe` 配置中读取（字段名：`JFriends`）

**Joe 主题友链格式：**
```
名称||链接||头像||描述
名称||链接||头像||描述
```

**示例：**
```
Joe的博客||https://78.al||https://example.com/logo.png||Eternity is not a distance but a decision
夜影小窝||https://www.yeyhome.com||https://www.yeyhome.com/logo.png||网络技术知识聚集地
```

#### 方案2：自定义字段
在友链页面（slug为 `links`）添加自定义字段：

**字段名：** `links` 或 `friends`

**支持两种格式：**

1. **JSON 格式（推荐）：**
```json
[
    {
        "name": "友链名称",
        "url": "https://example.com",
        "logo": "https://example.com/logo.png",
        "description": "友链描述"
    }
]
```

2. **Joe 格式：**
```
名称||链接||头像||描述
名称||链接||头像||描述
```

#### 方案3：Links 插件
如果安装了 Links 友链插件，会自动从 `typecho_links` 表读取

### 测试示例
```bash
# 默认排序
curl -H "token: 45683968" "https://www.yeyhome.com/index.php/api/links"

# 降序排列
curl -H "token: 45683968" "https://www.yeyhome.com/index.php/api/links?order=desc"
```

---

## 📝 2. 文章标签功能

### 位置
在所有返回文章数据的 API 中自动包含标签信息

### 相关 API
- `/api/post` - 文章详情
- `/api/posts` - 文章列表
- `/api/archives` - 归档列表
- `/api/users` - 用户文章列表

### 响应示例
```json
{
    "status": "success",
    "data": {
        "cid": "48",
        "title": "智能化施工任务管理系统",
        "tags": [
            {
                "mid": "5",
                "name": "项目管理",
                "slug": "project-management",
                "description": "",
                "count": "3"
            },
            {
                "mid": "12",
                "name": "PHP",
                "slug": "php",
                "description": "",
                "count": "8"
            }
        ]
    }
}
```

### 字段说明
| 字段 | 类型 | 说明 |
|------|------|------|
| `mid` | string | 标签ID |
| `name` | string | 标签名称 |
| `slug` | string | 标签别名（URL友好） |
| `description` | string | 标签描述 |
| `count` | string | 使用该标签的文章数 |

---

## 📂 3. 文章分类功能

### 位置
在所有返回文章数据的 API 中自动包含分类信息

### 响应示例
```json
{
    "status": "success",
    "data": {
        "cid": "48",
        "title": "智能化施工任务管理系统",
        "categories": [
            {
                "mid": "3",
                "name": "网络技术",
                "slug": "webjs",
                "description": "技术文章分类",
                "count": "25"
            }
        ]
    }
}
```

### 字段说明
与标签相同，但 `mid` 对应分类ID

---

## 👁️ 4. 文章阅读量功能

### 位置
在所有返回文章数据的 API 中自动包含阅读量

### 响应示例
```json
{
    "status": "success",
    "data": {
        "cid": "48",
        "title": "智能化施工任务管理系统",
        "views": 142
    }
}
```

### 数据来源
从文章自定义字段中读取，支持以下字段名：
- `views`
- `viewsNum`
- `view`
- `hits`

### 配置方法
在 Typecho 后台编辑文章时，在**自定义字段**中添加：

**字段名：** `views`
**字段值：** `142`（数字）

---

## 🔧 插件配置

### 启用友链 API
1. 进入 Typecho 后台
2. **控制台 → 插件 → Restful → 设置**
3. 找到 **links** 选项，设置为 **启用**
4. 保存设置

### 其他配置
- **API Token：** 在请求头中添加 `token: 你的token值`
- **跨域配置：** 在插件设置中配置允许的域名

---

## 📦 完整示例

### 获取文章详情（包含所有新功能）
```bash
curl -H "token: 45683968" \
  "https://www.yeyhome.com/index.php/api/post?cid=48"
```

**响应：**
```json
{
    "status": "success",
    "message": "",
    "data": {
        "title": "智能化施工任务管理系统",
        "cid": "48",
        "created": "1730246400",
        "slug": "48",
        "commentsNum": "0",
        "text": "文章内容...",
        "categories": [
            {
                "mid": "3",
                "name": "网络技术",
                "slug": "webjs",
                "description": "",
                "count": "25"
            }
        ],
        "tags": [
            {
                "mid": "5",
                "name": "项目管理",
                "slug": "project-management",
                "description": "",
                "count": "3"
            }
        ],
        "views": 142,
        "fields": {
            "description": {
                "name": "description",
                "type": "str",
                "value": "项目简介"
            }
        }
    }
}
```

---

## 🚀 使用建议

### 友链配置推荐方式
1. **Joe 主题用户：** 直接在主题设置中配置友链（`JFriends` 字段）
2. **其他主题用户：** 在友链页面添加自定义字段（JSON 格式）
3. **使用 Links 插件：** 自动从插件数据表读取

### 阅读量统计
建议配合阅读量插件使用，自动更新 `views` 字段：
- **Views Counter** 插件
- **Post Views** 插件
- 或者自定义统计脚本

---

## 🐛 故障排查

### 友链 API 返回空数据
**检查项：**
1. 确认已在插件设置中启用 `links` API
2. 检查 Joe 主题配置中是否有 `JFriends` 字段
3. 检查友链页面是否有 `links` 或 `friends` 自定义字段
4. 确认是否安装了 Links 插件

### 标签/分类/阅读量为空
**检查项：**
1. 确认文章已添加标签和分类
2. 检查数据库 `typecho_relationships` 表是否有关联数据
3. 阅读量需要在自定义字段中手动添加

---

## 📞 技术支持

如有问题，请检查：
1. PHP 版本 >= 7.3
2. Typecho 版本兼容性
3. 数据库表完整性
4. API Token 配置正确

---

## 📄 更新日志

**版本 1.3.0** (2025-11-19)
- ✅ 新增友链 API (`/api/links`)
- ✅ 文章数据自动包含标签信息
- ✅ 文章数据自动包含分类信息
- ✅ 文章数据自动包含阅读量
- ✅ 支持 Joe 主题友链配置格式
- ✅ 支持 JSON 格式友链配置
- ✅ 兼容 Links 插件数据表

---

## 🔗 相关链接

- [Typecho 官方文档](https://docs.typecho.org/)
- [Joe 主题文档](https://78.al/)
- [Restful 插件 GitHub](https://github.com/moefront/typecho-plugin-Restful)
