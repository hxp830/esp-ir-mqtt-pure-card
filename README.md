# ESP IR MQTT Pure Card

[English](#english) | [中文](#中文)

---

## 中文

### 🎯 简介

**纯MQTT版红外遥控卡片** - 专为 ESPHome 红外设备设计的 Home Assistant 自定义卡片。

**核心特点：**
- ✅ 超级简单：无需任何实体配置
- ✅ 零配置：不需要修改 configuration.yaml
- ✅ 纯MQTT：直接订阅MQTT主题获取红外码
- ✅ 即插即用：3分钟完成安装
- ✅ 双复制按钮：方便复制红外码和MQTT主题

### 📦 安装

#### 方法1：通过 HACS（推荐）

1. 打开 HACS
2. 点击右上角菜单 > **自定义存储库**
3. 添加仓库 URL：
   ```
   https://github.com/hxp830/esp-ir-mqtt-pure-card
   ```
4. 类别选择：**Lovelace**
5. 点击 **添加**
6. 在 HACS 中搜索 "ESP IR MQTT Pure"
7. 点击 **安装**
8. 重启 Home Assistant

#### 方法2：手动安装

1. 下载 `esp-ir-mqtt-pure-card.js`
2. 复制到 `/config/www/esp-ir-mqtt-pure-card.js`
3. 添加资源：
   - **设置 > 仪表盘 > 右上角菜单 > 资源**
   - URL: `/local/esp-ir-mqtt-pure-card.js`
   - 类型: **JavaScript 模块**
4. 刷新浏览器

### 🎨 配置

在仪表盘添加卡片，使用以下配置：

```yaml
type: custom:esp-ir-mqtt-pure-card
title: 红外遥控器
topic_prefix: newchuangan1/ir
language: zh
```

### 📖 配置参数

| 参数 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | ✅ | - | 必须为 `custom:esp-ir-mqtt-pure-card` |
| `title` | ❌ | "红外遥控器" | 卡片标题 |
| `topic_prefix` | ✅ | - | MQTT 主题前缀，如 `newchuangan1/ir` |
| `language` | ❌ | `zh` | 语言：`zh`（中文）或 `en`（英文） |

### 🎮 使用方法

#### 1. 学习红外码
1. 点击 **"开始学习"** 按钮
2. 对准红外接收器按遥控器
3. 卡片顶部自动显示红外码

#### 2. 复制红外码
- 点击红外码区域右上角的 📋 按钮
- 或点击整个红外码区域复制到文本框

#### 3. 发射红外码
- 在文本框中粘贴或输入红外码
- 点击 **"发射"** 按钮
- 或按 `Ctrl+Enter` 快捷发射

#### 4. 复制MQTT主题
- 点击MQTT主题区域右上角的 📋 按钮
- 用于在其他地方（自动化、Node-RED等）使用

### 💡 工作原理

```
卡片加载 → 自动订阅 newchuangan1/ir/stored/last
↓
点击"开始学习" → 发送 MQTT 到 newchuangan1/ir/learn
↓
按遥控器 → ESP发布红外码到 MQTT
↓
卡片收到 → 自动显示红外码
↓
点击"发射" → 发送到 newchuangan1/ir/send/pronto
```

### 🔧 特性

- ✅ 无需创建任何 Home Assistant 实体
- ✅ 文本框内容不会自动清除
- ✅ 两个便捷的复制按钮
- ✅ 实时MQTT订阅，响应极快
- ✅ 显示MQTT发射主题，方便在自动化中使用
- ✅ 支持中英文界面

### 📝 示例：在自动化中使用

```yaml
automation:
  - alias: "定时开空调"
    trigger:
      - platform: time
        at: "07:00:00"
    action:
      - service: mqtt.publish
        data:
          topic: "newchuangan1/ir/send/pronto"
          payload: "0000 006D 0032 0000 0159 00AB..."
```

### 🆘 故障排查

**问题：点击学习没反应**
- 检查 MQTT 连接是否正常
- 查看浏览器控制台（F12）是否有错误
- 确认 ESPHome 设备在线

**问题：按遥控器后不显示红外码**
- 确认 topic_prefix 配置正确
- 在开发者工具 > MQTT 中监听 `主题前缀/#` 查看消息
- 检查 ESPHome 设备的红外接收器配置

### 📄 许可证

MIT License

### 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## English

### 🎯 Introduction

**Pure MQTT IR Remote Card** - A Home Assistant custom card designed for ESPHome infrared devices.

**Key Features:**
- ✅ Super Simple: No entity configuration needed
- ✅ Zero Config: No need to modify configuration.yaml
- ✅ Pure MQTT: Direct MQTT subscription for IR codes
- ✅ Plug and Play: 3-minute installation
- ✅ Dual Copy Buttons: Easy to copy IR codes and MQTT topics

### 📦 Installation

#### Method 1: Via HACS (Recommended)

1. Open HACS
2. Click menu > **Custom repositories**
3. Add repository URL:
   ```
   https://github.com/hxp830/esp-ir-mqtt-pure-card
   ```
4. Category: **Lovelace**
5. Click **Add**
6. Search for "ESP IR MQTT Pure" in HACS
7. Click **Install**
8. Restart Home Assistant

#### Method 2: Manual Installation

1. Download `esp-ir-mqtt-pure-card.js`
2. Copy to `/config/www/esp-ir-mqtt-pure-card.js`
3. Add resource:
   - **Settings > Dashboards > Menu > Resources**
   - URL: `/local/esp-ir-mqtt-pure-card.js`
   - Type: **JavaScript Module**
4. Refresh browser

### 🎨 Configuration

Add card to dashboard with this config:

```yaml
type: custom:esp-ir-mqtt-pure-card
title: IR Remote
topic_prefix: newchuangan1/ir
language: en
```

### 📖 Configuration Options

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `type` | ✅ | - | Must be `custom:esp-ir-mqtt-pure-card` |
| `title` | ❌ | "IR Remote" | Card title |
| `topic_prefix` | ✅ | - | MQTT topic prefix, e.g., `newchuangan1/ir` |
| `language` | ❌ | `zh` | Language: `zh` (Chinese) or `en` (English) |

### 🎮 Usage

#### 1. Learn IR Code
1. Click **"Start Learn"** button
2. Point remote at IR receiver and press button
3. IR code automatically displays at top

#### 2. Copy IR Code
- Click 📋 button at top-right of IR code area
- Or click entire IR code area to copy to textbox

#### 3. Send IR Code
- Paste or type IR code in textbox
- Click **"Send"** button
- Or press `Ctrl+Enter` for quick send

#### 4. Copy MQTT Topic
- Click 📋 button at top-right of MQTT topic area
- Use in automations, Node-RED, etc.

### 💡 How It Works

```
Card loads → Auto-subscribe to newchuangan1/ir/stored/last
↓
Click "Start Learn" → Send MQTT to newchuangan1/ir/learn
↓
Press remote → ESP publishes IR code
↓
Card receives → Auto-display IR code
↓
Click "Send" → Publish to newchuangan1/ir/send/pronto
```

### 🔧 Features

- ✅ No Home Assistant entities required
- ✅ Textbox content never auto-clears
- ✅ Two convenient copy buttons
- ✅ Real-time MQTT subscription, ultra-fast response
- ✅ Display MQTT send topic for automation use
- ✅ Chinese and English support

### 📝 Example: Use in Automation

```yaml
automation:
  - alias: "Turn on AC at 7 AM"
    trigger:
      - platform: time
        at: "07:00:00"
    action:
      - service: mqtt.publish
        data:
          topic: "newchuangan1/ir/send/pronto"
          payload: "0000 006D 0032 0000 0159 00AB..."
```

### 🆘 Troubleshooting

**Issue: Learn button not responding**
- Check MQTT connection
- Check browser console (F12) for errors
- Confirm ESPHome device is online

**Issue: No IR code display after pressing remote**
- Verify topic_prefix is correct
- Monitor MQTT messages in Developer Tools > MQTT
- Check ESPHome device IR receiver configuration

### 📄 License

MIT License

### 🤝 Contributing

Issues and Pull Requests are welcome!
