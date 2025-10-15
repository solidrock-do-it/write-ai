# Tokio 版本依赖问题修复

## 问题描述

构建时遇到以下错误:

```
error: failed to select a version for the requirement `tokio-macros = "~2.6.0"`
candidate versions found which didn't match: 2.5.0, 2.4.0, 2.3.0, ...
location searched: crates.io index
required by package `tokio v1.48.0`
```

## 原因分析

使用 `tokio = { version = "1", features = ["full"] }` 时,Cargo 会自动选择最新的 tokio 1.x 版本(1.48.0)。但是这个版本依赖的 `tokio-macros ~2.6.0` 还没有在 crates.io 上发布,导致构建失败。

## 解决方案

将 tokio 版本固定到一个稳定的版本:

### 修改前

```toml
tokio = { version = "1", features = ["full"] }
```

### 修改后

```toml
tokio = { version = "1.40", features = ["full"] }
```

## 修复步骤

1. **修改 Cargo.toml**

   ```powershell
   # 编辑 src-tauri/Cargo.toml
   # 将 tokio 版本从 "1" 改为 "1.40"
   ```

2. **清理构建缓存**

   ```powershell
   cd src-tauri
   cargo clean
   cd ..
   ```

3. **重新构建**
   ```powershell
   npm run tauri:build
   ```

## 其他可选版本

如果 1.40 版本有问题,可以尝试以下版本:

```toml
# 推荐使用的稳定版本
tokio = { version = "1.40", features = ["full"] }

# 或者使用更早的 LTS 版本
tokio = { version = "1.35", features = ["full"] }

# 或者使用最新稳定版(需要测试)
tokio = { version = "1.41", features = ["full"] }
```

## 验证

构建成功后,你应该看到:

```
   Compiling tokio v1.40.x
   ...
   Finished `release` profile [optimized] target(s) in X.XXs
```

## 注意事项

1. **不要使用通配符版本**: 避免使用 `version = "1"`,这会自动选择最新版本,可能导致不兼容问题
2. **固定版本号**: 使用具体的版本号(如 `1.40`)可以保证构建的稳定性
3. **依赖兼容性**: tokio 1.40 与 reqwest 0.12 和 tauri 2.8.5 完全兼容

## 相关依赖版本

当前项目使用的版本:

```toml
tauri = "2.8.5"
reqwest = { version = "0.12", features = ["json"] }
tokio = { version = "1.40", features = ["full"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
log = "0.4"
```

## 故障排查

### 如果仍然遇到依赖问题

1. **删除 Cargo.lock**

   ```powershell
   Remove-Item src-tauri\Cargo.lock
   ```

2. **更新依赖**

   ```powershell
   cd src-tauri
   cargo update
   cd ..
   ```

3. **检查 Rust 版本**
   ```powershell
   rustc --version
   rustup update
   ```

### 如果构建很慢

首次构建需要下载和编译所有依赖,可能需要 5-15 分钟,这是正常的。

## 参考资料

- [Tokio 文档](https://docs.rs/tokio/)
- [Cargo 依赖管理](https://doc.rust-lang.org/cargo/reference/specifying-dependencies.html)
- [Tauri 构建指南](https://tauri.app/v1/guides/building/)

---

修复时间: 2025-10-15
状态: ✅ 已解决
