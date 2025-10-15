use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize)]
struct AIProxyRequest {
    provider: String,
    api_key: String,
    prompt: String,
    model: String,
    proxy_url: Option<String>,
}

#[derive(Debug, Serialize)]
struct AIProxyResponse {
    success: bool,
    content: Option<String>,
    error: Option<String>,
}

/// AI 代理请求 Command
#[tauri::command]
async fn ai_proxy_request(request: AIProxyRequest) -> Result<AIProxyResponse, String> {
    log::info!(
        "[Tauri AI Proxy] Received request for provider: {}",
        request.provider
    );

    // 创建 HTTP 客户端
    let mut client_builder = reqwest::Client::builder();

    // 如果提供了代理 URL,配置代理
    if let Some(proxy_url) = &request.proxy_url {
        match reqwest::Proxy::all(proxy_url) {
            Ok(proxy) => {
                client_builder = client_builder.proxy(proxy);
                log::info!("[Tauri AI Proxy] Using proxy: {}", proxy_url);
            }
            Err(e) => {
                log::error!("[Tauri AI Proxy] Failed to set proxy: {}", e);
                return Err(format!("Failed to set proxy: {}", e));
            }
        }
    }

    let client = client_builder.build().map_err(|e| e.to_string())?;

    // 根据不同的 AI 提供商构造请求
    let result = match request.provider.as_str() {
        "qwen" => handle_qwen_request(&client, &request).await,
        "gemini" => handle_gemini_request(&client, &request).await,
        "chatgpt" => handle_chatgpt_request(&client, &request).await,
        _ => Err(format!("Unsupported provider: {}", request.provider)),
    };

    match result {
        Ok(content) => {
            log::info!(
                "[Tauri AI Proxy] Success, content length: {}",
                content.len()
            );
            Ok(AIProxyResponse {
                success: true,
                content: Some(content),
                error: None,
            })
        }
        Err(e) => {
            log::error!("[Tauri AI Proxy] Error: {}", e);
            Ok(AIProxyResponse {
                success: false,
                content: None,
                error: Some(e),
            })
        }
    }
}

/// 处理通义千问请求
async fn handle_qwen_request(
    client: &reqwest::Client,
    request: &AIProxyRequest,
) -> Result<String, String> {
    let url = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation";

    let mut body = HashMap::new();
    body.insert("model", serde_json::json!(&request.model));

    let mut input = HashMap::new();
    let messages = vec![HashMap::from([
        ("role", "user"),
        ("content", request.prompt.as_str()),
    ])];
    input.insert("messages", messages);
    body.insert("input", serde_json::json!(input));

    let mut parameters = HashMap::new();
    parameters.insert("result_format", "message");
    body.insert("parameters", serde_json::json!(parameters));

    let response = client
        .post(url)
        .header("Authorization", format!("Bearer {}", request.api_key))
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Qwen request failed: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let error_text = response
            .text()
            .await
            .unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!("Qwen API error {}: {}", status, error_text));
    }

    let response_json: serde_json::Value = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse Qwen response: {}", e))?;

    // 提取内容
    let content = response_json["output"]["choices"][0]["message"]["content"]
        .as_str()
        .or_else(|| response_json["output"]["text"].as_str())
        .ok_or_else(|| "No content in Qwen response".to_string())?;

    Ok(content.to_string())
}

/// 处理 Gemini 请求
async fn handle_gemini_request(
    client: &reqwest::Client,
    request: &AIProxyRequest,
) -> Result<String, String> {
    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent?key={}",
        request.model, request.api_key
    );

    let body = serde_json::json!({
        "contents": [{
            "parts": [{
                "text": request.prompt
            }]
        }]
    });

    let response = client
        .post(&url)
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Gemini request failed: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let error_text = response
            .text()
            .await
            .unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!("Gemini API error {}: {}", status, error_text));
    }

    let response_json: serde_json::Value = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse Gemini response: {}", e))?;

    // 提取内容
    let parts = response_json["candidates"][0]["content"]["parts"]
        .as_array()
        .ok_or_else(|| "No parts in Gemini response".to_string())?;

    let mut full_text = String::new();
    for part in parts {
        if let Some(text) = part["text"].as_str() {
            full_text.push_str(text);
        }
    }

    if full_text.is_empty() {
        return Err("No content in Gemini response".to_string());
    }

    Ok(full_text)
}

/// 处理 ChatGPT 请求
async fn handle_chatgpt_request(
    client: &reqwest::Client,
    request: &AIProxyRequest,
) -> Result<String, String> {
    let url = "https://api.openai.com/v1/chat/completions";

    let body = serde_json::json!({
        "model": request.model,
        "messages": [{
            "role": "user",
            "content": request.prompt
        }],
        "stream": false
    });

    let response = client
        .post(url)
        .header("Authorization", format!("Bearer {}", request.api_key))
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("ChatGPT request failed: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let error_text = response
            .text()
            .await
            .unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!("ChatGPT API error {}: {}", status, error_text));
    }

    let response_json: serde_json::Value = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse ChatGPT response: {}", e))?;

    // 提取内容
    let content = response_json["choices"][0]["message"]["content"]
        .as_str()
        .ok_or_else(|| "No content in ChatGPT response".to_string())?;

    Ok(content.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![ai_proxy_request])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
