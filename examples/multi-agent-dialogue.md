---
title: 综合示例：多智能体对话
---

# 综合示例：多智能体对话

本教程将引导您使用 Server2MCP 构建一个简单的多智能体对话系统。

**场景设定**：
我们模拟一个场景，其中有两个 AI "员工"：
1.  **天气专员 (Weather Agent)**：负责查询天气。
2.  **翻译专员 (Translate Agent)**：负责进行文本翻译。

用户可以通过一个主 AI 对话入口，根据意图自动调用这两个专员的能力。

## 1. 项目结构

在一个标准的 Spring Boot 项目中，我们创建以下包和类：

```
com.example.mcpdemo
├─ McpDemoApplication.java
├─ config
│  └─ McpConfig.java
└─ agent
   ├─ dto
   │  ├─ TranslateRequest.java
   │  └─ WeatherResponse.java
   ├─ WeatherAgent.java
   └─ TranslateAgent.java
```

## 2. 编写 Agent (工具)

### 天气专员

`WeatherAgent` 提供查询天气的功能。这里我们使用 `@McpTool` 注解进行细粒度控制。

```java
// src/main/java/com/example/mcpdemo/agent/WeatherAgent.java
package com.example.mcpdemo.agent;

import com.ai.plug.common.annotation.McpTool;
import org.springframework.stereotype.Component;
import java.util.Random;

@Controller
public class WeatherAgent {

    @GetMapping("/current_weather")
    @McpTool(name = "get_current_weather", description = "获取指定城市的当前天气状况")
    public WeatherResponse getCurrentWeather(String city, String unit) {
        if (city == null || city.isEmpty()) {
            return new WeatherResponse("未知地点", 0);
        }
        // 模拟天气查询逻辑
        int temp = new Random().nextInt(30);
        return new WeatherResponse(city, unit.equals("celsius") ? temp : (temp * 9 / 5 + 32));
    }
}
```
*DTOs for WeatherAgent:*
```java
// src/main/java/com/example/mcpdemo/agent/dto/WeatherResponse.java
package com.example.mcpdemo.agent.dto;

public class WeatherResponse {
    public String location;
    public int temperature;

    public WeatherResponse(String location, int temperature) {
        this.location = location;
        this.temperature = temperature;
    }
    // Getters and Setters...
}
```

### 翻译专员

`TranslateAgent` 提供翻译功能。

```java
// src/main/java/com/example/mcpdemo/agent/TranslateAgent.java
package com.example.mcpdemo.agent;

import com.ai.plug.common.annotation.McpTool;
import org.springframework.stereotype.Component;

@Controller
public class TranslateAgent {

    @PostMapping("/translate")
    @McpTool(description = "将文本翻译成指定的目标语言")
    public String translate(TranslateRequest request) {
        // 模拟翻译逻辑
        return "翻译结果：'" + request.getText() + "' 已被翻译成 " + request.getTargetLanguage();
    }
}
```
*DTOs for TranslateAgent:*
```java
// src/main/java/com/example/mcpdemo/agent/dto/TranslateRequest.java
package com.example.mcpdemo.agent.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class TranslateRequest {
    @JsonProperty(required = true)
    private String text;

    @JsonProperty(value = "target_language", defaultValue = "English")
    private String targetLanguage;
    
    // Getters and Setters...
}
```

## 3. 配置扫描

我们无需为每个 `@McpTool` 方法单独配置，Server2MCP 会自动发现它们。如果使用 `@Component` 等注解，请确保 Spring Boot 的组件扫描能够找到它们。

## 4. 运行与测试

1.  启动 Spring Boot 应用。
2.  使用支持 MCP 的客户端（如 Cursor）连接到您的服务。
3.  向 AI 发出指令：
    - "北京现在天气怎么样？" -> AI 将调用 `get_current_weather`
    - "把 'Hello World' 翻译成中文" -> AI 将调用 `translate`

这个示例展示了如何通过简单的 Java 类和注解，快速地将业务逻辑暴露给 AI，从而构建出强大的多智能体应用。 