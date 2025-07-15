---
title: 核心定义注解
---

# 核心定义注解

核心定义注解用于声明三种最基本的 AI 能力：工具、资源和提示词。

## @McpTool

将一个 Java 方法标记为一个可供 AI 调用的**工具 (Tool)**。

| 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `name` | `String` | `""` (方法名) | 工具的唯一标识符。 |
| `title` | `String` | `""` | 用于 UI 展示的可读名称。 |
| `description` | `String` | `""` | 工具的功能描述，这是给 LLM 的关键提示。 |
| `mineType` | `String` | `""` | (应为 mimeType) 定义输入/输出的数据类型。 |
| `readOnlyHint` | `boolean` | `false` | 暗示该工具不会修改外部环境。 |
| `destructiveHint` | `boolean` | `false` | 暗示该工具可能执行破坏性操作。 |
| `idempotentHint` | `boolean`| `false` | 暗示重复调用（相同参数）无额外影响。 |
| `openWorldHint` | `boolean` | `false` | (含义待补充) |
| `returnDirect` | `boolean` | `false` | 暗示该工具与外部实体交互。 |
| `converter` | `Class` | `Default...` | 用于转换工具输出结果的转换器。 |

> `openWorldHint`：当设置为 `true` 时，表示该工具可能会访问或修改与当前上下文无关的外部世界状态（如数据库、HTTP 调用）。这有助于提示 AI 避免过度假设调用结果的确定性。

### 自定义结果转换器示例

您可以实现 `McpCallToolResultConverter` 接口，将方法返回值转换为 `CallToolResult`，以便框架能够正确序列化响应。例如：

```java
package com.example.convert;

import com.logaritex.mcp.method.tool.McpCallToolResultConverter;
import io.modelcontextprotocol.spec.McpSchema.CallToolResult;

public class UppercaseConverter implements McpCallToolResultConverter {

    @Override
    public CallToolResult convert(Object original) {
        String upper = original.toString().toUpperCase();
        return CallToolResult.builder().result(upper).build();
    }
}
```

然后在工具方法上指定：

```java
import com.logaritex.mcp.annotation.McpTool;
import org.springframework.stereotype.Component;

@Component
public class Calculator {
    @McpTool(name = "add", description = "计算两个整数的和")
    public int add(int a, int b) {
        return a + b;
    }
}
```

## @McpResource

将一个方法标记为 MCP **资源 (Resource)**。资源通常用于为模型提供动态的上下文信息。

| 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `name` | `String` | `""` | 资源的可读名称。 |
| `title` | `String` | `""` | 资源的UI显示名称。 |
| `uri` | `String` | `""` | 资源的统一定位符。 |
| `description` | `String` | `""` | 资源的描述信息，给模型的提示。 |
| `mimeType` | `String` | `"text/plain"` | 资源的 MIME 类型。 |

**示例**
```java
import com.logaritex.mcp.annotation.McpResource;
import org.springframework.stereotype.Component;

@Component
public class CompanyInfoProvider {
    @McpResource(
        name = "daily_news",
        name = "日常新闻",
        uri = "/company/news/latest",
        description = "获取公司最新发布的新闻",
        mimeType = "application/json"
    )
    public String getLatestNews() {
        // {"title": "...", "content": "..."}
        return "{\"title\": \"Server2MCP v1.0 发布\", \"content\": \"...\"}";
    }
}
```

## @McpPrompt

将一个方法标记为 MCP **提示词 (Prompt)**。它允许你将复杂的提示词模板逻辑封装在 Java 方法中。

| 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `name` | `String` | `""` | 提示词的可读名称。 |
| `description`| `String`| `""` | 提示词功能的描述。 |

**示例**
```java
import com.logaritex.mcp.annotation.McpPrompt;
import com.logaritex.mcp.annotation.McpArg;
import org.springframework.stereotype.Component;

@Component
public class EmailPrompts {
    @McpPrompt(name = "generate_marketing_email", description = "生成一封营销邮件")
    public String generateMarketingEmail(
        @McpArg(description = "产品名称") String productName,
        @McpArg(description = "目标客户画像") String customerProfile
    ) {
        return String.format(
            "请为产品 %s 写一封吸引 %s 的营销邮件。",
            productName,
            customerProfile
        );
    }
}
```
该方法被调用时，将根据传入的参数动态生成最终的提示词，并交由 LLM 执行。

## @McpArg

在为工具、资源或提示词的方法参数提供更丰富的元数据时，`@McpArg` 注解非常有用。它可以显式定义参数的名称、描述和是否必需，从而帮助 AI 更准确地理解和使用这些参数。

| 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `name` | `String` | `""` (参数名) | 参数的名称。 |
| `description` | `String` | `""` | 参数的详细描述，是给 LLM 的关键提示。 |
| `required` | `boolean` | `false` | 标记该参数是否为必需。 |

虽然框架会通过反射自动解析参数名，但在以下情况推荐使用 `@McpArg`：
- 需要提供比参数名更详尽的 `description`。
- Java 编译后丢失了原始参数名（例如，未使用 `-parameters` 编译标志）。
- 希望将某个参数标记为 `required`。

**示例**

在 `@McpPrompt` 的例子中我们已经见过它：

```java
import com.logaritex.mcp.annotation.McpPrompt;
import com.logaritex.mcp.annotation.McpArg;
import org.springframework.stereotype.Component;

@Component
public class EmailPrompts {
    @McpPrompt(name = "generate_marketing_email", description = "生成一封营销邮件")
    public String generateMarketingEmail(
        // 使用 @McpArg 提供了更清晰的描述
        @McpArg(description = "需要推广的产品名称") String productName,
        @McpArg(description = "目标客户群体的详细画像", required = true) String customerProfile
    ) {
        return String.format(
            "请为产品 %s 写一封吸引 %s 的营销邮件。",
            productName,
            customerProfile
        );
    }
}
``` 