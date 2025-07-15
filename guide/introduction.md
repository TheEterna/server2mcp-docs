---
title: 项目介绍
---

# 项目介绍

Server2MCP 是一个 Spring Boot Starter，用于自动集成 MCP（Model Context Protocol）服务。

它提供了如下特性：

- **自动配置**：类似 MyBatis-Plus 之于 MyBatis，非侵入、纯增强  
- **多解析器支持**：Javadoc、Swagger2/3、SpringMVC、Jackson…  
- **注解即注册**：通过 `@ToolScan`、`@ResourceScan`、`@PromptScan` 快速注册工具、资源与提示词  
- **高度可扩展**：开放解析器 SPI，满足个性化需求  

## 设计思路

- **二级过滤**：为 `Tool` 注册提供二级 `Filter`。由于工具（几乎等同于方法）的定义非常宽泛，无需专有注解即可注册，因此必须提供更细粒度的过滤方式。例如，在一个类中，可能只想将 `POST` 请求的接口注册为工具。
- **范式化资源**：`Resource` 等更像是通过方法形式来表示和注册的范式化资源，因此直接使用 `@McpResource` 等对应注解进行注册即可。

## 工作原理

Server2MCP 的核心可理解为 **“将接口开放给 AI”**。

这些接口与普通的 Web 接口本质上并无不同，只是增加了通过 AI 调用的能力。底层依赖 Spring AI 及 MCP 协议标准。你可以通过阅读以下官方文档来深入理解：

- [Model Context Protocol (MCP) :: Spring AI Reference](https://docs.spring.io/spring-ai/reference/api/mcp/mcp-overview.html)
- [Introduction - Model Context Protocol](https://modelcontextprotocol.io/introduction)

阅读下一节 [快速开始](/guide/quickstart) 体验一分钟上手！ 