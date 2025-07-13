# 灵犀销转AI-体验版

一个现代化的AI聊天页面，支持电脑端和移动端自适应，具备语音输入和对话管理功能。采用简洁专业的设计风格，参考Claude和ChatGPT的界面设计理念。

## 功能特点

- 🎨 **现代化UI设计** - 简洁、高级、直观的用户界面
- 📱 **响应式设计** - 完美适配电脑端和移动端
- 🎤 **语音输入** - 支持语音转文字输入（需要现代浏览器支持）
- 🗑️ **清空对话** - 一键清空所有对话历史
- ⚡ **实时对话** - 流畅的对话体验
- 🔄 **API对接** - 预留后端API接口，便于集成

## 项目结构

```
agent chat/
├── index.html          # 主页面
├── styles.css          # 样式文件
├── script.js           # JavaScript逻辑
└── README.md          # 项目说明
```

## 使用方法

### 1. 本地运行

直接在浏览器中打开 `index.html` 文件即可使用。

或者使用本地服务器：

```bash
# 使用Python启动本地服务器
python3 -m http.server 8000

# 或使用Node.js
npx serve .

# 然后在浏览器访问 http://localhost:8000
```

### 2. API配置

项目已预留完整的API接入接口，在 `script.js` 文件中找到 `callAIAPI` 方法，按以下步骤配置：

#### 步骤1：修改API地址
```javascript
// 第149行，修改为你的实际API地址
const API_URL = 'https://your-api-endpoint.com/chat';
// 示例：
const API_URL = 'http://localhost:3000/api/chat';  // 本地开发
const API_URL = 'https://api.yourdomain.com/v1/chat';  // 生产环境
```

#### 步骤2：配置API密钥
```javascript
// 第154行，填入你的API密钥
const API_KEY = 'your-actual-api-key';
```

#### 步骤3：选择认证方式
```javascript
// 在headers中选择其中一种认证方式：
'Authorization': `Bearer ${API_KEY}`,  // Bearer Token方式
// 'X-API-Key': API_KEY,                 // API Key方式  
// 'Authorization': `Basic ${btoa('username:password')}`,  // Basic Auth方式
```

#### 步骤4：选择请求格式
代码支持多种请求格式，根据你的API选择：

**格式1: OpenAI风格**
```javascript
{
    messages: this.messages,
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    max_tokens: 1000
}
```

**格式2: 自定义风格**
```javascript
{
    message: message,
    history: this.messages,
    user_id: 'user_123',
    session_id: 'session_456'
}
```

**格式3: 简单格式**
```javascript
{
    query: message,
    context: this.messages.slice(-10)  // 只发送最近10条消息
}
```

#### 步骤5：响应格式
代码会自动识别以下响应格式：
- OpenAI风格：`{ "choices": [{ "message": { "content": "回复" } }] }`
- 简单响应：`{ "response": "回复" }`
- 嵌套响应：`{ "data": { "reply": "回复" } }`
- 字符串响应：`"回复内容"`

### 3. API接口格式

后端API应该接受以下格式的请求：

```json
{
  "messages": [
    {"role": "user", "content": "用户消息"},
    {"role": "assistant", "content": "AI回复"}
  ],
  "temperature": 0.7,
  "max_tokens": 1000
}
```

期望的响应格式：

```json
{
  "choices": [
    {
      "message": {
        "content": "AI的回复内容"
      }
    }
  ]
}
```

或者简单格式：

```json
{
  "response": "AI的回复内容"
}
```

## 技术特性

### 响应式设计
- 桌面端：800px最大宽度，优雅的大屏体验
- 平板端：适中的布局和交互元素
- 移动端：紧凑的界面，适合单手操作

### 语音输入
- 基于Web Speech API
- 支持中文语音识别
- 实时状态反馈
- 自动处理识别结果

### 用户体验
- 平滑的动画效果
- 智能的输入框自适应高度
- 消息发送状态反馈
- 错误处理和提示

## 浏览器兼容性

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+

**注意：** 语音输入功能需要现代浏览器支持，在不支持的浏览器中会自动隐藏语音按钮。

## 自定义配置

### 修改主题颜色

在 `styles.css` 中修改CSS变量：

```css
/* 主要渐变色 */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* 按钮颜色 */
.send-btn {
    background: linear-gradient(135deg, #667eea, #764ba2);
}
```

### 调整消息样式

可以在 `styles.css` 中修改：
- 消息气泡的圆角大小
- 字体大小和行高
- 头像样式
- 动画效果

## 部署建议

1. **静态网站托管**：可部署到Netlify、Vercel、GitHub Pages等
2. **CDN加速**：建议使用CDN加速字体和图标资源
3. **HTTPS**：语音功能需要HTTPS环境
4. **API跨域**：确保后端API支持跨域请求

## 开发模式

项目包含开发模式的模拟回复功能，当在localhost运行时会返回模拟响应，便于前端开发和测试。

## 常见API示例

### OpenAI兼容API
```javascript
const API_URL = 'https://api.openai.com/v1/chat/completions';
const API_KEY = 'sk-your-openai-key';
// 使用格式1的请求和响应格式
```

### 百度文心一言API
```javascript
const API_URL = 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions';
const API_KEY = 'your-access-token';
// 使用Bearer Token认证
```

### 阿里云通义千问API
```javascript
const API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
const API_KEY = 'your-api-key';
// 使用'Authorization': `Bearer ${API_KEY}`
```

### 自建后端API
```javascript
const API_URL = 'http://your-server.com/api/chat';
// 根据你的API文档选择合适的格式
```

## 注意事项

### 安全性
- ⁉️ **API密钥安全**：生产环境中不要硬编码密钥，建议使用环境变量
- ⚠️ **HTTPS要求**：语音功能需要HTTPS环境才能正常工作

### 跨域问题
如果遇到跨域问题，需要在后端配置CORS：

**Node.js/Express示例：**
```javascript
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
```

### 错误排查
1. **检查控制台**：打开浏览器开发者工具，查看控制台错误信息
2. **检查网络**：查看网络选项卡，确认API请求是否成功
3. **测试API**：使用Postman等工具直接测试API接口

## 开发模式

项目包含开发模式的模拟回复功能，当在localhost运行时会返回模拟响应，便于前端开发和测试。

## 部署建议

1. **静态网站托管**：可部署到Netlify、Vercel、GitHub Pages等
2. **CDN加速**：建议使用CDN加速字体和图标资源
3. **HTTPS部署**：确保生产环境使用HTTPS，语音功能才能正常工作
4. **环境变量**：使用环境变量管理API密钥和配置

## 联系信息

- **项目仓库**：https://github.com/owenlsatwinner/lingxi_demo
- **问题反馈**：请在GitHub上提交Issue

## 许可证

MIT License - 可自由使用和修改。


[Unit]
Description=Lingxi Demo Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/home/lingxi_demo
ExecStart=/usr/local/bin/npx serve -l 3000 .
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target




---
[Unit]
Description=灵犀销转AI演示应用
Documentation=https://github.com/yourusername/lingxi_demo
After=network.target network-online.target
Wants=network-online.target

[Service]
Type=forking
User=nginx
Group=nginx
WorkingDirectory=/var/www/lingxi_demo
ExecStartPre=/usr/sbin/nginx -t
ExecStart=/usr/sbin/nginx
ExecReload=/bin/kill -s HUP $MAINPID
ExecStop=/bin/kill -s QUIT $MAINPID
KillSignal=SIGQUIT
TimeoutStopSec=5
KillMode=mixed
PrivateTmp=true
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target