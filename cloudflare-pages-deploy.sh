# 创建部署脚本文件
touch cloudflare-pages-deploy.sh
# 让脚本可执行
chmod +x cloudflare-pages-deploy.sh
#!/bin/bash
# Cloudflare Pages 部署脚本 - 慢慢学法语

echo "🚀 开始部署【慢慢学法语】到 Cloudflare Pages..."
echo "================================================"

# 检查当前目录
echo "📂 当前目录：$(pwd)"
echo "📁 目录内容："
ls -la

# 1. 安装依赖
echo ""
echo "📦 步骤1：安装依赖..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

# 2. 构建项目
echo ""
echo "🔨 步骤2：构建项目..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi

# 3. 检查构建结果
echo ""
echo "✅ 步骤3：检查构建结果..."
if [ ! -d "dist" ]; then
    echo "❌ 构建失败：dist 目录不存在"
    ls -la
    exit 1
fi

echo "📁 dist 目录内容："
ls -la dist/

# 4. 部署信息
echo ""
echo "🎯 步骤4：部署信息"
echo "================================================"
echo "项目名称：慢慢学法语 (Français Facile)"
echo "构建工具：Vite + React + TypeScript"
echo "构建目录：dist/"
echo "构建文件数：$(find dist -type f | wc -l) 个文件"
echo "================================================"

echo ""
echo "💡 部署方式选择："
echo ""
echo "方式1: 🌐 通过 Cloudflare Dashboard"
echo "      1. 访问 https://dash.cloudflare.com/"
echo "      2. 选择 Workers & Pages"
echo "      3. 点击 Create application → Pages"
echo "      4. 选择 '直接上传' 并上传 dist 文件夹"
echo ""
echo "方式2: ⚙️ 使用 Wrangler CLI（需要先配置）"
echo "      先设置环境变量："
echo "      export CLOUDFLARE_API_TOKEN='你的API令牌'"
echo "      export CLOUDFLARE_ACCOUNT_ID='你的账户ID'"
echo "      然后运行："
echo "      npx wrangler pages deploy dist --project-name=francais-facile"
echo ""
echo "方式3: 🔗 连接 Git 仓库（推荐）"
echo "      1. 将代码推送到 GitHub"
echo "      2. 在 Cloudflare Pages 中选择你的仓库"
echo "      3. 设置构建设置："
echo "         - 构建命令：npm run build"
echo "         - 输出目录：dist"
echo "         - 框架预设：Vite"
echo ""
echo "📊 构建统计："
echo "- Node 版本：$(node --version)"
echo "- npm 版本：$(npm --version)"
echo "- 项目依赖：$(cat package.json | grep -c '"dependencies"' ) 个依赖项"
echo ""
echo "🎉 脚本执行完成！"
