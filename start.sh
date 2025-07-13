#!/bin/bash

# 灵犀销转AI - Node.js启动脚本

set -e

echo "🚀 启动灵犀销转AI演示应用..."

# 检查Node.js是否已安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: Node.js未安装"
    echo "请先安装Node.js: https://nodejs.org/"
    exit 1
fi

# 检查npm是否已安装
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: npm未安装"
    echo "请先安装npm"
    exit 1
fi

# 检查package.json是否存在
if [ ! -f "package.json" ]; then
    echo "❌ 错误: package.json文件不存在"
    echo "请确保在项目根目录下运行此脚本"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖包..."
npm install

# 检查端口3333是否被占用
if lsof -Pi :3333 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  警告: 端口3333已被占用"
    echo "正在尝试停止占用端口的进程..."
    lsof -ti:3333 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# 启动应用
echo "�� 启动应用..."
npm start 