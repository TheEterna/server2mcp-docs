import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/server2mcp-docs/',
  lang: 'zh-CN',
  title: 'Server2MCP',
  description: '基于 Spring Boot 的 MCP 服务自动集成框架',
  themeConfig: {
    nav: [
      {
        text: '指南',
        items: [
          { text: '项目介绍', link: '/guide/introduction' },
          { text: '快速开始', link: '/guide/quickstart' },
          { text: '注解参考', link: '/guide/annotations' },
          { text: '配置参考', link: '/guide/configuration' },
          { text: '解析器架构', link: '/guide/parsers' },
          { text: '核心功能', link: '/guide/features' },
          { text: '最佳实践', link: '/guide/best-practices' },
          { text: '部署指南', link: '/guide/deploy' }
        ]
      },
      { text: '示例', link: '/examples/multi-agent-dialogue' },
      { text: 'Github', link: 'https://github.com/TheEterna/server2mcp' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: '简介',
          items: [
            { text: '项目介绍', link: '/guide/introduction' }
          ]
        },
        {
          text: '快速入门',
          collapsed: false,
          items: [
            { text: '快速开始', link: '/guide/quickstart' },
            { text: '配置参考', link: '/guide/configuration' },
            { text: '解析器架构', link: '/guide/parsers' }
          ]
        },
        {
          text: '指南',
          collapsed: false,
          items: [
            { text: '注解概述', link: '/guide/annotations/' },
            { text: '核心定义', link: '/guide/annotations/core' },
            { text: '客户端交互', link: '/guide/annotations/context-injection' },
            { text: '自动补全', link: '/guide/annotations/completion' },
          ]
        },
        {
          text: '进阶',
          collapsed: false,
          items: [
            { text: '最佳实践', link: '/guide/best-practices' },
            { text: '运行指南', link: '/guide/running' }
          ]
        }
      ],
      '/examples/': [
        {
          text: '示例',
          items: [
            { text: '多智能体对话', link: '/examples/multi-agent-dialogue' }
          ]
        }
      ]
    },
    outlineTitle: '本页目录',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/TheEterna/server2mcp' }
    ]
  }
}) 