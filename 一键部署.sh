#!/bin/bash
# 羊羊机 v3.0 - 一键部署脚本

echo "🚀 羊羊机 v3.0 - 准备部署..."
echo ""

cd ~/Downloads/GYYG-improved

echo "📦 检查项目..."
if [ ! -f "package.json" ]; then
    echo "❌ 错误：找不到项目文件"
    exit 1
fi

echo "✅ 项目检查完成"
echo ""

echo "🔧 选择部署平台："
echo "1) Vercel（推荐，最简单）"
echo "2) Netlify"
echo "3) 仅构建，不部署"
echo ""
read -p "请选择 (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🚀 使用 Vercel 部署..."
        echo ""

        # 检查是否安装了vercel
        if ! command -v vercel &> /dev/null; then
            echo "📦 安装 Vercel CLI..."
            npm install -g vercel
        fi

        echo ""
        echo "开始部署..."
        vercel

        echo ""
        echo "✅ 部署完成！"
        echo "📱 复制上面显示的网址，发给朋友即可！"
        ;;

    2)
        echo ""
        echo "🚀 使用 Netlify 部署..."
        echo ""

        # 检查是否安装了netlify
        if ! command -v netlify &> /dev/null; then
            echo "📦 安装 Netlify CLI..."
            npm install -g netlify-cli
        fi

        echo ""
        echo "📦 构建项目..."
        npm run build

        echo ""
        echo "开始部署..."
        netlify deploy --prod

        echo ""
        echo "✅ 部署完成！"
        echo "📱 复制上面显示的网址，发给朋友即可！"
        ;;

    3)
        echo ""
        echo "📦 构建项目..."
        npm run build

        echo ""
        echo "✅ 构建完成！"
        echo "📁 构建文件位于: dist/"
        echo "💡 你可以手动部署 dist/ 目录到任何静态托管服务"
        ;;

    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

echo ""
echo "📚 更多信息请查看："
echo "  - 部署指南.md"
echo "  - 完成总结-v3.0图标版.md"
echo ""
echo "🎉 祝使用愉快！"
