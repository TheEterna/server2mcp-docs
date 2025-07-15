---
title: 运行指南
---

# 运行指南

`Server2MCP` 是一个 Spring Boot Starter，它被设计为以依赖库的形式集成到你的项目中，而不是一个独立运行的服务。本指南将引导你完成在本地环境中构建、安装并运行该框架的全过程。

## 先决条件

-   **JDK 17 或更高版本**：确保你的开发环境中已安装并配置好 Java 17+。
-   **Maven 3.6+**：项目使用 Maven 进行构建和依赖管理。

## 步骤一：在本地构建并安装框架

由于 `Server2MCP` 目前尚未发布到 Maven 中央仓库，你需要先从源码将其构建并安装到你的本地 Maven 仓库 (`~/.m2/repository`)。

1.  **克隆项目**
    从 Github 克隆 `Server2MCP` 的主项目。
    ```bash
    git clone https://github.com/TheEterna/server2mcp.git
    ```

2.  **进入项目目录**
    ```bash
    cd server2mcp
    ```

3.  **执行 Maven Install**
    在项目根目录下，执行以下命令。Maven 会自动下载所有依赖、编译源码、运行测试，并将最终的 `jar` 包安装到本地仓库。
    ```bash
    mvn clean install
    ```
    当你看到 `BUILD SUCCESS` 的日志时，意味着框架已成功安装到本地。

## 步骤二：在你的项目中引入依赖

现在，你可以在自己的 Spring Boot 项目中使用 `Server2MCP` 了。

1.  **添加依赖**
    打开你的 `pom.xml` 文件，在 `<dependencies>` 块中加入以下依赖。Maven 会自动从你的本地仓库中找到它。

    ```xml
    <dependency>
        <groupId>com.ai.plug</groupId>
        <artifactId>server2mcp-spring-boot-starter</artifactId>
        <version>1.0.0</version>
    </dependency>
    ```
    > **注意**：请确保 `<version>` 标签中的版本号与你本地构建的版本一致。

2.  **启用 Server2MCP**
    在你的 `application.yml` 或 `application.properties` 文件中，添加最基础的启用配置：

    ```yaml
    plugin:
      mcp:
        enabled: true
    ```

## 步骤三：正常启动你的 Spring Boot 应用

完成以上步骤后，你无需做任何其他事情。像往常一样运行你的 Spring Boot 应用主类的 `main` 方法即可。

```java
@SpringBootApplication
public class MyApplication {

    public static void main(String[] args) {
        SpringApplication.run(MyApplication.class, args);
    }

}
```

框架的自动配置 (`Server2McpAutoConfiguration`) 会在启动时被激活，自动扫描并注册所有 MCP 相关的功能。你可以在控制台日志中看到框架加载的相关信息。

## 验证

启动成功后，你可以：
1.  **检查日志**：查看是否有 `Server2MCP` 相关的启动日志。
2.  **测试工具**：通过你选择的 MCP 客户端（如 `mcp-cli`）连接到你的应用，尝试调用你已定义的工具，验证它们是否按预期工作。

通过以上步骤，你就成功地将 `Server2MCP` 框架集成并运行在了你的项目中。现在，你可以开始享受自动化 AI 能力集成的便利了。 