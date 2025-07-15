---
title: 解析器架构
---

# 解析器架构

Server2MCP 的核心优势之一在于其高度可扩展的解析器架构。它不依赖于任何单一的注解标准，而是通过一个可插拔、有序的“责任链”来逐层解析工具（Tool）的元数据。这使得框架能够无缝兼容 Spring AI 原生注解、Swagger、Javadoc 甚至是你自定义的任何标准。

## 设计哲学：责任链模式

想象一下，当框架需要理解一个 Java 方法（例如 `public int add(int a, int b)`）的用途和参数时，它会经历以下两个分离的解析过程：

1.  **描述解析 (Description Parsing)**：确定方法本身的功能。是 `add` 方法吗？它的作用是“计算两数之和”吗？
2.  **参数解析 (Parameter Parsing)**：确定每个参数的细节。参数 `a` 和 `b` 的含义分别是什么？它们是必需的吗？

对于这两个过程，框架都维护着一个独立的 **解析器链（Parser Chain）**。这两条链分别由您在 `application.yml` 中定义的 `plugin.mcp.parser.des` 和 `plugin.mcp.parser.param` 列表构成。

当解析开始时，框架会：
1.  从相应链条的第一个解析器开始尝试。
2.  如果该解析器成功获取到信息（例如，`@McpTool` 注解找到了 `description`），则该解析器完成任务，解析成功。
3.  如果第一个解析器一无所获（例如，方法上没有 `@McpTool` 注解），框架会把任务交给链上的第二个解析器（比如 `ToolDesParser`，它会去寻找 `@Tool` 注解）。
4.  这个过程会一直持续下去，直到有一个解析器成功，或者所有解析器都尝试完毕。

这种设计的精妙之处在于：
- **优先级控制**：你可以通过调整配置中解析器的顺序，来决定哪个注解标准拥有最高解释权。
- **关注点分离**：描述解析与参数解析解耦，允许你混用不同的注解来达到目的。例如，用 `@ApiOperation` (Swagger) 描述方法，同时用 `@McpArg` (MCP) 来精细化描述某个参数。
- **高扩展性**：任何时候，你都可以通过标准的 Java SPI 机制，引入一个新的解析器实现来支持新的注解或元数据来源。

## 核心接口：`AbstractDesParser` & `AbstractParamParser`

所有解析器的行为都由这两个抽象类（及其父类 `AbstractParser`）定义。

- `AbstractDesParser`：负责解析工具的 `name` 和 `description`。
- `AbstractParamParser`：负责解析工具方法中，每个参数的 `name`、`description` 和 `required` 状态。

框架内置了对多种主流注解和标准的实现，您可以在[配置参考 - 解析器枚举](/guide/configuration.md#解析器枚举)中查看完整列表。

## SPI 扩展：实现你自己的解析器

如果内置解析器无法满足您的需求（例如，公司内部有自定义的一套注解），您可以通过 SPI 机制轻松扩展。

### 步骤 1: 定义你的解析器

假设我们要添加一个解析器，用于从一个虚构的 `@MyCompanyTool` 注解中读取描述。

```java
// 在你的扩展模块中
import com.ai.plug.core.parser.tool.des.AbstractDesParser;
import com.ai.plug.data.ToolMeta;
import java.lang.reflect.Method;

// 1. 实现 AbstractDesParser
public class MyCompanyDesParser extends AbstractDesParser {

    @Override
    protected void doParse(Method method, ToolMeta.ToolMetaBuilder builder) {
        // 2. 编写解析逻辑
        MyCompanyTool annotation = method.getAnnotation(MyCompanyTool.class);
        if (annotation != null && !annotation.description().isBlank()) {
            // 3. 如果找到，就填充 builder
            builder.description(annotation.description());
        }
        // 如果没找到，什么也不做，让责任链中的下一个解析器继续
    }
}
```

### 步骤 2: 注册为 SPI 服务

在您的 `resources` 目录下，创建 `META-INF/services/` 文件夹，并创建一个文件，其名称为描述解析器接口的全限定名：

`META-INF/services/com.ai.plug.core.parser.tool.des.AbstractDesParser`

在该文件中，写入您的自定义实现的完整类名：

```
com.your.package.MyCompanyDesParser
```

### 步骤 3: 在配置中使用

现在，您就可以在 `application.yml` 中使用这个新的解析器了（假设它被赋予了 `MY_COMPANY` 的标识名）：

```yaml
plugin:
  mcp:
    parser:
      des: [MY_COMPANY, MCPTOOL, TOOL] # 将自定义的解析器放在最前面
```

通过以上三步，您就成功地将自定义逻辑无缝融入了 Server2MCP 的解析流程中，而无需修改任何框架源码。 