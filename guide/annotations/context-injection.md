---
title: 上下文注入
---

# 上下文注入：`@McpTool` 进阶

除了定义普通的业务参数外，`@McpTool` 标记的方法还能在其参数列表中声明**特定类型的上下文对象**。框架在执行工具时，会自动识别并注入这些特殊对象，从而让你的工具具备与框架、与当前会话进行深度交互的能力。

这是一种非侵入式的“依赖注入”，你无需任何额外配置，只需在方法签名中添加相应类型的参数即可。

## 可用的注入类型

### 1. `McpLogger`

在任何工具方法中，你都可以声明一个 `McpLogger` 类型的参数。框架会为你注入一个与当前调用链路绑定的日志实例，通过它输出的日志，可以被 MCP 客户端（如实现了 MCP 协议的 IDE 插件）捕获并实时展示给最终用户。

这对于需要向用户**实时反馈进度的长任务**尤其有用。

| 方法 | 说明 |
|---|---|
| `info(String message)` | 发送一条普通信息日志 |
| `warn(String message)` | 发送一条警告日志 |
| `error(String message)` | 发送一条错误日志 |
| `debug(String message)` | 发送一条调试日志 (通常客户端默认不显示) |

**示例：一个带实时反馈的工具**

```java
import com.logaritex.mcp.tool.McpLogger;
import com.logaritex.mcp.annotation.McpTool;
import org.springframework.stereotype.Component;

@Component
public class LongRunningTask {

    @McpTool(name = "process_data", description = "处理一批数据，并实时反馈进度")
    public String processData(McpLogger logger) { // <1>
        logger.info("任务开始，准备处理 100 个数据点...");

        for (int i = 1; i <= 100; i++) {
            try {
                // 模拟处理耗时
                Thread.sleep(100);
                if (i % 10 == 0) {
                    logger.info("已处理 " + i + " / 100..."); // <2>
                }
                if (i == 50) {
                    logger.warn("警告：在第 50 个数据点发现一个可疑值。"); // <3>
                }
            } catch (InterruptedException e) {
                logger.error("任务被中断！" + e.getMessage()); // <4>
                Thread.currentThread().interrupt();
                return "处理失败";
            }
        }

        logger.info("所有数据处理完毕！");
        return "处理成功";
    }
}
```
1.  在方法参数中声明 `McpLogger`，框架将自动注入实例。
2.  使用 `logger.info()` 向客户端发送普通进度信息。
3.  使用 `logger.warn()` 发送警告信息。
4.  使用 `logger.error()` 发送错误信息。

> **思考与权衡**：`McpLogger` 主要用于**面向用户的过程通信**，它不应取代你项目里已有的日志框架（如 SLF4J、Logback）用于**系统调试和审计**的目的。请将它们结合使用，各司其职。

## 高级上下文对象注入

除了 `McpLogger`，框架的注入机制还支持多种功能更强大的上下文对象。它们都遵循相同的模式：**只需在 `@McpTool` 方法签名中声明相应类型的参数，框架便会自动注入实例**。

这使得工具不仅能执行业务逻辑，还能在执行过程中与用户、AI甚至客户端环境进行复杂的双向交互。

---

### 2. `McpElicitation`：向用户请求额外信息

当工具执行到一半，发现缺少必要参数时，传统做法是直接抛出异常。`McpElicitation` 提供了一种更优雅的解决方案：**主动向用户发起问询，请求补充信息**。

| 方法 | 说明 |
|---|---|
| `elicit(String message, Class<?> schema)` | 同步地向用户发送一个带输入规范的消息，并等待用户返回数据。 |
| `elicitAsync(String message, Class<?> schema)` | 异步地向用户发送一个带输入规范的消息。 |

**示例：一个交互式的部署工具**

假设一个部署工具需要知道目标环境，但调用时用户并未提供。此时，工具可以暂停执行，主动询问用户。

```java
import com.ai.plug.core.spec.utils.elicitation.McpElicitation;
import com.logaritex.mcp.annotation.McpTool;
import com.logaritex.mcp.annotation.McpArg;
import io.modelcontextprotocol.spec.McpSchema.ElicitResult;
import org.springframework.stereotype.Component;

@Component
public class DeploymentTools {

    // 定义一个简单的DTO，用于规范用户的输入格式
    public static class DeploymentInfo {
        @McpArg(description = "要部署的环境，例如：dev, staging, prod", required = true)
        public String environment;
    }

    @McpTool(name = "deploy_service", description = "将服务部署到指定环境")
    public String deployService(
        McpElicitation elicitation, // <1> 注入 Elicitation 实例
        @McpArg(description = "服务名称") String serviceName
    ) {
        // <2> 调用 elicit，向用户提问，并要求按 DeploymentInfo.class 格式返回
        ElicitResult result = elicitation.elicit(
            "我需要知道将服务 '" + serviceName + "' 部署到哪个环境？",
            DeploymentInfo.class
        );

        // <3> 从返回结果中获取用户输入
        String environment = result.getArguments().get("environment").toString();

        if (environment == null || environment.isBlank()) {
            return "部署取消，未指定环境。";
        }

        // ... 执行实际的部署逻辑 ...
        return "服务 " + serviceName + " 已成功开始部署到 " + environment + " 环境。";
    }
}
```

1.  在方法参数中声明 `McpElicitation`。
2.  调用 `elicit` 方法。第一个参数是展示给用户的提示信息，第二个参数是一个类，框架会基于它生成输入框并进行校验。
3.  `elicit` 方法会阻塞执行，直到用户提供了输入。`ElicitResult` 中包含了用户提交的数据。

---

### 3. `McpSampling`：反向调用 AI 生成内容

`McpSampling` 是一个强大的工具，它允许你的工具**反过来调用 AI 进行新一轮的推理（Sampling）**。这意味着工具可以将自己的处理结果作为新的提示，请求 AI 进行总结、翻译、格式化或基于该结果的二次创作。

| 方法 | 说明 |
|---|---|
| `sample(List<SamplingMessage> msgs, ...)` | 同步地向 AI 发起一次内容生成请求。 |
| `sampleAsync(List<SamplingMessage> msgs, ...)` | 异步地向 AI 发起一次内容生成请求。 |

**示例：分析日志并由 AI 生成报告**

下面的工具会首先执行一段复杂的日志分析逻辑，然后利用 `McpSampling` 请求 AI 将技术性的分析结果，转换成一段通俗易懂的中文报告。

```java
import com.ai.plug.core.spec.utils.sampling.McpSampling;
import com.logaritex.mcp.annotation.McpTool;
import io.modelcontextprotocol.spec.McpSchema;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class AnalysisTools {

    @McpTool(name = "analyze_and_report", description = "分析系统日志并生成人类可读的报告")
    public String analyzeAndReport(McpSampling sampling) { // <1> 注入 Sampling 实例
        // 假设这里执行了复杂的日志分析，得到了一些技术性结论
        String technicalResult = "Error rate: 5.7%; Latency p99: 1250ms; Key exception: NullPointerException at com.example.Service:123";

        // <2> 构造发给 AI 的新提示
        String promptToAI = "你是一位资深的运维专家。请将以下系统分析结果，转换成一段简洁、通俗易懂的中文报告，指出核心问题并给出建议。\n\n分析结果：\n" + technicalResult;
        
        McpSchema.SamplingMessage userMessage = new McpSchema.SamplingMessage(McpSchema.Role.USER, new McpSchema.TextContent(promptToAI));

        // <3> 调用 sample 方法，让 AI 生成报告
        McpSchema.CreateMessageResult aiResult = sampling.sample(List.of(userMessage));
        McpSchema.TextContent resultContent = (McpSchema.TextContent) aiResult.getMessage().content();

        return resultContent.text(); // 返回由 AI 生成的最终报告
    }
}
```
1.  在方法参数中声明 `McpSampling`。
2.  基于工具的内部逻辑和处理结果，构造一个新的、给 AI 的提示（Prompt）。
3.  调用 `sample` 方法发起调用。框架将把这个请求交由客户端连接的语言模型处理，并返回生成的结果。

---

### 4. `McpRoot`：获取工作区上下文

`McpRoot` 用于获取当前客户端环境的 <b>根路径（Roots）</b>信息。在 IDE 插件这类场景中，"Roots" 通常就是指用户在编辑器里打开的项目根目录。

这为工具提供了感知用户工作区结构的能力，使其能够执行与项目文件相关的操作。

| 方法 | 说明 |
|---|---|
| `listRoots()` | 同步地获取所有根路径列表。 |
| `listRootsAsync()`| 异步地获取所有根路径列表。 |

**示例：在项目中查找所有的 pom.xml 文件**

```java
import com.ai.plug.core.spec.utils.root.McpRoot;
import com.logaritex.mcp.annotation.McpTool;
import io.modelcontextprotocol.spec.McpSchema;
import org.springframework.stereotype.Component;
import java.io.File;
import java.util.ArrayList;
import java.util.List;

@Component
public class ProjectTools {

    @McpTool(name = "find_all_poms", description = "在当前打开的项目中查找所有 pom.xml 文件")
    public List<String> findAllPomFiles(McpRoot mcpRoot) { // <1> 注入 McpRoot 实例
        List<String> pomPaths = new ArrayList<>();
        
        // <2> 获取所有项目根目录
        McpSchema.ListRootsResult rootsResult = mcpRoot.listRoots();

        for (McpSchema.Root root : rootsResult.getRoots()) {
            File projectDir = new File(root.getPath());
            findPomsRecursive(projectDir, pomPaths);
        }

        return pomPaths;
    }

    private void findPomsRecursive(File dir, List<String> pomPaths) {
        if (dir.isDirectory()) {
            File pomFile = new File(dir, "pom.xml");
            if (pomFile.exists() && pomFile.isFile()) {
                pomPaths.add(pomFile.getAbsolutePath());
            }
            File[] files = dir.listFiles();
            if (files != null) {
                for (File file : files) {
                    if (file.isDirectory()) {
                        findPomsRecursive(file, pomPaths);
                    }
                }
            }
        }
    }
}
```
1.  在方法参数中声明 `McpRoot`。
2.  调用 `listRoots()` 获取一个包含所有项目根目录信息的列表。
3.  工具便可以基于这些根路径，执行文件遍历、查找、读写等操作。

### 5. `Mcp...ServerExchange`：底层交换对象

框架还允许注入 `McpSyncServerExchange` 或 `McpAsyncServerExchange` 对象。这些是 MCP 协议的底层交换对象，包含了最原始的请求信息和与客户端通信的能力。

通常情况下，您应该优先使用 `McpLogger`、`McpElicitation` 等上层封装。只有在需要实现非常规的、精细化控制的底层逻辑时，才考虑直接使用 Exchange 对象。 