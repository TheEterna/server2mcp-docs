---
title: 自动完成
---

# 自动完成：智能输入建议

自动完成是现代交互式应用中不可或缺的功能。`@McpComplete` 注解提供了一种优雅且强大的方式，为用户输入提供实时、上下文相关的智能建议。

## 什么是自动完成？

自动完成是指在用户输入过程中，系统能够实时提供相关的输入建议。这不仅能提高用户体验，还能减少输入错误，加快交互速度。

## 使用场景

`@McpComplete` 注解适用于多种场景：

1. **用户名补全**：在注册或登录界面快速匹配用户名
2. **地理位置建议**：旅行、外卖等应用中的城市/地址输入
3. **技术术语补全**：开发工具中的代码提示
4. **产品搜索**：电商平台的商品名称建议

## 注解详解

### 基本语法

```java
@McpComplete(
    prompt = "目标提示词",  // 指定关联的提示词
    description = "补全功能描述"  // 可选：描述补全的具体用途
)
public List<String> completeSomething(String input) {
    // 返回建议列表
}
```

### 参数类型灵活性

`@McpComplete` 支持多种参数类型：

1. **简单字符串**：最基础的补全方式
```java
@McpComplete(prompt = "user-registration")
public List<String> completeUsername(String prefix) {
    return userDatabase.stream()
        .filter(user -> user.startsWith(prefix))
        .collect(Collectors.toList());
}
```

2. **复杂参数对象**：支持更丰富的上下文信息
```java
@McpComplete(prompt = "travel-planner")
public List<String> completeCityName(CompleteRequest.CompleteArgument argument) {
    String prefix = argument.value();
    String context = argument.context(); // 可获取额外上下文
    return cityDatabase.stream()
        .filter(city -> city.startsWith(prefix))
        .collect(Collectors.toList());
}
```

### 高级特性

#### 1. 上下文感知

补全方法可以获取当前交互的上下文，实现更智能的建议：

```java
@McpComplete(prompt = "code-assistant")
public List<String> completeMethod(
    McpSyncServerExchange exchange,  // 获取交互上下文
    String methodPrefix
) {
    // 根据当前项目、编程语言等上下文提供建议
    ProjectContext context = exchange.getContext(ProjectContext.class);
    return suggestMethodsBasedOnContext(context, methodPrefix);
}
```

#### 2. 异步支持

通过返回 `Mono<List<String>>` 支持异步补全：

```java
@McpComplete(prompt = "async-completion")
public Mono<List<String>> completeAsyncData(String input) {
    return Mono.fromCallable(() -> 
        expensiveCompletionComputation(input)
    ).subscribeOn(Schedulers.boundedElastic());
}
```

## 性能与最佳实践

### 建议列表大小控制
- 限制返回的建议数量（通常 5-10 个）
- 对大型数据集使用高效的过滤和查询策略

### 缓存策略
- 考虑为频繁查询的补全结果实现缓存
- 使用本地缓存或分布式缓存（如 Redis）

### 匹配算法
- 支持前缀匹配
- 可选：模糊匹配、拼音匹配等高级算法

## 配置与扩展

### 扫描配置
使用 `@McpCompleteScan` 精细控制补全组件的扫描：

```java
@Configuration
@McpCompleteScan(
    basePackages = "com.example.completions",
    includeFilters = @McpCompleteScan.Filter(
        type = McpCompleteScan.FilterType.ANNOTATION,
        classes = CustomCompletionMarker.class
    )
)
public class CompletionConfig { }
```

## 思考与权衡

自动完成是一把"双刃剑"：
- **优点**：提升用户体验，减少输入错误
- **风险**：
  1. 过多建议可能造成干扰
  2. 补全算法复杂度可能影响性能
  3. 不恰当的建议可能误导用户

建议：
- 保持补全简洁、相关
- 持续优化匹配算法
- 提供用户可配置的补全行为

> **提示**：自动完成应该是智能的帮手，而非烦人的干扰者。精心设计，用心体验。 