# 灵犀销转AI - Node.js部署版本

灵犀销转AI演示应用，基于Node.js和Express框架开发的聊天界面演示。

## 🚀 快速开始

### 环境要求
- Node.js >= 14.0.0
- npm >= 6.0.0

### 安装和运行

#### 方式一：使用启动脚本（推荐）
```bash
# 给脚本添加执行权限
chmod +x start.sh

# 运行启动脚本
./start.sh
```

#### 方式二：手动安装和启动
```bash
# 安装依赖
npm install

# 启动应用
npm start

# 或者使用开发模式（支持热重载）
npm run dev
```

### 访问应用
启动成功后，在浏览器中访问：
- 本地访问: http://localhost:3333

## 📁 项目结构

```
lingxi_demo/
├── index.html          # 主页面
├── styles.css          # 样式文件
├── script.js           # 前端JavaScript
├── server.js           # Node.js服务器
├── package.json        # 项目配置
├── start.sh            # 启动脚本
└── README.md           # 项目说明
```

## 🔧 配置说明

### 服务器配置
- **端口**: 3333 (可通过环境变量 PORT 修改)
- **静态文件**: 自动服务当前目录下的静态文件
- **压缩**: 启用gzip压缩
- **安全**: 使用helmet中间件增强安全性
- **CORS**: 启用跨域资源共享

### 环境变量
```bash
# 设置端口（可选，默认3333）
export PORT=3333

# 设置环境模式（可选，默认development）
export NODE_ENV=production
```

## 🛠️ 开发

### 开发模式
```bash
# 安装开发依赖
npm install

# 启动开发服务器（支持热重载）
npm run dev
```

### 修改端口
如需修改端口，可以：
1. 修改 `server.js` 中的 `PORT` 变量
2. 或者设置环境变量: `PORT=8080 npm start`

## 📝 功能特性

- 🎨 现代化UI设计
- 💬 实时聊天界面
- 🎤 语音输入支持
- 📱 响应式设计
- 🔄 多模式切换（销转A/销转B）
- 🗑️ 清空对话功能
- ⚡ 快速响应

## 🔍 故障排除

### 端口占用问题
```bash
# 查看端口占用
lsof -i :3333

# 停止占用端口的进程
lsof -ti:3333 | xargs kill -9
```

### 依赖安装失败
```bash
# 清除npm缓存
npm cache clean --force

# 删除node_modules重新安装
rm -rf node_modules package-lock.json
npm install
```

### 权限问题
```bash
# 给启动脚本添加执行权限
chmod +x start.sh
```

## 📋 API配置

应用中的API调用配置在 `script.js` 文件中：

```javascript
// 修改API地址
API_URL = 'http://localhost:8888/api/v1/chat/send';
```

## 🚀 生产部署

### 使用PM2部署
```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start server.js --name "lingxi-demo"

# 查看状态
pm2 status

# 重启应用
pm2 restart lingxi-demo
```

### 使用Docker部署
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --production

COPY . .
EXPOSE 3333

CMD ["npm", "start"]
```

## 📄 许可证

ISC License

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目。