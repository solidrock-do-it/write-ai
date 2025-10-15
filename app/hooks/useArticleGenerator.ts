import { useArticleStore } from "../store/articleStore";
import { generateArticle } from "../services/aiService";
import { generatePrompt } from "../utils/promptGenerator";
import { AIGeneratedData } from "../types";

/**
 * 文章生成 Hook
 * 处理文章生成的完整流程
 */
export function useArticleGenerator() {
  const {
    keywords,
    articleLength,
    writingStyle,
    articleType,
    language,
    apiConfig,
    isGenerating,
    setIsGenerating,
    setGeneratedContent,
    setCurrentGeneratedData,
    addHistoryItem,
  } = useArticleStore();

  const handleGenerate = async (
    onHistoryCreated?: (historyId: string) => void
  ) => {
    if (!keywords.trim()) return;

    // 检查 API Key
    const selectedProvider = apiConfig.selectedProvider;
    let apiKey = "";

    if (selectedProvider === "qwen") {
      apiKey = apiConfig.qwenApiKey;
    } else if (selectedProvider === "gemini") {
      apiKey = apiConfig.geminiApiKey;
    } else if (selectedProvider === "chatgpt") {
      apiKey = apiConfig.chatgptApiKey;
    }

    if (!apiKey) {
      alert(`请先在设置中配置 ${selectedProvider} 的 API Key`);
      return false;
    }

    setIsGenerating(true);
    setGeneratedContent("");
    setCurrentGeneratedData(null);

    try {
      // 生成提示词（客户端生成）
      const prompt = generatePrompt({
        keywords,
        articleLength,
        writingStyle,
        articleType,
        language,
      });

      let accumulatedText = "";

      const model =
        selectedProvider === "qwen"
          ? apiConfig.qwenModel
          : selectedProvider === "gemini"
          ? apiConfig.geminiModel
          : apiConfig.chatgptModel;

      await generateArticle({
        provider: selectedProvider,
        apiKey,
        prompt,
        model,
        proxyUrl: apiConfig.proxyEnabled ? apiConfig.proxyUrl : undefined,
        onChunk: (chunk) => {
          accumulatedText += chunk;
          setGeneratedContent(accumulatedText);
        },
        onComplete: (data: AIGeneratedData) => {
          setCurrentGeneratedData(data);
          setGeneratedContent(data.content);

          // 保存到历史记录，默认选中第一个标题
          const historyId = Date.now().toString();
          const historyItem = {
            id: historyId,
            timestamp: Date.now(),
            keywords,
            articleLength,
            writingStyle,
            articleType,
            language,
            selectedTitle: data.titles[0], // 保存默认选中的第一个标题
            generatedData: data,
            provider: selectedProvider,
          };

          addHistoryItem(historyItem);

          // 通知父组件历史记录已创建
          if (onHistoryCreated) {
            onHistoryCreated(historyId);
          }
        },
        onError: (error) => {
          console.error("Generation error:", error);

          let errorMessage = "生成失败";

          // 根据错误类型提供更友好的提示
          if (error.message.includes("Failed to fetch")) {
            errorMessage = `网络请求失败,请检查:\n\n1. 网络连接是否正常\n2. API Key 是否正确\n3. 是否需要启用代理服务器\n4. 代理服务器地址是否正确 (当前: ${
              apiConfig.proxyEnabled ? apiConfig.proxyUrl : "未启用"
            })\n\n提示: 国内访问 Gemini/ChatGPT 需要使用代理`;
          } else if (error.message.includes("401")) {
            errorMessage = `API Key 验证失败,请检查:\n\n1. API Key 是否正确\n2. API Key 是否有效\n3. 是否有足够的配额`;
          } else if (error.message.includes("403")) {
            errorMessage = `访问被拒绝,请检查:\n\n1. API Key 权限是否正确\n2. 是否需要启用代理访问\n3. IP 地址是否被限制`;
          } else {
            errorMessage = `生成失败: ${error.message}`;
          }

          alert(errorMessage);
        },
      });

      return true;
    } catch (error) {
      console.error("Error:", error);
      alert("生成失败,请检查控制台输出获取详细信息");
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    handleGenerate,
    isGenerating,
  };
}
