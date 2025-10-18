# 💻 项目二：Tauri + Next.js 桌面端授权系统

## 一、项目简介

- 该项目是一个基于 Tauri+ Next.js 架构的桌面授权系统，
- 用于在离线环境下运行的软件（例如无人车、工控终端、桌面软件等），
- 实现 本地 License 验证、试用期授权、正式授权切换 的完整逻辑。

## 二、核心目标

- 支持「试用期授权」与「正式授权」两种模式
- 支持离线验证（公钥内嵌 Rust 层）
- 支持联网时从 License Server 更新授权状态
- 提供可视化授权状态（剩余天数、用户信息、设备 ID）
- 支持跨平台构建（Windows / macOS / Linux）

## 三、系统架构

```bash
tauri-next-license/
├── src/ # Next.js 前端 (App Router)
│ ├── app/
│ │ ├── page.js # 主界面
│ │ ├── activate/page.js # 激活页面
│ │ ├── trial/page.js # 试用模式界面
│ │ └── layout.js # 全局授权检测
│ └── utils/licenseClient.js # 公钥验证逻辑
├── src-tauri/
│ ├── src/
│ │ ├── main.rs # Tauri 主程序
│ │ └── license.rs # JWT 验证逻辑（Rust 层）
│ ├── keys/public.pem # 公钥
│ └── tauri.conf.json
└── package.json
```

## 四、主要功能模块

### 1️⃣ 授权类型

| 类型           | 描述               | 默认有效期        |
| -------------- | ------------------ | ----------------- |
| Trial (试用版) | 自动生成，无需登录 | 7 天              |
| Full (正式版)  | 后端签发授权码激活 | 自定义（如 1 年） |

### 2️⃣ 前端逻辑（Next.js 层）

| 模块                                       | 功能                             |
| ------------------------------------------ | -------------------------------- |
| /app/layout.tsx                            | 启动时检测并验证本地 License     |
| /app/components/settings/activateModal.tsx | 激活页面（输入授权码或在线激活） |
| /app/components/page.js                    | 自动申请并保存试用授权           |
| /utils/licenseClient.js                    | 使用 JWT + 公钥验证本地 License  |

### 3️⃣ 后端逻辑（Tauri Rust 层）

| 模块                               | 功能                                  |
| ---------------------------------- | ------------------------------------- |
| license.rs                         | 通过 jsonwebtoken crate 验证 JWT      |
| verify_license_cmd                 | 暴露验证命令供前端调用                |
| save_license()                     | 将授权写入本地文件（如 license.json） |
| load_license()                     | 启动时加载授权信息                    |
| include_str!("../keys/public.pem") | 内嵌公钥防篡改                        |

## 五、授权流程

1. 应用启动 → 读取本地 License 文件
2. 若无 License → 自动申请试用授权（调用 /trial）
3. 验证签名与过期时间
4. 若 License 类型为 trial → 显示剩余天数
5. 用户在激活页输入授权码 → 替换为 full License
6. 断网时仍可离线使用（本地公钥验证）

## 六、技术要点

| 模块       | 技术                              |
| ---------- | --------------------------------- |
| 前端框架   | Next.js (App Router)              |
| 桌面容器   | Tauri (Rust)                      |
| 授权验证   | JWT + RSA256（Rust 端验证）       |
| 存储方式   | 本地文件系统（license.json）      |
| 通信机制   | @tauri-apps/api/tauri 的 invoke() |
| UI 框架    | Tailwind CSS + heroiUI            |
| 多平台支持 | Windows / macOS / Linux           |
| 打包方式   | Tauri build                       |

## 七、安全强化方案

| 风险                  | 防护措施                                        |
| --------------------- | ----------------------------------------------- |
| 手动复制 License 文件 | 绑定设备 ID（CPU/MAC/UUID）                     |
| 修改系统时间绕过试用  | 在 JWT 中加入首次使用时间戳、联网验证时同步修正 |
| 反编译应用获取公钥    | 公钥混淆或 Rust 编译时内嵌                      |
| 离线长期使用试用版    | 试用 license 过期自动锁定界面，仅可联网更新     |

## 八、扩展方向

- 增加 License 云同步与用户中心
- 增加多设备授权管理（授权配额）
- 接入支付系统（自动升级试用 → 正式版）
