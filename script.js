class ChatApp {
    constructor() {
        this.init();
        this.setupEventListeners();
        this.setupVoiceRecognition();
        this.messages = [];
    }

    init() {
        this.messageInput = document.getElementById('messageInput');
        this.chatMessages = document.getElementById('chatMessages');
        this.sendBtn = document.getElementById('sendBtn');
        this.voiceBtn = document.getElementById('voiceBtn');
        this.clearChatBtn = document.getElementById('clearChatBtn');
        this.voiceStatus = document.getElementById('voiceStatus');
        this.loadingOverlay = document.getElementById('loadingOverlay');

        // 自动调整输入框高度
        this.messageInput.addEventListener('input', this.autoResizeTextarea.bind(this));
    }

    setupEventListeners() {
        // 发送按钮点击事件
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        
        // 输入框回车发送（Shift+Enter换行）
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // 清空对话按钮
        this.clearChatBtn.addEventListener('click', () => this.clearChat());

        // 语音按钮
        this.voiceBtn.addEventListener('click', () => this.toggleVoiceRecognition());

        // 输入框内容变化时更新发送按钮状态
        this.messageInput.addEventListener('input', () => {
            this.updateSendButtonState();
        });

        this.updateSendButtonState();
    }

    setupVoiceRecognition() {
        // 检查浏览器是否支持语音识别
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'zh-CN';

            this.recognition.onstart = () => {
                this.voiceBtn.classList.add('active');
                this.voiceStatus.classList.add('active');
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.messageInput.value = transcript;
                this.autoResizeTextarea();
                this.updateSendButtonState();
            };

            this.recognition.onend = () => {
                this.voiceBtn.classList.remove('active');
                this.voiceStatus.classList.remove('active');
            };

            this.recognition.onerror = (event) => {
                console.error('语音识别错误:', event.error);
                this.voiceBtn.classList.remove('active');
                this.voiceStatus.classList.remove('active');
                this.showError('语音识别出错，请重试');
            };
        } else {
            // 如果不支持语音识别，隐藏语音按钮
            this.voiceBtn.style.display = 'none';
            console.warn('浏览器不支持语音识别功能');
        }
    }

    toggleVoiceRecognition() {
        if (!this.recognition) {
            this.showError('您的浏览器不支持语音识别功能');
            return;
        }

        if (this.voiceBtn.classList.contains('active')) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
    }

    autoResizeTextarea() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 100) + 'px';
    }

    updateSendButtonState() {
        const hasText = this.messageInput.value.trim().length > 0;
        this.sendBtn.disabled = !hasText;
        this.sendBtn.style.opacity = hasText ? '1' : '0.5';
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        // 添加用户消息到界面
        this.addMessage(message, 'user');
        
        // 清空输入框
        this.messageInput.value = '';
        this.autoResizeTextarea();
        this.updateSendButtonState();

        // 滚动到底部
        this.scrollToBottom();

        // 显示加载状态
        this.showLoading(true);

        try {
            // 调用AI接口
            const response = await this.callAIAPI(message);
            this.addMessage(response, 'ai');
        } catch (error) {
            console.error('API调用失败:', error);
            this.addMessage('抱歉，服务暂时不可用，请稍后重试。', 'ai');
        } finally {
            this.showLoading(false);
            this.scrollToBottom();
        }
    }

    async callAIAPI(message) {
        // ===========================================
        // API配置区域 - 请根据你的后端API修改以下内容
        // ===========================================
        
        // 1. 修改为你的实际API地址
        const API_URL = 'https://your-api-endpoint.com/chat';
        // 示例：
        // const API_URL = 'http://localhost:3000/api/chat';  // 本地开发
        // const API_URL = 'https://api.yourdomain.com/v1/chat';  // 生产环境
        
        // 2. 如果需要API密钥，在这里填入
        const API_KEY = 'your-api-key-here';  // 替换为你的实际API密钥
        
        // 将新消息添加到对话历史
        this.messages.push({ role: 'user', content: message });

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 根据你的API认证方式选择其中一种：
                    'Authorization': `Bearer ${API_KEY}`,  // Bearer Token方式
                    // 'X-API-Key': API_KEY,                 // API Key方式
                    // 'Authorization': `Basic ${btoa('username:password')}`,  // Basic Auth方式
                },
                body: JSON.stringify({
                    // ===========================================
                    // 请求格式 - 根据你的API要求选择其中一种格式
                    // ===========================================
                    
                    // 格式1: OpenAI风格
                    messages: this.messages,
                    model: 'gpt-3.5-turbo',
                    temperature: 0.7,
                    max_tokens: 1000,
                    
                    // 格式2: 自定义风格（取消注释并删除上面的格式1）
                    // message: message,
                    // history: this.messages,
                    // user_id: 'user_123',
                    // session_id: 'session_456',
                    
                    // 格式3: 简单格式（取消注释并删除上面的格式）
                    // query: message,
                    // context: this.messages.slice(-10)  // 只发送最近10条消息
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // ===========================================
            // 响应处理 - 根据你的API响应格式选择其中一种
            // ===========================================
            
            let aiResponse;
            
            // 格式1: OpenAI风格响应 { "choices": [{ "message": { "content": "回复" } }] }
            if (data.choices && data.choices[0]?.message?.content) {
                aiResponse = data.choices[0].message.content;
            }
            // 格式2: 简单响应 { "response": "回复" }
            else if (data.response) {
                aiResponse = data.response;
            }
            // 格式3: 嵌套响应 { "data": { "reply": "回复" } }
            else if (data.data?.reply) {
                aiResponse = data.data.reply;
            }
            // 格式4: 直接字符串响应 "回复内容"
            else if (typeof data === 'string') {
                aiResponse = data;
            }
            // 默认错误处理
            else {
                console.warn('未识别的API响应格式:', data);
                aiResponse = '抱歉，我没有理解您的问题。';
            }
            
            // 将AI回复添加到对话历史
            this.messages.push({ role: 'assistant', content: aiResponse });
            
            return aiResponse;
        } catch (error) {
            console.error('API调用错误:', error);
            
            // 如果是开发阶段，返回模拟回复
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                return this.getMockResponse(message);
            }
            
            throw error;
        }
    }

    // 开发阶段的模拟回复
    getMockResponse(message) {
        const mockResponses = [
            '这是一个模拟的AI回复。实际使用时，请配置正确的API端点。',
            '我理解了您的问题。这里是一个示例回答。',
            '感谢您的提问！在实际部署时，我将连接到真正的AI服务。',
            '这是一个演示回复。请在script.js中配置您的API端点。'
        ];
        
        // 根据消息内容返回不同回复
        if (message.includes('你好') || message.includes('您好')) {
            return '您好！很高兴为您服务。有什么可以帮助您的吗？';
        }
        
        return mockResponses[Math.floor(Math.random() * mockResponses.length)];
    }

    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content;
        
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        
        this.chatMessages.appendChild(messageDiv);
    }

    clearChat() {
        // 确认清空对话
        if (confirm('确定要清空所有对话记录吗？')) {
            // 清除所有消息，包括欢迎消息
            this.chatMessages.innerHTML = '';
            
            // 重新添加欢迎消息
            const welcomeDiv = document.createElement('div');
            welcomeDiv.className = 'welcome-message';
            welcomeDiv.innerHTML = `
                <div class="ai-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <p>你好！我是灵犀销转AI，有什么可以帮助你的吗？</p>
                </div>
            `;
            this.chatMessages.appendChild(welcomeDiv);
            
            // 清空对话历史
            this.messages = [];
            
            // 滚动到顶部
            this.chatMessages.scrollTop = 0;
            
            // 显示清空成功提示
            this.showSuccess('对话已清空');
        }
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }

    showLoading(show) {
        this.loadingOverlay.classList.toggle('active', show);
    }

    showError(message) {
        // 创建错误提示
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-toast';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4757;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3);
            z-index: 1001;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(errorDiv);
        
        // 3秒后自动移除
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }

    showSuccess(message) {
        // 创建成功提示
        const successDiv = document.createElement('div');
        successDiv.className = 'success-toast';
        successDiv.textContent = message;
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #2ed573;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(46, 213, 115, 0.3);
            z-index: 1001;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(successDiv);
        
        // 2秒后自动移除
        setTimeout(() => {
            successDiv.remove();
        }, 2000);
    }
}

// 添加滑入动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});

// 防止页面刷新时丢失滚动位置
window.addEventListener('beforeunload', () => {
    sessionStorage.setItem('chatScrollPosition', document.getElementById('chatMessages').scrollTop);
});

// 页面加载后恢复滚动位置
window.addEventListener('load', () => {
    const scrollPosition = sessionStorage.getItem('chatScrollPosition');
    if (scrollPosition) {
        document.getElementById('chatMessages').scrollTop = parseInt(scrollPosition);
        sessionStorage.removeItem('chatScrollPosition');
    }
});
