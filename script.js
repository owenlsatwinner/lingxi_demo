class ChatApp {
    constructor() {
        this.init();
        this.setupEventListeners();
        this.setupVoiceRecognition();
        this.setupDemoTabs();
        this.messages = [];
        this.currentDemo = 'demo1'; // 当前选中的演示模式
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

    setupDemoTabs() {
        // 获取tab按钮元素
        this.tabButtons = document.querySelectorAll('.tab-btn');
        
        // 为每个tab按钮添加点击事件
        this.tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const demoType = button.getAttribute('data-demo');
                this.switchDemo(demoType);
            });
        });
    }

    switchDemo(demoType) {
        // 更新当前演示模式
        this.currentDemo = demoType;
        
        // 更新tab按钮状态
        this.tabButtons.forEach(button => {
            button.classList.remove('active');
            if (button.getAttribute('data-demo') === demoType) {
                button.classList.add('active');
            }
        });
        
        // 清空对话历史，重新开始新的演示
        this.clearChat(true);
        
        // 根据不同演示模式显示不同的欢迎消息
        this.showWelcomeMessage(demoType);
    }

    showWelcomeMessage(demoType) {
        let welcomeText = '';
        if (demoType === 'demo1') {
            welcomeText = '你好！这里是销转A模式，我可以帮您处理客户咨询和产品问题。有什么可以帮助您的吗？';
        } else if (demoType === 'demo2') {
            welcomeText = '你好！这里是销转B模式，我专门负责销售数据分析和业务洞察。请问您想了解哪方面的分析？';
        }
        
        // 添加欢迎消息
        const welcomeDiv = document.createElement('div');
        welcomeDiv.className = 'welcome-message';
        welcomeDiv.innerHTML = `
            <div class="ai-avatar">
                👩‍💼
            </div>
            <div class="message-content">
                <p>${welcomeText}</p>
            </div>
        `;
        
        this.chatMessages.appendChild(welcomeDiv);
        this.scrollToBottom();
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
        // if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        //     return this.getMockResponse(message);
        // }
        // ===========================================
        // API配置区域 - 根据不同演示模式使用不同的API配置
        // ===========================================
        
        let API_URL, API_KEY;
        API_URL = 'http://115.190.130.45:8888/api/v1/chat/send';
        API_KEY = 'your-customer-service-api-key';
        // 将新消息添加到对话历史
        this.messages.push({ role: 'user', content: message });

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 根据你的API认证方式选择其中一种：
                    // 'Authorization': `Bearer ${API_KEY}`,  // Bearer Token方式
                    // 'X-API-Key': API_KEY,                 // API Key方式
                    // 'Authorization': `Basic ${btoa('username:password')}`,  // Basic Auth方式
                },
                body: JSON.stringify({
                    // ===========================================
                    // 请求格式 - 根据你的API要求选择其中一种格式
                    // ===========================================
                    "user_input":  message,
                    "user_unique_id": "test_user_1"

                    // 格式1: OpenAI风格
                    // messages: this.messages,
                    // model: 'gpt-3.5-turbo',
                    // temperature: 0.7,
                    // max_tokens: 1000,
                    
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

            if (data.code === 0 && data.data) {
                aiResponse = data.data.output;
            } else {
                console.warn('未识别的API响应格式:', data);
                aiResponse = '抱歉，我没有理解您的问题。';
            }

            // 格式1: OpenAI风格响应 { "choices": [{ "message": { "content": "回复" } }] }
            // if (data.choices && data.choices[0]?.message?.content) {
            //     aiResponse = data.choices[0].message.content;
            // }
            // // 格式2: 简单响应 { "response": "回复" }
            // else if (data.response) {
            //     aiResponse = data.response;
            // }
            // // 格式3: 嵌套响应 { "data": { "reply": "回复" } }
            // else if (data.data?.reply) {
            //     aiResponse = data.data.reply;
            // }
            // // 格式4: 直接字符串响应 "回复内容"
            // else if (typeof data === 'string') {
            //     aiResponse = data;
            // }
            // 默认错误处理

            
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
        // 根据不同演示模式返回不同的模拟回复
        if (this.currentDemo === 'demo1') {
            // 智能客服模拟回复
            const customerServiceResponses = {
                '你好': '您好！欢迎咨询灵犀智能客服。我可以帮您解答产品问题、处理售后问题或提供技术支持。请问有什么可以帮助您的吗？',
                '产品': '我们的产品线包括智能销售系统、客户管理平台和数据分析工具。每款产品都采用了最新的AI技术，可以显著提高您的业务效率。{#image#https://lf3-appstore-sign.oceancloudapi.com/ocean-cloud-tos/FileBizType.BIZ_BOT_DATASET/68629996258624_1750852150039196079_Yd8wTCuTNS.jpg?lk3s=61a3dea3&x-expires=1753772734&x-signature=DNbhL2PjpW7QmbyawrPt3%2BN0Cx0%3D}您对哪个产品特别感兴趣呢？',
                '价格': '我们提供灵活的价格方案，包括基础版、专业版和企业版。具体价格会根据您的使用需求和规模来定制。建议您联系我们的销售顾问获取详细报价。',
                '售后': '我们提供7x24小时在线支持，包括电话、邮件和在线聊天。还有专业的技术团队可以帮您解决任何技术问题。请问您遇到了什么问题吗？'
            };
            
            // 检查是否匹配关键词
            for (const [keyword, response] of Object.entries(customerServiceResponses)) {
                if (message.includes(keyword)) {
                    return response;
                }
            }
            
            return '感谢您的咨询！作为智能客服，我可以帮您解答产品、价格、售后等问题。请您描述一下具体需要帮助的地方。{#image#https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=产品展示}';
            
        } else if (this.currentDemo === 'demo2') {
            // 销售分析模拟回复
            const salesAnalysisResponses = {
                '销售': '根据最新的销售数据分析，本月销售额较上月增长15.3%。主要增长来源于东部地区和新产品线。需要我提供更详细的分析吗？',
                '客户': '客户分析显示，高价值客户的留存率达到85%，并且平均每客价值提升了12%。建议加大对中高端客户的营销投入。',
                '趋势': '数据预测显示，未朆30天销售趋势将保持上升，预计增长率10-15%。建议适当增加库存和销售人员配置。',
                '报表': '我可以为您生成详细的销售报表，包括时间趋势、地区分布、产品性能和客户分析。请问您需要哪个时间段的报表？'
            };
            
            // 检查是否匹配关键词
            for (const [keyword, response] of Object.entries(salesAnalysisResponses)) {
                if (message.includes(keyword)) {
                    return response;
                }
            }
            
            return '您好！我是销售分析AI，可以帮您分析销售数据、客户趋势和市场表现。请问您想了解哪方面的分析？{#image#https://via.placeholder.com/400x250/10B981/FFFFFF?text=销售数据图表}';
        }
        
        return '这是一个演示回复。请选择上方的tab来体验不同的AI功能。';
    }

    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.innerHTML = sender === 'user' ? '👤' : '👩‍💼';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // 解析内容中的图片链接
        const parsedContent = this.parseMessageContent(content);
        contentDiv.innerHTML = parsedContent;
        
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        
        this.chatMessages.appendChild(messageDiv);
    }

    // 解析消息内容，提取图片链接并转换为HTML
    parseMessageContent(content) {
        // 使用正则表达式匹配 {#image#url} 格式的图片链接
        const imageRegex = /\{#image#([^}]+)\}/g;
        
        // 先用特殊标记替换图片，避免HTML转义影响
        const imageMatches = [];
        let tempContent = content.replace(imageRegex, (match, imageUrl) => {
            const placeholder = `__IMAGE_PLACEHOLDER_${imageMatches.length}__`;
            imageMatches.push(imageUrl);
            return placeholder;
        });
        
        // 对文本内容进行HTML转义
        tempContent = tempContent
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
        
        // 处理换行
        tempContent = tempContent.replace(/\n/g, '<br>');
        
        // 将图片占位符替换为实际的图片HTML
        imageMatches.forEach((imageUrl, index) => {
            const placeholder = `__IMAGE_PLACEHOLDER_${index}__`;
            const imageHtml = `<div class="message-image">
                                <img src="${imageUrl}" alt="图片" onload="this.classList.add('loaded')" onerror="this.classList.add('error')" />
                              </div>`;
            tempContent = tempContent.replace(placeholder, imageHtml);
        });
        
        return tempContent;
    }

    clearChat(skipConfirm = false) {
        // 如果不是tab切换触发，需要确认
        if (!skipConfirm && !confirm('确定要清空所有对话记录吗？')) {
            return;
        }
        
        // 清除所有消息，包括欢迎消息
        this.chatMessages.innerHTML = '';
        
        // 清空对话历史
        this.messages = [];
        
        // 滚动到顶部
        this.chatMessages.scrollTop = 0;
        
        // 如果不是tab切换，显示成功提示
        if (!skipConfirm) {
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
