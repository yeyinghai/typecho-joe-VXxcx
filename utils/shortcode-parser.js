/**
 * Joe主题短代码解析器
 * 将Typecho文章中的短代码转换为小程序可渲染的内容
 */

// 表情映射表 - 泡泡表情
const bubbleEmoji = {
  '呵呵': 'hehe', '哈哈': 'haha', '吐舌': 'tushe', '太开心': 'taikaixing', '笑眼': 'xiaoyan',
  '花心': 'huaxin', '小乖': 'xiaoguai', '乖': 'guai', '捂嘴笑': 'wuzuixiao', '滑稽': 'huaji',
  '你懂的': 'nidongde', '不高兴': 'bugaoxing', '怒': 'nu', '汗': 'han', '黑线': 'heixian',
  '泪': 'lei', '真棒': 'zhenbang', '喷': 'pen', '惊哭': 'jingku', '阴险': 'yinxian',
  '鄙视': 'bishi', '酷': 'ku', '啊': 'a', '狂汗': 'kuanghan', 'what': 'what',
  '疑问': 'yiwen', '酸爽': 'suanshuang', '呀咩爹': 'yamiedie', '委屈': 'weiqu',
  '惊讶': 'jingya', '睡觉': 'shuijiao', '笑尿': 'xiaoniao', '挖鼻': 'wabi', '吐': 'tu',
  '犀利': 'xili', '小红脸': 'xiaohonglian', '懒得理': 'landeli', '勉强': 'mianqiang',
  '爱心': 'aixin', '心碎': 'xinsui', '玫瑰': 'meigui', '礼物': 'liwu', '彩虹': 'caihong',
  '太阳': 'taiyang', '星星月亮': 'xingxingyueliang', '钱币': 'qianbi', '茶杯': 'chabei',
  '蛋糕': 'dangao', '大拇指': 'damuzhi', '胜利': 'shengli', 'haha': 'haha2', 'OK': 'OK',
  '沙发': 'shafa', '手纸': 'shouzhi', '香蕉': 'xiangjiao', '便便': 'bianbian', '药丸': 'yaowan',
  '红领巾': 'honglingjin', '蜡烛': 'lazhu', '音乐': 'yinyue', '灯泡': 'dengpao', '开心': 'kaixing',
  '钱': 'qian', '咦': 'yi', '呼': 'hu', '冷': 'leng', '生气': 'shengqi', '弱': 'ruo',
  '吐血': 'tuxue', '狗头': 'goutou'
}

// 表情映射表 - 阿鲁表情
const aluEmoji = {
  '高兴': 'gaoxing', '小怒': 'xiaonu', '脸红': 'lianhong', '内伤': 'neishang',
  '装大款': 'zhuangdakuan', '赞一个': 'zanyige', '害羞': 'haixiu', '汗': 'han',
  '吐血倒地': 'tuxuedaodi', '深思': 'shensi', '不高兴': 'bugaoxing', '无语': 'wuyu',
  '亲亲': 'qinqin', '口水': 'koushui', '尴尬': 'ganga', '中指': 'zhongzhi',
  '想一想': 'xiangyixiang', '哭泣': 'kuqi', '便便': 'bianbian', '献花': 'xianhua',
  '皱眉': 'zoumei', '傻笑': 'shaxiao', '狂汗': 'kuanghan', '吐': 'tu', '喷水': 'penshui',
  '看不见': 'kanbujian', '鼓掌': 'guzhang', '阴暗': 'yinan', '长草': 'zhangcao',
  '献黄瓜': 'xianhuanggua', '邪恶': 'xie', '期待': 'qidai', '得意': 'deyi', '吐舌': 'tushe',
  '喷血': 'penxue', '无所谓': 'wusuowei', '观察': 'guancha', '暗地观察': 'andiguancha',
  '肿包': 'zhongbao', '中枪': 'zhongqiang', '大囧': 'dajiong', '呲牙': 'ciya', '抠鼻': 'koubi',
  '不说话': 'bushuohua', '咽气': 'yanqi', '欢呼': 'huanhu', '锁眉': 'suomei', '蜡烛': 'lazhu',
  '坐等': 'zuodeng', '击掌': 'jizhang', '惊喜': 'jingxi', '喜极而泣': 'xijierqi', '抽烟': 'chouyan',
  '不出所料': 'buchusuoliao', '愤怒': 'fennu', '无奈': 'wunai', '黑线': 'heixian',
  '投降': 'touxiang', '看热闹': 'kanrenao', '扇耳光': 'shanerguang', '小眼睛': 'xiaoyangjing',
  '中刀': 'zhongdao'
}

// 云盘类型映射
const cloudTypes = {
  '_default': { name: '默认网盘', icon: '☁️' },
  '_360': { name: '360网盘', icon: '🔵' },
  '_bd': { name: '百度网盘', icon: '📦' },
  '_ty': { name: '天翼云盘', icon: '☁️' },
  '_ct': { name: '城通网盘', icon: '🌐' },
  '_wy': { name: '微云', icon: '☁️' },
  '_github': { name: 'GitHub', icon: '🐙' },
  '_lz': { name: '蓝奏云', icon: '💠' }
}

/**
 * 解析短代码属性
 * @param {string} attrString - 属性字符串，如 'type="info" color="#fff"'
 * @returns {object} - 属性对象
 */
function parseAttributes(attrString) {
  const attrs = {}
  if (!attrString) return attrs

  // 去除首尾空格
  attrString = attrString.trim()

  // 替换中文引号为英文引号
  attrString = attrString.replace(/"/g, '"').replace(/"/g, '"')
  attrString = attrString.replace(/'/g, "'").replace(/'/g, "'")

  // 方法1: 匹配 key="value" 或 key='value' 格式（支持空格）
  const regex1 = /(\w+)\s*=\s*["']([^"']*?)["']/g
  let match
  while ((match = regex1.exec(attrString)) !== null) {
    attrs[match[1]] = match[2]
  }

  // 方法2: 如果方法1没有匹配到，尝试匹配不带引号的属性值
  if (Object.keys(attrs).length === 0) {
    const regex2 = /(\w+)\s*=\s*([^\s]+)/g
    while ((match = regex2.exec(attrString)) !== null) {
      attrs[match[1]] = match[2]
    }
  }

  return attrs
}

/**
 * 处理任务列表短代码
 * { } 未完成  {x} 已完成
 */
function parseCheckbox(content) {
  // 未完成任务
  content = content.replace(/\{\s*\}/g, '<span class="joe_checkbox" data-checked="false"></span>')
  // 已完成任务
  content = content.replace(/\{x\}/gi, '<span class="joe_checkbox joe_checkbox--checked" data-checked="true"></span>')
  return content
}

/**
 * 处理跑马灯短代码
 * {lamp/}
 */
function parseLamp(content) {
  return content.replace(/\{lamp\/\}/gi, '<span class="joe_lamp"></span>')
}

/**
 * 处理彩色虚线短代码
 * {dotted/}
 */
function parseDotted(content) {
  return content.replace(/\{dotted\/\}/gi, '<span class="joe_dotted"></span>')
}

/**
 * 处理进度条短代码
 * {progress percentage="50" color="#409eff"/}
 */
function parseProgress(content) {
  const regex = /\{progress([^}]*?)\/\}/gi
  return content.replace(regex, (match, attrs) => {
    const { percentage = '0', color = '#409eff' } = parseAttributes(attrs)
    return `<div class="joe_progress">
      <div class="joe_progress__strip">
        <div class="joe_progress__strip-percent" style="width:${percentage}%;background:${color};"></div>
      </div>
      <span class="joe_progress__percentage">${percentage}%</span>
    </div>`
  })
}

/**
 * 处理居中标题短代码
 * {mtitle}标题文字{/mtitle}
 */
function parseMtitle(content) {
  const regex = /\{mtitle\}([\s\S]*?)\{\/mtitle\}/gi
  return content.replace(regex, (match, text) => {
    return `<div class="joe_mtitle"><span class="joe_mtitle__text">${text.trim()}</span></div>`
  })
}

/**
 * 处理消息提示短代码
 * 格式1: {message type="success"}内容{/message}
 * 格式2: {message type="info" content="内容"/}
 */
function parseMessage(content) {
  // 定义不同类型的样式
  const styles = {
    success: {
      borderColor: '#2bde3f',
      background: 'rgba(43, 222, 63, 0.1)',
      color: '#2bde3f',
      iconBg: '#2bde3f'
    },
    info: {
      borderColor: '#1d72f3',
      background: 'rgba(29, 114, 243, 0.1)',
      color: '#1d72f3',
      iconBg: '#1d72f3'
    },
    warning: {
      borderColor: '#ffc007',
      background: 'rgba(255, 192, 7, 0.1)',
      color: '#ffc007',
      iconBg: '#ffc007'
    },
    error: {
      borderColor: '#f56c6c',
      background: 'rgba(245, 108, 108, 0.1)',
      color: '#f56c6c',
      iconBg: '#f56c6c'
    }
  }

  // 格式1: {message type="success"}内容{/message}
  const regex1 = /\{message([^}]*?)\}([\s\S]*?)\{\/message\}/gi
  content = content.replace(regex1, (match, attrs, text) => {
    const { type = 'info' } = parseAttributes(attrs)
    const style = styles[type] || styles.info

    return `<div style="display:block;position:relative;border-left:4px solid ${style.borderColor};padding:8px 12px;border-radius:0 4px 4px 0;margin:6px 0;line-height:1.6;background:${style.background};color:${style.color};">
      <span style="position:absolute;top:-4px;left:-9px;width:18px;height:18px;border-radius:50%;background:${style.iconBg};"></span>
      <span>${text.trim()}</span>
    </div>`
  })

  // 格式2: {message type="info" content="内容"/}
  const regex2 = /\{message([^}]*?)\/\}/gi
  content = content.replace(regex2, (match, attrs) => {
    const parsedAttrs = parseAttributes(attrs)
    const type = parsedAttrs.type || 'info'
    const text = parsedAttrs.content || ''
    const style = styles[type] || styles.info

    return `<div style="display:block;position:relative;border-left:4px solid ${style.borderColor};padding:8px 12px;border-radius:0 4px 4px 0;margin:6px 0;line-height:1.6;background:${style.background};color:${style.color};">
      <span style="position:absolute;top:-4px;left:-9px;width:18px;height:18px;border-radius:50%;background:${style.iconBg};"></span>
      <span>${text}</span>
    </div>`
  })

  return content
}

/**
 * 处理标注短代码
 * {callout color="#409eff"}内容{/callout}
 */
function parseCallout(content) {
  const regex = /\{callout([^}]*?)\}([\s\S]*?)\{\/callout\}/gi
  return content.replace(regex, (match, attrs, text) => {
    const { color = '#409eff' } = parseAttributes(attrs)
    return `<div class="joe_callout" style="border-left-color:${color};">${text.trim()}</div>`
  })
}

/**
 * 处理提示框短代码
 * {alert type="info"}内容{/alert}
 */
function parseAlert(content) {
  const regex = /\{alert([^}]*?)\}([\s\S]*?)\{\/alert\}/gi
  return content.replace(regex, (match, attrs, text) => {
    const { type = 'info' } = parseAttributes(attrs)
    return `<div class="joe_alert ${type}">${text.trim()}</div>`
  })
}

/**
 * 处理多彩按钮短代码
 * {abtn icon="fa fa-download" color="#409eff" href="链接"}文字{/abtn}
 */
function parseAbtn(content) {
  const regex = /\{abtn([^}]*?)\}([\s\S]*?)\{\/abtn\}/gi
  return content.replace(regex, (match, attrs, text) => {
    const { color = '#409eff', href = '', icon = '' } = parseAttributes(attrs)
    const iconHtml = icon ? `<span class="joe_abtn__icon">${icon}</span>` : ''
    return `<span class="joe_abtn" style="background:${color};" data-href="${href}">
      ${iconHtml}<span class="joe_abtn__content">${text.trim()}</span>
    </span>`
  })
}

/**
 * 处理便条按钮短代码
 * {anote icon="图标" color="success" href="链接"}文字{/anote}
 */
function parseAnote(content) {
  const regex = /\{anote([^}]*?)\}([\s\S]*?)\{\/anote\}/gi
  return content.replace(regex, (match, attrs, text) => {
    const { color = 'info', href = '', icon = '' } = parseAttributes(attrs)
    const iconHtml = icon ? `<span class="joe_anote__icon">${icon}</span>` : ''
    return `<span class="joe_anote ${color}" data-href="${href}">
      ${iconHtml}<span class="joe_anote__content">${text.trim()}</span>
    </span>`
  })
}

/**
 * 处理复制文本短代码
 * {copy}要复制的文本{/copy}
 */
function parseCopy(content) {
  const regex = /\{copy\}([\s\S]*?)\{\/copy\}/gi
  return content.replace(regex, (match, text) => {
    return `<span class="joe_copy" data-copy="${text.trim()}">${text.trim()} 📋</span>`
  })
}

/**
 * 处理默认卡片短代码
 * {card-default title="标题"}内容{/card-default}
 */
function parseCardDefault(content) {
  const regex = /\{card-default([^}]*?)\}([\s\S]*?)\{\/card-default\}/gi
  return content.replace(regex, (match, attrs, text) => {
    const { title = '' } = parseAttributes(attrs)
    return `<div class="joe_card__default">
      <div class="joe_card__default-title">${title}</div>
      <div class="joe_card__default-content">${text.trim()}</div>
    </div>`
  })
}

/**
 * 处理描述卡片短代码
 * {card-describe title="标题"}内容{/card-describe}
 */
function parseCardDescribe(content) {
  const regex = /\{card-describe([^}]*?)\}([\s\S]*?)\{\/card-describe\}/gi
  return content.replace(regex, (match, attrs, text) => {
    const { title = '' } = parseAttributes(attrs)
    return `<div class="joe_card__describe">
      <div class="joe_card__describe-title">${title}</div>
      <div class="joe_card__describe-content">${text.trim()}</div>
    </div>`
  })
}

/**
 * 处理卡片列表短代码
 * {card-list}
 * 项目1
 * 项目2
 * {/card-list}
 */
function parseCardList(content) {
  const regex = /\{card-list\}([\s\S]*?)\{\/card-list\}/gi
  return content.replace(regex, (match, text) => {
    const items = text.trim().split('\n').filter(item => item.trim())
    const itemsHtml = items.map(item => `<div class="joe_card__list-item">${item.trim()}</div>`).join('')
    return `<div class="joe_card__list">${itemsHtml}</div>`
  })
}

/**
 * 处理回复可见短代码
 * {hide}内容{/hide}
 */
function parseHide(content) {
  const regex = /\{hide\}([\s\S]*?)\{\/hide\}/gi
  return content.replace(regex, (match, text) => {
    return `<div class="joe_hide">
      <span class="joe_hide__button">此处内容需要回复可见</span>
    </div>`
  })
}

/**
 * 处理云盘下载短代码
 * {cloud type="_bd" url="链接" password="密码" title="自定义标题"}
 */
function parseCloud(content) {
  const regex = /\{cloud([^}]*?)\}/gi
  return content.replace(regex, (match, attrs) => {
    const { type = '_default', url = '', password = '', title = '' } = parseAttributes(attrs)
    const cloudInfo = cloudTypes[type] || cloudTypes['_default']

    // 优先使用 title，如果没有 title 则使用默认网盘名称
    const displayName = title || cloudInfo.name
    const passwordText = password ? `提取码: ${password}` : '点击下载'

    return `<div class="joe_cloud" data-url="${url}" data-type="${type}">
      <div class="joe_cloud__logo ${type}">${cloudInfo.icon}</div>
      <div class="joe_cloud__describe">
        <div class="joe_cloud__describe-title">${displayName}</div>
        <div class="joe_cloud__describe-type">${passwordText}</div>
      </div>
      <div class="joe_cloud__btn">↓</div>
    </div>`
  })
}

/**
 * 处理时间轴短代码
 * {timeline}
 * 时间点1:::内容1
 * 时间点2:::内容2
 * {/timeline}
 */
function parseTimeline(content) {
  const regex = /\{timeline\}([\s\S]*?)\{\/timeline\}/gi
  return content.replace(regex, (match, text) => {
    const items = text.trim().split('\n').filter(item => item.trim())
    const itemsHtml = items.map(item => {
      const [time, content] = item.split(':::')
      return `<div class="joe_timeline__item">
        <div class="joe_timeline__item-tail"></div>
        <div class="joe_timeline__item-circle"></div>
        <div class="joe_timeline__item-content">
          <strong>${(time || '').trim()}</strong>
          <div>${(content || '').trim()}</div>
        </div>
      </div>`
    }).join('')
    return `<div class="joe_timeline">${itemsHtml}</div>`
  })
}

/**
 * 处理宫格短代码
 * {gird cols="3"}
 * 内容1
 * 内容2
 * {/gird}
 */
function parseGird(content) {
  const regex = /\{gird([^}]*?)\}([\s\S]*?)\{\/gird\}/gi
  return content.replace(regex, (match, attrs, text) => {
    const { cols = '2' } = parseAttributes(attrs)
    const items = text.trim().split('\n').filter(item => item.trim())
    const itemsHtml = items.map(item => `<div class="joe_gird__item">${item.trim()}</div>`).join('')
    return `<div class="joe_gird" style="grid-template-columns:repeat(${cols}, 1fr);gap:10px;">${itemsHtml}</div>`
  })
}

/**
 * 处理泡泡表情短代码
 * ::(表情名称)
 */
function parseBubbleEmoji(content) {
  const regex = /::\(([^)]+)\)/g
  return content.replace(regex, (match, name) => {
    const emojiKey = bubbleEmoji[name]
    if (emojiKey) {
      // 这里可以替换为实际的表情图片URL
      return `<span class="joe_emoji joe_emoji--bubble" data-name="${name}">😊</span>`
    }
    return match
  })
}

/**
 * 处理阿鲁表情短代码
 * :@(表情名称)
 */
function parseAluEmoji(content) {
  const regex = /:@\(([^)]+)\)/g
  return content.replace(regex, (match, name) => {
    const emojiKey = aluEmoji[name]
    if (emojiKey) {
      return `<span class="joe_emoji joe_emoji--alu" data-name="${name}">🙂</span>`
    }
    return match
  })
}

/**
 * 处理视频短代码 - 转换为占位提示
 * {dplayer url="视频地址"/}
 * {bilibili bvid="BV号"/}
 */
function parseVideo(content) {
  // DPlayer视频
  content = content.replace(/\{dplayer([^}]*?)\/\}/gi, (match, attrs) => {
    const { url = '' } = parseAttributes(attrs)
    return `<div class="joe_video" data-type="dplayer" data-url="${url}">
      <div class="joe_video__placeholder">🎬 视频内容</div>
      <div class="joe_video__tip">小程序暂不支持播放，请在浏览器中查看</div>
    </div>`
  })

  // B站视频
  content = content.replace(/\{bilibili([^}]*?)\/\}/gi, (match, attrs) => {
    const { bvid = '', aid = '' } = parseAttributes(attrs)
    const videoId = bvid || aid
    return `<div class="joe_video" data-type="bilibili" data-id="${videoId}">
      <div class="joe_video__placeholder">📺 哔哩哔哩视频</div>
      <div class="joe_video__tip">小程序暂不支持播放，请在浏览器中查看</div>
    </div>`
  })

  return content
}

/**
 * 处理音乐短代码 - 转换为占位提示
 * {music-list id="歌单ID"/}
 * {music id="歌曲ID"/}
 * {mp3 url="音频地址" name="歌曲名称"/}
 */
function parseMusic(content) {
  // 网易云歌单
  content = content.replace(/\{music-list([^}]*?)\/\}/gi, (match, attrs) => {
    const { id = '' } = parseAttributes(attrs)
    return `<div class="joe_music" data-type="playlist" data-id="${id}">
      <div class="joe_music__placeholder">🎵 网易云歌单</div>
      <div class="joe_music__tip">小程序暂不支持播放</div>
    </div>`
  })

  // 网易云单曲
  content = content.replace(/\{music([^}]*?)\/\}/gi, (match, attrs) => {
    const { id = '' } = parseAttributes(attrs)
    return `<div class="joe_music" data-type="song" data-id="${id}">
      <div class="joe_music__placeholder">🎵 网易云音乐</div>
      <div class="joe_music__tip">小程序暂不支持播放</div>
    </div>`
  })

  // 外部MP3
  content = content.replace(/\{mp3([^}]*?)\/\}/gi, (match, attrs) => {
    const { url = '', name = '音频' } = parseAttributes(attrs)
    return `<div class="joe_music" data-type="mp3" data-url="${url}">
      <div class="joe_music__placeholder">🎵 ${name}</div>
      <div class="joe_music__tip">小程序暂不支持播放</div>
    </div>`
  })

  return content
}

/**
 * 解析标签页或折叠面板内部的内容
 * 内部内容需要解析所有短代码（包括其他短代码），但不提取为交互组件
 */
function parseInnerContent(content) {
  // 解析所有非交互类短代码
  content = parseCheckbox(content)
  content = parseLamp(content)
  content = parseDotted(content)
  content = parseProgress(content)
  content = parseMtitle(content)
  content = parseMessage(content)
  content = parseCallout(content)
  content = parseAlert(content)
  content = parseAbtn(content)
  content = parseAnote(content)
  content = parseCopy(content)
  content = parseCardDefault(content)
  content = parseCardDescribe(content)
  content = parseCardList(content)
  content = parseHide(content)
  content = parseCloud(content)  // 在内部内容中，云盘解析为 HTML
  content = parseTimeline(content)
  content = parseGird(content)
  content = parseVideo(content)
  content = parseMusic(content)
  content = parseBubbleEmoji(content)
  content = parseAluEmoji(content)
  return content
}

/**
 * 提取标签页和折叠面板数据
 * 这些需要单独渲染为小程序原生组件
 */
function extractInteractiveComponents(content) {
  const components = []

  // 提取标签页 - 支持嵌套的 {tabs-pane} 语法
  const tabsRegex = /\{tabs\}([\s\S]*?)\{\/tabs\}/gi
  let match
  let index = 0

  while ((match = tabsRegex.exec(content)) !== null) {
    const tabsContent = match[1]

    // 先尝试解析嵌套的 {tabs-pane} 格式
    const tabsPaneRegex = /\{tabs-pane([^}]*?)\}([\s\S]*?)\{\/tabs-pane\}/gi
    const tabs = []
    let paneMatch

    while ((paneMatch = tabsPaneRegex.exec(tabsContent)) !== null) {
      const attrs = parseAttributes(paneMatch[1])
      const label = attrs.label || `标签 ${tabs.length + 1}`
      let paneContent = paneMatch[2].trim()

      // 解析 tabs-pane 内部的短代码
      paneContent = parseInnerContent(paneContent)

      tabs.push({
        title: label,
        content: paneContent
      })
    }

    // 如果没有找到 tabs-pane，则尝试旧的 title:::content 格式
    if (tabs.length === 0) {
      const items = tabsContent.trim().split('\n').filter(item => item.trim())
      items.forEach(item => {
        const [title, ...contentParts] = item.split(':::')
        let itemContent = contentParts.join(':::').trim()

        // 解析内容中的短代码
        itemContent = parseInnerContent(itemContent)

        tabs.push({
          title: (title || '').trim(),
          content: itemContent
        })
      })
    }

    if (tabs.length > 0) {
      components.push({
        type: 'tabs',
        id: `tabs_${index++}`,
        data: tabs,
        placeholder: match[0]
      })
    }
  }

  // 提取折叠面板
  const collapseRegex = /\{collapse\}([\s\S]*?)\{\/collapse\}/gi
  index = 0

  while ((match = collapseRegex.exec(content)) !== null) {
    const items = match[1].trim().split('\n').filter(item => item.trim())
    const panels = items.map(item => {
      const [title, ...contentParts] = item.split(':::')
      let panelContent = contentParts.join(':::').trim()

      // 解析折叠面板内部的短代码
      panelContent = parseInnerContent(panelContent)

      return {
        title: (title || '').trim(),
        content: panelContent,
        expanded: false
      }
    })
    components.push({
      type: 'collapse',
      id: `collapse_${index++}`,
      data: panels,
      placeholder: match[0]
    })
  }

  // 提取云盘下载
  const cloudRegex = /\{cloud([^}]*?)\}/gi
  index = 0

  while ((match = cloudRegex.exec(content)) !== null) {
    const attrs = parseAttributes(match[1])
    const type = attrs.type || '_default'
    const title = attrs.title || '' // 获取自定义标题

    const cloudInfo = cloudTypes[type] || cloudTypes['_default']

    // 优先使用 title，如果没有 title 则使用默认网盘名称
    const displayName = title || cloudInfo.name

    components.push({
      type: 'cloud',
      id: `cloud_${index++}`,
      data: {
        cloudType: type,
        name: displayName, // 使用优先级处理后的名称
        icon: cloudInfo.icon,
        url: attrs.url || '',
        password: attrs.password || ''
      },
      placeholder: match[0]
    })
  }

  return components
}

/**
 * 将标签页和折叠面板替换为占位符
 */
function replaceInteractiveWithPlaceholders(content, components) {
  components.forEach(comp => {
    const placeholder = `<!--INTERACTIVE_${comp.type.toUpperCase()}_${comp.id}-->`
    content = content.replace(comp.placeholder, placeholder)
  })
  return content
}

/**
 * 主解析函数 - 解析所有短代码
 * @param {string} content - 原始内容
 * @returns {object} - { html: 处理后的HTML, components: 交互组件数据 }
 */
function parseShortcodes(content) {
  if (!content) return { html: '', components: [] }

  // 1. 先提取交互组件（标签页、折叠面板）
  const components = extractInteractiveComponents(content)

  // 2. 替换交互组件为占位符
  content = replaceInteractiveWithPlaceholders(content, components)

  // 3. 解析其他短代码
  content = parseCheckbox(content)
  content = parseLamp(content)
  content = parseDotted(content)
  content = parseProgress(content)
  content = parseMtitle(content)
  content = parseMessage(content)
  content = parseCallout(content)
  content = parseAlert(content)
  content = parseAbtn(content)
  content = parseAnote(content)
  content = parseCopy(content)
  content = parseCardDefault(content)
  content = parseCardDescribe(content)
  content = parseCardList(content)
  content = parseHide(content)
  // parseCloud 已移至交互组件处理
  content = parseTimeline(content)
  content = parseGird(content)
  content = parseVideo(content)
  content = parseMusic(content)
  content = parseBubbleEmoji(content)
  content = parseAluEmoji(content)

  return {
    html: content,
    components: components
  }
}

module.exports = {
  parseShortcodes,
  parseAttributes,
  extractInteractiveComponents
}
