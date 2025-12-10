#!/bin/bash
echo "🔧 开始修复项目配置..."

# 1. 修复文件名
if [ -f "Dindex.htm!" ]; then
    mv Dindex.htm! public/index.html
    echo "✅ 重命名 Dindex.htm! → public/index.html"
fi

if [ -f "tsconfigjson" ]; then
    mv tsconfigjson tsconfig.json
    echo "✅ 重命名 tsconfigjson → tsconfig.json"
fi

# 2. 创建部署脚本
cat > cloudflare-pages-deploy.sh << 'EOF'
#!/bin/bash
echo "🚀 慢慢学法语 - Cloudflare 部署脚本"
echo "执行构建: npm run build"
npm run build
echo "✅ 构建完成！请上传 dist 文件夹到 Cloudflare Pages"
EOF

chmod +x cloudflare-pages-deploy.sh
echo "✅ 创建 cloudflare-pages-deploy.sh"

# 3. 创建 GitHub Actions 工作流
mkdir -p .github/workflows
cat > .github/workflows/deploy.yml << 'EOF'
name: Deploy
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: 'francais-facile'
          directory: './dist'
EOF
echo "✅ 创建 .github/workflows/deploy.yml"

# 4. 检查 package.json
echo ""
echo "📦 请检查 package.json 确保包含："
echo '    "scripts": {'
echo '      "deploy": "npm run build"'
echo '    },'
echo '    "devDependencies": {'
echo '      "wrangler": "^3.115.0"'
echo '    }'

echo ""
echo "🎉 修复完成！"
echo "📋 下一步："
echo "1. 修改 package.json"
echo "2. 运行: npm install"
echo "3. 测试: npm run build"
echo "4. 部署: ./cloudflare-pages-deploy.sh"
