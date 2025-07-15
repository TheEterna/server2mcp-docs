---
layout: home
hero:
  name: Server2MCP
  text: Spring Boot + MCP
  tagline: 零侵入，快速将 AI 能力融入你的微服务
  actions:
    - theme: brand
      text: 快速开始
      link: /guide
    - theme: alt
      text: 查看 GitHub
      link: https://github.com/TheEterna/server2mcp
features:
  - icon: ⚡️
    title: 无侵入集成
    details: 只需添加依赖和注解，立刻拥有 AI 功能
  - icon: 🔌
    title: 丰富解析器
    details: Javadoc / Swagger / SpringMVC 全部支持
  - icon: 🧩
    title: 高度扩展
    details: SPI 机制，满足任意自定义
footer: MIT Licensed | © 2025 Han
---

## 为什么选择 Server2MCP?

> 在正式动手之前，让我们先思考：**为什么要把 AI 工具链嵌入微服务？**
>
> 1. **生产效率** : 让 LLM 直接调用后端方法，帮你写测试、生成脚本或查询数据。
> 2. **一致性** : 使用统一的注解模型（自定义 `@Mcp*` + Spring AI `@Tool`），无须额外 Glue 代码。
> 3. **可控性** : `scope` / `enabled` 开关可精准限定扫描范围，避免误暴露敏感接口。
> 4. **可扩展** : 解析器链完全 SPI 化，随时插拔、排序，适配任何第三方标准。

这一切都只需 **一行依赖 + 几个注解**，即可在现有 Spring Boot 服务上获得 AI 调用能力。

---

## 五分钟上手

```bash
# 1️⃣  添加依赖（Maven）
<dependency>
  <groupId>com.ai</groupId>
  <artifactId>server2mcp-starter</artifactId>
  <version>1.0.0</version>
</dependency>

# 2️⃣  启用功能（application.yml）
plugin:
  mcp:
    enabled: true

# 3️⃣  编写工具
@Component
public class Calculator {
  @McpTool(name = "add", description = "计算两数之和")
  public int add(int a, int b) {
    return a + b;
  }
}

# 4️⃣  启动应用，访问 /v3/mcp/spec 查看自动生成的工具规范
```

> **提示**：如果你同时引入了 SpringDoc/OpenAPI，你甚至可以在同一个 Swagger UI 中直接测试工具（但不会注入MCP特有功能类）。

---

## 核心模块速览

| 模块 | 作用 |
|------|------|
| `mcp-annotations` | 定义 `@McpTool`、`@McpResource` 等标记性注解 |
| `server2mcp-core` | 扫描 & 注册逻辑、解析器链实现 |
| `server2mcp-autoconfigure`| Spring Boot Starter & 条件装配 |
| `server2mcp-spring-boot-starters` | 该模块用于构建一系列 spring-boot-starter |
| `server2mcp-docs` | 基于 VitePress 的项目文档 |
| `server2mcp-test` | 测试模块，非项目模块 |

更多细节请阅读[项目结构介绍](/guide/introduction#项目结构)。

---

## 社区与反馈

- GitHub Issues: 用于 **Bug 报告** 与 **功能请求**
- Discussions: 任何想法、最佳实践或踩坑心得都欢迎分享
- Pull Requests: 始终欢迎你的贡献！

<p align="center">
  <a href="https://github.com/TheEterna/server2mcp/stargazers"><img src="https://img.shields.io/github/stars/TheEterna/server2mcp?style=social" alt="Star" /></a>
</p>

---

## 生态系统与友情链接

Server2MCP 构建于强大的开源生态之上，并与之紧密协作。

- **[MCP JAVA-SDK](https://github.com/modelcontextprotocol/java-sdk)**: Server2MCP 的基石, 本项目基于此开发
- **[Spring AI](https://spring.io/projects/spring-ai)**: ai 交互逻辑参考
- **[mcp-annotations](https://github.com/spring-ai-community/mcp-annotations)**: 本项目的核心注解模块
