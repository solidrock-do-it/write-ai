// 测试 Tauri AI 代理功能
// 使用方法: 在 Tauri 开发模式下,在浏览器控制台运行此脚本

async function testTauriAIProxy() {
  console.log("=== Tauri AI Proxy 测试 ===");

  // 检查 Tauri 环境
  const isTauri = typeof window !== "undefined" && "__TAURI__" in window;
  console.log(`Tauri 环境: ${isTauri ? "✅ 是" : "❌ 否"}`);

  if (!isTauri) {
    console.error("❌ 请在 Tauri 环境中运行此测试 (npm run tauri:dev)");
    return;
  }

  try {
    const { invoke } = await import("@tauri-apps/api/core");

    // 测试配置 - 请替换为您的实际 API Key
    const testConfig = {
      provider: "qwen",
      api_key: "YOUR_API_KEY_HERE", // ⚠️ 替换为真实 API Key
      prompt: "你好,请用一句话介绍你自己。",
      model: "qwen-plus",
      proxy_url: null, // 如需代理,设置代理 URL
    };

    console.log("📤 发送测试请求...");
    console.log("配置:", {
      ...testConfig,
      api_key: "***", // 隐藏 API Key
    });

    const response = await invoke("ai_proxy_request", {
      request: testConfig,
    });

    console.log("📥 收到响应:");
    console.log("Success:", response.success);

    if (response.success) {
      console.log("✅ 测试成功!");
      console.log("Content:", response.content);
    } else {
      console.error("❌ 测试失败:", response.error);
    }
  } catch (error) {
    console.error("❌ 测试异常:", error);
  }
}

// 导出测试函数
if (typeof window !== "undefined") {
  window.testTauriAIProxy = testTauriAIProxy;
  console.log("✅ 测试函数已就绪,请在控制台运行: testTauriAIProxy()");
}

export { testTauriAIProxy };
