# 删除 .js 文件，使用 .ts 文件
rm vite.config.js

# 确保 vite.config.ts 内容正确
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  server: {
    port: 3000,
    open: true
  }
})
EOF
