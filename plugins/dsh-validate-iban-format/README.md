<p align="center"><strong>校验：iban format</strong></p>

iban format

## 安装（任选一种）

**1）插件市场（推荐）**：在 https://deepseekbase.com/zh/tools/ 搜索 validate_iban_format，点安装。

**2）命令行**：

    dsh plugin --profile web add dsh-validate-iban-format

**3）GitHub monorepo（不经 npm 也能装）**：

    dsh plugin --profile web add github:moldkey/dsh-plugins#path:/plugins/dsh-validate-iban-format

## 能做什么

- iban format
- 本地执行，输入不出机器
- 只注册一个工具，不常驻进程、无需网络

## 用法

在会话里直接说「用iban_format」，或调用工具 validate_iban_format。

    工具: validate_iban_format
    参数: text（必填）

## 示例

输入：

    test@example.com

工具会返回处理结果，末尾带全部工具入口。

## 兼容

- DSH >= 0.2.0-rc.2
- Node 18+
- 无外部依赖

## 更多

- 全部工具：https://deepseekbase.com/zh/tools/
- 同类插件：github.com/moldkey/dsh-plugins

## 许可

MIT
