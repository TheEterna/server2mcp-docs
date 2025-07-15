# Server2MCP 文档

本目录使用 [VitePress](https://vitepress.dev) 构建。

## 本地预览

```bash
# 进入 docs 目录
cd server2mcp-docs

# 如果没有 package.json 先初始化
npm init -y

# 安装 VitePress
npm install vitepress@latest -D

# 启动文档
npx vitepress dev
```

浏览器访问 `http://localhost:5173` 查看效果。

## 构建静态站点

```bash
npx vitepress build
```

生成的静态文件位于 `server2mcp-docs/.vitepress/dist`，可部署到 GitHub Pages、Vercel 等平台。

## 目录结构

```
server2mcp-docs
├─ .vitepress        # VitePress 配置
├─ index.md          # 首页
├─ guide/            # 指南
├─ api/              # API 参考
└─ examples/         # 示例
```

## 写作规范

- 所有 Markdown 文件均使用 UTF-8 编码
- 文件开头推荐添加 Frontmatter，如 `title`、`description`
- 代码块务必注明语言，例如 ```java 