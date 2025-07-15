---
title: 快速开始
---

# 快速开始

本章节带你在 **三步** 内把 Server2MCP 集成到你的 Spring Boot 项目。

## 1. 获取依赖

```xml
<dependency>
  <groupId>com.ai.plug</groupId>
  <artifactId>server2mcp-starter-webmvc</artifactId>
  <version>1.0.0</version>
</dependency>
```

## 2. 添加配置

在 `application.yml` 中启用并简单配置：

```yaml
plugin:
  mcp:
    enabled: true
    parser:
      param: JAVADOC, TOOL, SPRINGMVC, JACKSON, SWAGGER2, SWAGGER3
      des:  JAVADOC, TOOL, JACKSON, SWAGGER3, SWAGGER2
    scope: interface
```

## 3. 运行并验证

启动你的 Spring Boot 应用，访问 `/actuator/mcp`（假设你启用了相应端点）即可查看已注册的工具与资源。

> 如果你尚未发布到中央仓库，需要先在模块 `server2mcp-starter-webmvc` 目录下执行 `mvn clean install` 本地安装。

## 注意：`JAVADOC` 解析器
<Tip>
以下内容适用于启用 Javadoc 解析的场景：

Javadoc 的解析逻辑本质上是通过解析源码文件。而线上环境的 Java 代码是以字节码 `.class` 文件的形式存在，所以 Javadoc 解析器默认无法工作。

但考虑到 Javadoc 的注解方式在开发者中仍然流行，提供了一个解决方案：**将源码一同打包到资源目录中**。

如果您使用 Maven，需要添加以下打包配置：
</Tip>

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-resources-plugin</artifactId>
    <executions>
        <execution>
            <id>copy-java-sources</id>
            <phase>prepare-package</phase>
            <goals>
                <goal>copy-resources</goal>
            </goals>
            <configuration>
                <outputDirectory>${project.build.outputDirectory}</outputDirectory>
                <resources>
                    <resource>
                        <directory>src/main/java</directory>
                        <includes>
                            <include>**/*.java</include>
                        </includes>
                    </resource>
                </resources>
            </configuration>
        </execution>
    </executions>
</plugin>
``` 