# 图标资源说明

本小程序需要以下图标和图片资源，请按照要求准备并放置在对应目录。

## 目录结构

```
assets/
├── logo.png           # 小程序启动页 Logo
├── avatar.png         # 默认头像
└── icons/            # 底部导航图标
    ├── home.png
    ├── home-active.png
    ├── category.png
    ├── category-active.png
    ├── link.png
    ├── link-active.png
    ├── about.png
    ├── about-active.png
    ├── search.png
    └── search-active.png
```

## 图标规格

### 1. logo.png
- **尺寸**：200x200 px
- **格式**：PNG（支持透明背景）
- **用途**：启动页中心 Logo
- **说明**：会显示在启动页的白色圆角方框内

### 2. avatar.png
- **尺寸**：160x160 px
- **格式**：PNG（支持透明背景）
- **用途**：关于页面头像、默认用户头像
- **说明**：建议使用圆形或方形头像

### 3. 底部导航图标

每个导航项需要两个图标：
- **普通状态**：例如 `home.png`（灰色）
- **选中状态**：例如 `home-active.png`（彩色/蓝色）

#### 规格要求：
- **尺寸**：81x81 px
- **格式**：PNG（支持透明背景）
- **颜色**：
  - 普通状态：#999999（灰色）
  - 选中状态：#1890ff（蓝色）或其他主题色

#### 所需图标列表：

| 图标名称 | 用途 | 建议图案 |
|---------|------|---------|
| home.png / home-active.png | 首页 | 房子图标 🏠 |
| category.png / category-active.png | 分类 | 文件夹图标 📁 |
| link.png / link-active.png | 友链 | 链接图标 🔗 |
| about.png / about-active.png | 关于 | 个人/用户图标 👤 |
| search.png / search-active.png | 搜索 | 放大镜图标 🔍 |

## 制作方法

### 方法一：在线图标生成器

推荐使用以下在线工具：
1. **Iconfont**（阿里巴巴图标库）
   - 网址：https://www.iconfont.cn/
   - 搜索关键词（如 home、category）
   - 下载 PNG 格式
   - 调整颜色和尺寸

2. **IconPark**（字节跳动图标库）
   - 网址：https://iconpark.oceanengine.com/
   - 选择图标
   - 设置尺寸为 81px
   - 下载 PNG

3. **Flaticon**
   - 网址：https://www.flaticon.com/
   - 搜索英文关键词
   - 下载免费图标

### 方法二：使用 Emoji 转图片

如果想快速测试，可以使用 Emoji：

1. 访问：https://emojipedia.org/
2. 搜索对应 emoji（🏠 🔍 📁 等）
3. 下载图片
4. 使用图片编辑工具调整尺寸

### 方法三：设计软件制作

使用 Figma / Photoshop / Sketch 等设计软件：

1. 创建 81x81px 画布
2. 绘制简单图标
3. 导出为 PNG
4. 制作两个版本（普通和选中）

## 临时解决方案

如果暂时没有图标，可以：

### 使用纯色占位图

创建纯色方块作为临时图标：
- 普通状态：浅灰色 #CCCCCC
- 选中状态：蓝色 #1890ff

### 使用文字图标

在图标上写文字（首、分、友、关、搜）作为临时方案。

## 图标替换步骤

1. 准备好所有图标文件
2. 在项目根目录创建 `assets/icons/` 文件夹
3. 将图标文件放入对应位置
4. 确保文件名与 `app.json` 中的配置一致
5. 重新编译小程序

## 验证图标

在微信开发者工具中：
1. 打开「调试器」→「Sources」
2. 查看 `assets/` 目录
3. 确认所有图标都已加载
4. 检查底部导航栏是否正常显示图标

## 注意事项

⚠️ **重要提示**：
- 图标文件名必须与配置完全一致（包括大小写）
- 推荐使用 PNG 格式，支持透明背景
- 图标尺寸过大会影响性能
- 确保图标清晰，避免模糊
- 建议使用矢量图转换为 PNG

## 快速获取图标包

如果想要快速开始，可以：

1. 下载开源图标包（如 Ant Design Icons）
2. 或使用本项目提供的示例图标（如有）
3. 或联系设计师定制专属图标

---

**准备好图标后，按照 README.md 中的步骤继续配置小程序！**
