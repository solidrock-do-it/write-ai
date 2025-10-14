import { NextRequest, NextResponse } from "next/server";
import fetch from "node-fetch";
import { HttpsProxyAgent } from "https-proxy-agent";

/**
 * AI API 代理路由 - 非流式模式
 * 解决浏览器 CORS 跨域问题，一次性返回完整结果
 */
export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error("[API Proxy] Failed to parse request body:", e);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { provider, apiKey, prompt, model, proxyUrl } = body;

    console.log("[API Proxy] Received request:", {
      provider,
      hasApiKey: !!apiKey,
      hasPrompt: !!prompt,
      promptLength: prompt?.length || 0,
      model: model || "default",
      proxyUrl: proxyUrl || "none",
    });

    // 验证必需参数
    if (!provider) {
      console.error("[API Proxy] Missing provider");
      return NextResponse.json(
        { error: "Missing required parameter: provider" },
        { status: 400 }
      );
    }

    if (!apiKey) {
      console.error("[API Proxy] Missing API key");
      return NextResponse.json(
        { error: "Missing required parameter: apiKey" },
        { status: 400 }
      );
    }

    if (!prompt) {
      console.error("[API Proxy] Missing prompt");
      return NextResponse.json(
        { error: "Missing required parameter: prompt" },
        { status: 400 }
      );
    }

    let apiUrl = "";
    let headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    let requestBody: any = {};

    // 根据不同的 AI 提供商构造请求（非流式）
    if (provider === "qwen") {
      apiUrl =
        "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation";
      headers["Authorization"] = `Bearer ${apiKey}`;
      requestBody = {
        model: model || "qwen-plus",
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
        },
      };
    } else if (provider === "gemini") {
      // 使用非流式 API
      apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${
        model || "gemini-1.0-pro"
      }:generateContent?key=${apiKey}`;
      requestBody = {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      };
    } else if (provider === "chatgpt") {
      apiUrl = "https://api.openai.com/v1/chat/completions";
      headers["Authorization"] = `Bearer ${apiKey}`;
      requestBody = {
        model: model || "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        stream: false,
      };
    } else {
      return NextResponse.json(
        { error: "Unsupported provider" },
        { status: 400 }
      );
    }

    const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;

    console.log(
      `[API Proxy] Provider: ${provider}, URL: ${apiUrl.replace(apiKey, "***")}`
    );
    console.log(`[API Proxy] Using proxy: ${proxyUrl || "No"}`);

    // @ts-ignore
    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
      agent,
    });

    console.log(
      `[API Proxy] Response status: ${response.status} ${response.statusText}`
    );

    if (!response.ok) {
      let errorText = "";
      try {
        errorText = await response.text();
        console.error(`[API Proxy] Error response body:`, errorText);
      } catch (e) {
        console.error(`[API Proxy] Failed to read error body:`, e);
      }

      return NextResponse.json(
        {
          error:
            errorText ||
            `${response.status} ${response.statusText}: API request failed`,
          status: response.status,
          statusText: response.statusText,
        },
        { status: response.status }
      );
    }

    try {
      const responseText = await response.text();
      console.log(
        `[API Proxy] Response received, length: ${responseText.length}`
      );

      let fullText = "";

      if (provider === "qwen") {
        const data = JSON.parse(responseText);
        fullText =
          data.output?.choices?.[0]?.message?.content ||
          data.output?.text ||
          "";
      } else if (provider === "gemini") {
        const data = JSON.parse(responseText);
        const parts = data.candidates?.[0]?.content?.parts || [];
        fullText = parts.map((part: any) => part.text).join("");
      } else if (provider === "chatgpt") {
        const data = JSON.parse(responseText);
        fullText = data.choices?.[0]?.message?.content || "";
      }

      console.log(`[API Proxy] Extracted text length: ${fullText.length}`);

      return NextResponse.json({
        success: true,
        content: fullText,
        provider,
      });
    } catch (error) {
      console.error("[API Proxy] Failed to parse response:", error);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[API Proxy] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
