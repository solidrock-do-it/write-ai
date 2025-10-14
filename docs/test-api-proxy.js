/**
 * API 代理测试脚本
 *
 * 在浏览器控制台运行此脚本来测试 API 代理是否正常工作
 */

async function testAPIProxy() {
  console.log("========================================");
  console.log("开始测试 API 代理");
  console.log("========================================");

  // 测试数据
  const testPayload = {
    provider: "gemini",
    apiKey: "test-api-key-12345",
    prompt: "这是一个测试提示词",
    proxyUrl: "http://127.0.0.1:10808",
  };

  console.log("\n1. 发送测试请求...");
  console.log("Payload:", testPayload);

  try {
    const response = await fetch("/api/ai-proxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testPayload),
    });

    console.log("\n2. 收到响应:");
    console.log("Status:", response.status, response.statusText);
    console.log("Headers:", Object.fromEntries(response.headers.entries()));

    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      const data = await response.json();
      console.log("\n3. 响应内容 (JSON):");
      console.log(data);

      if (!response.ok) {
        console.error("\n❌ 错误:", data.error);
        console.log("\n可能的原因:");
        console.log("- API Key 无效 (这是测试 Key,预期会失败)");
        console.log("- 代理服务器未运行");
        console.log("- 网络连接问题");
      }
    } else {
      const text = await response.text();
      console.log("\n3. 响应内容 (Text):");
      console.log(text.substring(0, 500));

      if (response.ok) {
        console.log("\n✅ API 代理正常工作! (收到流式响应)");
      }
    }
  } catch (error) {
    console.error("\n❌ 请求失败:");
    console.error(error);
    console.log("\n可能的原因:");
    console.log("- 开发服务器未运行");
    console.log("- API 路由未正确创建");
    console.log("- 网络错误");
  }

  console.log("\n========================================");
  console.log("测试完成");
  console.log("========================================");
}

// 自动运行测试
testAPIProxy();

// 导出函数供手动调用
window.testAPIProxy = testAPIProxy;
