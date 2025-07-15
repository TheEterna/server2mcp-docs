---
title: 配置参考
---

# 配置参考

本章节详细列出了 `Server2MCP` 在 `application.yml` / `application.properties` 中可用的全部配置项，并给出默认值及解释。同时，你也会看到框架所依赖的 Spring AI MCP 模块 (`spring.ai.mcp.server.*`) 的关键配置，以便形成完整的上下文。

## 参考可运行示例

```yaml
plugin:
  mcp:
    enabled: true                # 启用 Server2MCP
    scope: interface             # 仅启动时扫描接口
    parser:
      param: [MCPTOOL, TOOL]     # 参数解析器链
      des:   [MCPTOOL, TOOL]     # 描述解析器链

    # 各能力开关（Tool / Resource / Prompt / Complete）
    tool:
      enabled: true
    resource:
      enabled: true
    prompt:
      enabled: true
    complete:
      enabled: true

spring:
  ai:
    mcp:
      server:
        type: sync               # 同步 (sync) / 异步 (async)
```

> 在阅读下方表格前，你可以先按照上面的参考示例启动项目，感受各个开关的效果，然后再根据需求进行精细化调优。

## `plugin.mcp.*` 核心配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `plugin.mcp.enabled` | `boolean` | `false` | 是否启用 Server2MCP 整个自动化能力。 |
| `plugin.mcp.scope` | `interface` / `custom` | `interface` | 扫描范围：<br>• `interface`：启动时自动扫描并注册所有接口工具。<br>• `custom`：完全由用户手动控制扫描行为。 |
| `plugin.mcp.parser.param` | `string[]` | `[]` | 参数解析器链，按照声明顺序依次尝试。详见“解析器枚举”章节。 |
| `plugin.mcp.parser.des` | `string[]` | `[]` | 描述解析器链，按照声明顺序依次尝试。 |
| `plugin.mcp.tool.enabled` | `boolean` | `true` | 是否启用 Tool 能力。 |
| `plugin.mcp.resource.enabled` | `boolean` | `true` | 是否启用 Resource 能力。 |
| `plugin.mcp.prompt.enabled` | `boolean` | `true` | 是否启用 Prompt 能力。 |
| `plugin.mcp.complete.enabled` | `boolean` | `true` | 是否启用 Complete（自动补全）能力。 |

### 组件扫描机制

Server2MCP 提供了强大而灵活的组件扫描机制，它有两种核心模式，由 `plugin.mcp.scope` 属性控制。

#### 默认模式：`scope: interface` (推荐)

在默认设置 (`scope: interface`) 下，Server2MCP 实现了 **“零配置”的自动扫描**。

- **工作原理**：启动时，框架会自动扫描 Spring 应用上下文中**所有已注册的 Bean**。它会检查每一个 Controller 的方法，如果方法上标记了 `@RequestMapping` 及其子注解，就会将其自动注册为 MCP 的相应能力。
- **优势**：开箱即用，你不需要编写任何特定的扫描配置。只需将你的工具类声明为Controller，框架就能自动发现它们，在传统MVC系统中极为高效

```java
// 只需将它声明为一个 Spring Bean
@Controller
public class MySimpleTools {

    @McpTool(description = "一个简单的工具")
    public String myTool() {
        return "Hello from the tool!";
    }
}
```
> 在 `scope: interface` 模式下，框架会自动发现 `MySimpleTools` 中的 `myTool` 方法，无需任何 `@ToolScan` 配置。

#### 自定义模式：`scope: custom`

当你需要更精细地控制哪些 Bean 或包需要被扫描时，可以将模式切换为 `scope: custom`。

- **工作原理**：在此模式下，**框架不会执行任何Tool自动扫描**。你必须通过 `@ToolScan` 注解来显式地告诉框架去哪里寻找工具。
- **优势**：在大型项目或微服务架构中，可以精确控制扫描范围，避免不必要的组件加载，提升启动性能和安全性。

##### 使用 `@...Scan` 注解


| 注解 | 作用 |
|---|---|
| `@ToolScan` | 扫描并注册 `@McpTool` 工具。 |
| `@McpPromptScan`| 扫描并注册 `@McpPrompt` 提示。 |
| `@McpResourceScan`| 扫描并注册 `@McpResource` 资源。|
| `@McpCompleteScan`| 扫描并注册 `@McpComplete` 自动补全。|

**示例：**

```java
@Configuration
// 切换到自定义扫描模式
// plugin.mcp.scope=custom (in application.yml)
@ToolScan("com.example.tools.text") // 仅扫描文本处理相关的工具
@McpPromptScan(basePackages = "com.example.prompts") // 仅扫描指定的提示包
public class MyMcpConfig {
    // ...
}
```

##### Tool过滤器支持更精细的控制

`@ToolScan` 注解还支持 `includeToolFilters` 和 `excludeToolFilters`，允许你基于注解或元注解进行更细粒度的控制。

```java
@ToolScan(
    basePackages = "com.example.tools",
    // 仅包含那些被 @Scan 注解标记的方法 但不包含 @NoScan及其子注解标记的方法，0，
    
    includeToolFilters = {
        @ToolScan.ToolFilter(type = ToolScan.FilterType.ANNOTATION, value=Scan.class)
    },
    // 同时排除掉所有过时的工具
    excludeToolFilters = {
        @ToolScan.ToolFilter(type = ToolScan.FilterType.META_ANNOTATION, value = NoScan.class)
    }
)
public class AdvancedMcpConfig {
    // ...
}
```

> **思考与权衡**：
> - 对于大多数中小型项目，`scope: interface` 的零配置模式是最佳选择。
> - 当项目变得复杂，或需要将不同功能的工具隔离在不同模块时，`scope: custom` 配合 `@...Scan` 注解将提供必要的灵活性和控制力。

### 解析器枚举

下表列出了 `parser.param` 与 `parser.des` 可选值，对应于 `PluginProperties.ParamParserType` / `PluginProperties.DesParserType` 枚举：

| 枚举值 | 作用域 | 简述 |
|--------|--------|------|
| `MCPTOOL` | 参数 + 描述 | **Server2MCP 自定义注解**，优先解析 `@McpTool` / `@McpArg` 等。 |
| `TOOL` | 参数 + 描述 | Spring AI 原生 `@Tool` / `@Parameter` 注解解析。 |
| `JACKSON` | 参数 + 描述 | 读取 Jackson 注解 (`@JsonProperty`、`@JsonAlias` 等) 以推断字段含义。 |
| `SPRINGMVC` | 仅参数 | 解析 Spring MVC 注解 (`@RequestParam`、`@PathVariable` 等)。 |
| `JAVADOC` | 参数 + 描述 | 通过方法 / 参数的 Javadoc 获取注释文本。需要同时构建源码。 |
| `SWAGGER2` | 参数 + 描述 | 兼容 Swagger v2 (`@ApiOperation`、`@ApiParam` …)。 |
| `SWAGGER3` | 参数 + 描述 | 兼容 Swagger v3 / OpenAPI 3 (`@Operation`、`@Parameter` …)。 |

> 建议将自家业务最可信赖的解析器放在列表最前面，以获得最准确的模型提示。

## `spring.ai.mcp.server.*` 关键配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `spring.ai.mcp.server.enabled` | `boolean` | `true` | 是否启用 MCP Server。 |
| `spring.ai.mcp.server.stdio` | `boolean` | `false` | 是否启用 STDIO 传输；适用于 CLI 场景。 |
| `spring.ai.mcp.server.name` | `string` | `mcp-server` | MCP Server 的实例名称，便于客户端识别。 |
| `spring.ai.mcp.server.version` | `string` | `1.0.0` | MCP Server 版本号，可用于灰度发布。 |
| `spring.ai.mcp.server.instructions` | `string` | `null` | 提供给客户端的交互指令说明。 |
| `spring.ai.mcp.server.type` | `sync` / `async` | `sync` | 选择底层 Server 类型：阻塞式 `sync` 或 非阻塞式 `async`。 |
| `spring.ai.mcp.server.capabilities.resource` | `boolean` | `true` | 是否暴露 Resource 能力。 |
| `spring.ai.mcp.server.capabilities.tool` | `boolean` | `true` | 是否暴露 Tool 能力。 |
| `spring.ai.mcp.server.capabilities.prompt` | `boolean` | `true` | 是否暴露 Prompt 能力。 |
| `spring.ai.mcp.server.capabilities.completion` | `boolean` | `true` | 是否暴露 Completion 能力。 |

> 以上属性来源于 Spring AI 官方文档 [MCP Server Boot Starter 配置](https://docs.spring.io/spring-ai/reference/api/mcp/mcp-server-boot-starter-docs.html) 。

该配置直接映射到 `org.springframework.ai.mcp.server.autoconfigure.McpServerProperties.ServerType` 枚举，在 `Conditions` 判断中被使用。若你不需要异步处理，保持默认 `sync` 即可。

## 思考与权衡

在为每个项目制定配置时，请考虑以下因素：

1. **可维护性**：解析器越多，处理链越复杂，问题定位难度增加。优先保留最需要的解析器。
2. **性能**：`JAVADOC` 与 `SWAGGER*` 解析通常依赖反射或额外 I/O，可能拖慢启动速度。
3. **安全性**：谨慎开启具备副作用的 Tool；对于开放 API，确保 `scope` 设定不会扫描到敏感方法。
4. **异步 vs 同步**：高并发场景下推荐 `async`，但需额外考虑 Reactor/Coroutine 生态的学习成本。

通过以上思考，你可以更有信心地做出贴合业务场景的配置选择。更多高级特性（如多模块拆分、运行时动态装卸解析器）将在后续章节展开。 

