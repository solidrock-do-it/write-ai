import { AIProvider, AIGeneratedData } from "../types";

export interface GenerateOptions {
  provider: AIProvider;
  apiKey: string;
  prompt: string;
  proxyUrl?: string; // 可选的代理服务器地址
  onChunk?: (chunk: string) => void;
  onComplete?: (data: AIGeneratedData) => void;
  onError?: (error: Error) => void;
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
  const { apiKey, prompt, proxyUrl, onChunk, onComplete, onError } = options;

  try {
    const apiUrl = proxyUrl
      ? `${proxyUrl}/https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation`
      : "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "X-DashScope-SSE": "enable",
      },
      body: JSON.stringify({
        model: "qwen-plus",
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
      throw new Error(`Qwen API error: ${response.statusText}`);
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
  const { apiKey, prompt, proxyUrl, onChunk, onComplete, onError } = options;

  try {
    const apiUrl = proxyUrl
      ? `${proxyUrl}/https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:streamGenerateContent?key=${apiKey}`
      : `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:streamGenerateContent?key=${apiKey}`;

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
      throw new Error(`Gemini API error: ${response.statusText}`);
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
  const { apiKey, prompt, proxyUrl, onChunk, onComplete, onError } = options;

  try {
    const apiUrl = proxyUrl
      ? `${proxyUrl}/https://api.openai.com/v1/chat/completions`
      : "https://api.openai.com/v1/chat/completions";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
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
      throw new Error(`ChatGPT API error: ${response.statusText}`);
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
