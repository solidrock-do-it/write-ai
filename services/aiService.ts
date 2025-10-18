import { AIProvider, AIGeneratedData } from "../types";
import { invoke } from "@tauri-apps/api/core";

// 运行时检测是否在 Tauri 环境中运行（避免在模块加载时在服务器端评估）
export function isTauriEnv(): boolean {
  return typeof window !== "undefined" && "__TAURI__" in window;
}

// 运行时判断是否启用 API 代理模式（仅在非 Tauri 的开发环境下启用）
function isApiProxyEnabled(): boolean {
  return !isTauriEnv() && process.env.NODE_ENV === "development";
}

export interface GenerateOptions {
  provider: AIProvider;
  apiKey: string;
  prompt: string;
  model: string; // 新增模型名称参数
  proxyUrl?: string; // 可选的代理服务器地址
  onChunk?: (chunk: string) => void;
  onComplete?: (data: AIGeneratedData) => void;
  onError?: (error: Error) => void;
}

/**
 * 通过 Tauri command 调用 AI (非流式,一次性返回)
 */
async function generateViaTauri(options: GenerateOptions): Promise<void> {
  const {
    provider,
    apiKey,
    prompt,
    model,
    proxyUrl,
    onChunk,
    onComplete,
    onError,
  } = options;

  try {
    console.log(`[Tauri] Calling ai_proxy_request for ${provider}`);
    console.log(`[Tauri] Request payload:`, {
      provider,
      hasApiKey: !!apiKey,
      promptLength: prompt?.length,
      model,
      proxyUrl,
    });

    const response = await invoke<{
      success: boolean;
      content?: string;
      error?: string;
    }>("ai_proxy_request", {
      request: {
        provider,
        api_key: apiKey,
        prompt,
        model,
        proxy_url: proxyUrl,
      },
    });

    console.log(`[Tauri] Response received:`, {
      success: response.success,
      hasContent: !!response.content,
      contentLength: response.content?.length || 0,
    });

    if (!response.success || !response.content) {
      throw new Error(response.error || "Tauri AI proxy request failed");
    }

    // 一次性显示全部内容
    onChunk?.(response.content);

    // 解析 AI 返回的数据
    const parsedData = parseAIResponse(response.content);
    if (parsedData) {
      onComplete?.(parsedData);
    } else {
      throw new Error("Failed to parse response data");
    }
  } catch (error) {
    console.error("[Tauri] Error:", error);
    onError?.(error as Error);
  }
}

/**
 * 通过 Next.js API 代理调用 AI (非流式,一次性返回)
 */
async function generateViaProxy(options: GenerateOptions): Promise<void> {
  const {
    provider,
    apiKey,
    prompt,
    model,
    proxyUrl,
    onChunk,
    onComplete,
    onError,
  } = options;

  try {
    console.log(`[API Proxy] Using Next.js API route for ${provider}`);
    console.log(`[API Proxy] Request payload:`, {
      provider,
      hasApiKey: !!apiKey,
      promptLength: prompt?.length,
      model,
      proxyUrl,
    });

    const response = await fetch("/api/ai-proxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        provider,
        apiKey,
        prompt,
        model,
        proxyUrl,
      }),
    });

    console.log(`[API Proxy] Response status: ${response.status}`);

    if (!response.ok) {
      // 尝试获取错误详情
      let errorMessage = `API Proxy error: ${response.status} ${response.statusText}`;

      try {
        const contentType = response.headers.get("content-type");
        console.log(`[API Proxy] Error content-type: ${contentType}`);

        if (contentType?.includes("application/json")) {
          const errorData = await response.json();
          console.error("[API Proxy] Error response (JSON):", errorData);
          errorMessage = errorData.error || errorMessage;
        } else {
          const errorText = await response.text();
          console.error("[API Proxy] Error response (Text):", errorText);
          errorMessage = errorText || errorMessage;
        }
      } catch (e) {
        console.error("[API Proxy] Failed to parse error response:", e);
      }

      throw new Error(errorMessage);
    }

    // 解析完整响应
    const result = await response.json();
    console.log(
      `[API Proxy] Received content length: ${result.content?.length || 0}`
    );

    if (result.success && result.content) {
      // 一次性显示全部内容
      onChunk?.(result.content);

      // 解析 AI 返回的数据
      const parsedData = parseAIResponse(result.content);
      if (parsedData) {
        onComplete?.(parsedData);
      } else {
        throw new Error("Failed to parse response data");
      }
    } else {
      throw new Error("No content in response");
    }
  } catch (error) {
    onError?.(error as Error);
  }
}

/**
 * 验证并解析 AI 返回的 JSON 数据
 */
export function parseAIResponse(text: string): AIGeneratedData | null {
  try {
    // 尝试提取 JSON 部分（处理可能包含其他文字的情况）
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in response");
      return null;
    }

    const data = JSON.parse(jsonMatch[0]);

    // 验证数据结构
    if (
      !data.titles ||
      !Array.isArray(data.titles) ||
      data.titles.length !== 5
    ) {
      console.error("Invalid titles format");
      return null;
    }

    if (!data.content || typeof data.content !== "string") {
      console.error("Invalid content format");
      return null;
    }

    if (!data.tags || !Array.isArray(data.tags) || data.tags.length !== 6) {
      console.error("Invalid tags format");
      return null;
    }

    // 验证每个标题的格式
    for (const title of data.titles) {
      if (
        !title.title ||
        typeof title.title !== "string" ||
        typeof title.score !== "number" ||
        title.score < 0 ||
        title.score > 10
      ) {
        console.error("Invalid title format:", title);
        return null;
      }
    }

    return data as AIGeneratedData;
  } catch (error) {
    console.error("Error parsing AI response:", error);
    return null;
  }
}

/**
 * 调用通义千问 API
 */
async function generateWithQwen(options: GenerateOptions): Promise<void> {
  const { apiKey, prompt, proxyUrl, onChunk, onComplete, onError, model } =
    options;

  try {
    const baseUrl =
      "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation";
    const apiUrl = proxyUrl ? `${proxyUrl}/${baseUrl}` : baseUrl;

    console.log("Qwen API URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "X-DashScope-SSE": "enable",
      },
      body: JSON.stringify({
        model,
        input: {
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        },
        parameters: {
          result_format: "message",
          incremental_output: true,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Qwen API error response:", errorText);
      throw new Error(
        `Qwen API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = "";

    if (!reader) {
      throw new Error("No response body");
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data:")) {
          try {
            const jsonStr = line.slice(5).trim();
            if (jsonStr === "[DONE]") continue;

            const data = JSON.parse(jsonStr);
            const content = data.output?.choices?.[0]?.message?.content || "";

            if (content) {
              accumulatedText += content;
              onChunk?.(content);
            }

            // 检查是否完成
            if (data.output?.finish_reason === "stop") {
              const parsedData = parseAIResponse(accumulatedText);
              if (parsedData) {
                onComplete?.(parsedData);
              } else {
                throw new Error("Failed to parse response data");
              }
            }
          } catch (e) {
            console.error("Error parsing SSE data:", e);
          }
        }
      }
    }
  } catch (error) {
    onError?.(error as Error);
  }
}

/**
 * 调用 Gemini API
 */
async function generateWithGemini(options: GenerateOptions): Promise<void> {
  const { apiKey, prompt, proxyUrl, onChunk, onComplete, onError, model } =
    options;

  try {
    // 构造基础 URL
    const baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}`;
    const apiUrl = proxyUrl ? `${proxyUrl}/${baseUrl}` : baseUrl;

    console.log("Gemini API URL:", apiUrl.replace(apiKey, "***"));

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error response:", errorText);
      throw new Error(
        `Gemini API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = "";

    if (!reader) {
      throw new Error("No response body");
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.trim() && line.trim() !== ",") {
          try {
            const data = JSON.parse(line);
            const content =
              data.candidates?.[0]?.content?.parts?.[0]?.text || "";

            if (content) {
              accumulatedText += content;
              onChunk?.(content);
            }
          } catch (e) {
            console.error("Error parsing Gemini response:", e);
          }
        }
      }
    }

    const parsedData = parseAIResponse(accumulatedText);
    if (parsedData) {
      onComplete?.(parsedData);
    } else {
      throw new Error("Failed to parse response data");
    }
  } catch (error) {
    onError?.(error as Error);
  }
}

/**
 * 调用 ChatGPT API
 */
async function generateWithChatGPT(options: GenerateOptions): Promise<void> {
  const { apiKey, prompt, proxyUrl, onChunk, onComplete, onError, model } =
    options;

  try {
    const baseUrl = "https://api.openai.com/v1/chat/completions";
    const apiUrl = proxyUrl ? `${proxyUrl}/${baseUrl}` : baseUrl;

    console.log("ChatGPT API URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ChatGPT API error response:", errorText);
      throw new Error(
        `ChatGPT API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = "";

    if (!reader) {
      throw new Error("No response body");
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data:")) {
          const jsonStr = line.slice(5).trim();
          if (jsonStr === "[DONE]") continue;

          try {
            const data = JSON.parse(jsonStr);
            const content = data.choices?.[0]?.delta?.content || "";

            if (content) {
              accumulatedText += content;
              onChunk?.(content);
            }

            if (data.choices?.[0]?.finish_reason === "stop") {
              const parsedData = parseAIResponse(accumulatedText);
              if (parsedData) {
                onComplete?.(parsedData);
              } else {
                throw new Error("Failed to parse response data");
              }
            }
          } catch (e) {
            console.error("Error parsing ChatGPT response:", e);
          }
        }
      }
    }
  } catch (error) {
    onError?.(error as Error);
  }
}

/**
 * 统一的 AI 生成接口
 */
export async function generateArticle(options: GenerateOptions): Promise<void> {
  const { provider } = options;

  // 优先使用 Tauri 环境
  if (isTauriEnv()) {
    console.log(
      `[AI Service] Using Tauri command for ${provider} (Tauri environment detected)`
    );
    return generateViaTauri(options);
  }

  // 如果启用了 API 代理模式,统一使用代理路由
  if (isApiProxyEnabled()) {
    console.log(
      `[AI Service] Using API proxy mode for ${provider} (NODE_ENV: ${process.env.NODE_ENV})`
    );
    return generateViaProxy(options);
  }

  // 直接调用模式 (仅在生产环境或禁用代理时)
  console.log(
    `[AI Service] Using direct call mode for ${provider} (NODE_ENV: ${process.env.NODE_ENV})`
  );

  // 如果不是 Qwen,在直接调用模式下给出警告
  if (provider !== "qwen") {
    console.warn(
      `[AI Service] Warning: ${provider} may face CORS issues in direct call mode. Consider using Qwen or enabling API proxy.`
    );
  }

  switch (provider) {
    case "qwen":
      return generateWithQwen(options);
    case "gemini":
      return generateWithGemini(options);
    case "chatgpt":
      return generateWithChatGPT(options);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}
