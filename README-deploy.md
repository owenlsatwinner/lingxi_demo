# 灵犀销转AI - CentOS部署指南

本指南提供了在CentOS系统上部署灵犀销转AI演示应用的详细步骤。

## 快速部署

### 自动部署
```bash
# 确保在项目根目录下
chmod +x deploy-script.sh
sudo ./deploy-script.sh
```

### 手动部署

#### 1. 安装依赖
```bash
# CentOS 7
sudo yum update -y
sudo yum install -y nginx

# CentOS 8+
sudo dnf update -y
sudo dnf install -y nginx
```

#### 2. 创建应用目录
```bash
sudo mkdir -p /var/www/lingxi_demo
sudo chown -R nginx:nginx /var/www/lingxi_demo
```

#### 3. 复制应用文件
```bash
sudo cp index.html styles.css script.js /var/www/lingxi_demo/
sudo chown -R nginx:nginx /var/www/lingxi_demo
sudo chmod -R 755 /var/www/lingxi_demo
```

#### 4. 配置Nginx
```bash
sudo cp nginx-lingxi.conf /etc/nginx/conf.d/
sudo nginx -t
```

#### 5. 安装systemd服务
```bash
sudo cp lingxi-demo.service /etc/systemd/system/
sudo systemctl daemon-reload
```

#### 6. 配置防火墙
```bash
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

#### 7. 启动服务
```bash
sudo systemctl enable nginx
sudo systemctl start nginx
sudo systemctl enable lingxi-demo
sudo systemctl start lingxi-demo
```

## 服务管理

### 查看服务状态
```bash
sudo systemctl status lingxi-demo
sudo systemctl status nginx
```

### 重启服务
```bash
sudo systemctl restart lingxi-demo
sudo systemctl restart nginx
```

### 停止服务
```bash
sudo systemctl stop lingxi-demo
```

### 查看日志
```bash
# 服务日志
sudo journalctl -u lingxi-demo -f

# Nginx访问日志
sudo tail -f /var/log/nginx/lingxi_demo.access.log

# Nginx错误日志
sudo tail -f /var/log/nginx/lingxi_demo.error.log
```

## 文件说明

- `lingxi-demo.service` - systemd服务配置文件
- `nginx-lingxi.conf` - Nginx虚拟主机配置文件  
- `deploy-script.sh` - 自动部署脚本

## 配置说明

### systemd服务配置
- **Type**: forking - 使用nginx的fork模式
- **User/Group**: nginx - 以nginx用户身份运行
- **WorkingDirectory**: /var/www/lingxi_demo - 应用工作目录
- **Restart**: on-failure - 失败时自动重启
- **RestartSec**: 5s - 重启间隔时间

### Nginx配置特性
- 静态文件服务
- Gzip压缩
- 安全头设置
- 缓存配置
- 日志记录

## 访问应用

部署完成后，可以通过以下方式访问：
- 本地访问: http://localhost
- 远程访问: http://服务器IP地址

## 故障排除

### 服务无法启动
```bash
# 检查配置文件语法
sudo nginx -t

# 查看详细错误信息
sudo journalctl -u lingxi-demo -n 50

# 检查端口占用
sudo netstat -tlnp | grep :80
```

### 权限问题
```bash
# 检查文件权限
ls -la /var/www/lingxi_demo/

# 重新设置权限
sudo chown -R nginx:nginx /var/www/lingxi_demo
sudo chmod -R 755 /var/www/lingxi_demo
```

### SELinux问题
```bash
# 检查SELinux状态
getenforce

# 配置SELinux策略
sudo setsebool -P httpd_can_network_connect 1
sudo restorecon -Rv /var/www/lingxi_demo
```

## 升级和维护

### 更新应用文件
```bash
# 备份当前版本
sudo cp -r /var/www/lingxi_demo /var/www/lingxi_demo.bak.$(date +%Y%m%d)

# 更新文件
sudo cp index.html styles.css script.js /var/www/lingxi_demo/
sudo chown -R nginx:nginx /var/www/lingxi_demo

# 重启服务
sudo systemctl restart lingxi-demo
```

### 日志轮转
系统会自动处理nginx日志轮转，如需手动配置，请编辑 `/etc/logrotate.d/nginx`。 