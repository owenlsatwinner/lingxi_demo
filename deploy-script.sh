#!/bin/bash

# 灵犀销转AI部署脚本
# 适用于CentOS 7/8

set -e

echo "开始部署灵犀销转AI演示应用..."

# 检查是否为root用户
if [[ $EUID -ne 0 ]]; then
   echo "错误: 此脚本需要root权限运行" 
   echo "请使用: sudo $0"
   exit 1
fi

# 安装必要软件包
echo "正在安装必要软件包..."
if command -v yum &> /dev/null; then
    # CentOS 7
    yum update -y
    yum install -y nginx
elif command -v dnf &> /dev/null; then
    # CentOS 8+
    dnf update -y
    dnf install -y nginx
else
    echo "错误: 无法识别的包管理器"
    exit 1
fi

# 创建应用目录
echo "创建应用目录..."
mkdir -p /var/www/lingxi_demo
chown -R nginx:nginx /var/www/lingxi_demo

# 复制应用文件
echo "复制应用文件..."
cp index.html /var/www/lingxi_demo/
cp styles.css /var/www/lingxi_demo/
cp script.js /var/www/lingxi_demo/
chown -R nginx:nginx /var/www/lingxi_demo
chmod -R 755 /var/www/lingxi_demo

# 复制nginx配置
echo "配置nginx..."
cp nginx-lingxi.conf /etc/nginx/conf.d/
nginx -t

# 复制systemd服务文件
echo "配置systemd服务..."
cp lingxi-demo.service /etc/systemd/system/
systemctl daemon-reload

# 配置防火墙（如果firewalld正在运行）
if systemctl is-active --quiet firewalld; then
    echo "配置防火墙..."
    firewall-cmd --permanent --add-service=http
    firewall-cmd --permanent --add-service=https
    firewall-cmd --reload
fi

# 配置SELinux（如果启用）
if command -v getenforce &> /dev/null && [[ $(getenforce) != "Disabled" ]]; then
    echo "配置SELinux..."
    setsebool -P httpd_can_network_connect 1
    restorecon -Rv /var/www/lingxi_demo
fi

# 启动服务
echo "启动服务..."
systemctl enable nginx
systemctl start nginx
systemctl enable lingxi-demo
systemctl start lingxi-demo

# 检查服务状态
echo "检查服务状态..."
if systemctl is-active --quiet nginx; then
    echo "✓ Nginx服务正在运行"
else
    echo "✗ Nginx服务启动失败"
    systemctl status nginx
fi

if systemctl is-active --quiet lingxi-demo; then
    echo "✓ 灵犀销转AI服务正在运行"
else
    echo "✗ 灵犀销转AI服务启动失败"
    systemctl status lingxi-demo
fi

# 获取服务器IP
SERVER_IP=$(ip route get 1 | awk '{print $7; exit}')

echo ""
echo "====== 部署完成 ======"
echo "应用已成功部署到: http://$SERVER_IP"
echo "应用文件位置: /var/www/lingxi_demo"
echo "Nginx配置文件: /etc/nginx/conf.d/nginx-lingxi.conf"
echo "服务文件: /etc/systemd/system/lingxi-demo.service"
echo ""
echo "常用命令："
echo "  查看服务状态: systemctl status lingxi-demo"
echo "  重启服务: systemctl restart lingxi-demo"
echo "  查看日志: journalctl -u lingxi-demo -f"
echo "  查看nginx日志: tail -f /var/log/nginx/lingxi_demo.error.log"
echo "" 