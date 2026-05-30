# 🎵 DELIX 专辑音频文件设置指南

## 📁 文件结构

请将您的音频和歌词文件按照以下结构放置：

```
public/audio/
├── songs/              # 音频文件（MP3格式）
│   ├── 01-tomorrow.mp3
│   ├── 02-the-real-reason.mp3
│   ├── 03-third-person.mp3
│   └── 04-salmon-and-potatoes.mp3
│
├── lyrics/             # 歌词文件（LRC或TXT格式）
│   ├── 01-tomorrow.lrc
│   ├── 02-the-real-reason.lrc
│   ├── 03-third-person.lrc
│   └── 04-salmon-and-potatoes.lrc
│
└── covers/             # 歌曲封面图片（可选）
    ├── 01-tomorrow.jpg
    ├── 02-the-real-reason.jpg
    ├── 03-third-person.jpg
    └── 04-salmon-and-potatoes.jpg
```

## 🎧 歌曲信息

| # | 歌曲名称 | 文件名前缀 | 状态 |
|---|---------|-----------|------|
| 1 | Tomorrow | `01-tomorrow` | ✅ 默认解锁 |
| 2 | The Real Reason | `02-the-real-reason` | 🔒 需要解锁 |
| 3 | Third Person | `03-third-person` | 🔒 需要解锁 |
| 4 | Salmon and Potatoes | `04-salmon-and-potatoes` | 🔒 需要解锁 |

## 📝 歌词格式

### 推荐：LRC格式（带时间轴）

LRC格式可以实现歌词同步显示效果，格式如下：

```lrc
[00:00.00]歌曲标题 - Tomorrow
[00:05.00]
[00:12.50]第一句歌词
[00:18.20]第二句歌词
[00:24.10]第三句歌词
[00:30.50]
[00:32.00]副歌部分
```

**时间格式说明：**
- `[mm:ss.xx]` - 分钟:秒.百分之一秒
- 例如 `[01:23.45]` = 1分23秒45

### 备选：TXT格式（纯文本）

如果没有时间轴，也可以使用纯文本格式：

```txt
歌曲标题 - Tomorrow

第一句歌词
第二句歌词
第三句歌词

副歌部分
```

## 🖼️ 封面图片要求（可选）

- **格式：** JPG, PNG, WEBP
- **尺寸：** 建议 800x800px 或更大（正方形）
- **文件大小：** 建议不超过 500KB

## ⚙️ 数据配置

歌曲数据已配置在 `data/albumData.ts` 文件中，包含：

- 歌曲标题（中英日三语）
- 文件路径
- 主题色彩
- 解锁状态
- 歌曲描述

如需修改，请编辑该文件。

## 🚀 下一步

1. ✅ 将音频文件（MP3）放入 `public/audio/songs/`
2. ✅ 将歌词文件（LRC）放入 `public/audio/lyrics/`
3. ✅ （可选）将封面图片放入 `public/audio/covers/`
4. 🎵 刷新网站即可测试

## 📌 注意事项

- **文件命名必须严格按照上述格式**，否则无法正确加载
- MP3文件建议使用 128kbps 或更高的比特率
- LRC歌词文件必须使用UTF-8编码
- 如果某首歌没有歌词，可以创建空的LRC文件

---

**需要帮助？** 请查看项目文档或联系开发者。
