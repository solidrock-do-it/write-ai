import { useState } from "react";
import {
  copyToClipboard,
  formatPlainFullContent,
  copyAllTags,
  copyTitle,
  copyContent,
} from "../utils/contentUtils";
import { AIGeneratedData, AITitle } from "../types";
import ReactDOMServer from "react-dom/server";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { remark } from "remark";
import remarkHtml from "remark-html";
import remarkGfmPlugin from "remark-gfm";

/**
 * 复制操作 Hook
 * 处理各种复制功能：标题、标签、内容、全部
 */
export function useCopyActions() {
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // 显示复制成功提示
  const showCopySuccess = (key: string) => {
    setCopySuccess(key);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  // 复制完整内容（标题 + 标签 + 正文）纯文本
  const handleCopyAll = async (
    currentGeneratedData: AIGeneratedData | null,
    selectedTitle: AITitle | null,
    generatedContent: string
  ) => {
    if (!currentGeneratedData) return;

    const title =
      selectedTitle?.title || currentGeneratedData.titles[0]?.title || "";
    const tags = currentGeneratedData.tags || [];
    const content = generatedContent;
    const plain = formatPlainFullContent(title, tags, content);
    const success = await copyToClipboard(plain);

    if (success) {
      showCopySuccess("all");
    } else {
      alert("复制失败，请重试");
    }
  };

  // 复制 HTML（标题 h1 + 标签带# + 正文 HTML）
  const handleCopyAllHTML = async (
    currentGeneratedData: AIGeneratedData | null,
    selectedTitle: AITitle | null,
    generatedContent: string
  ) => {
    if (!currentGeneratedData) return;

    const title =
      selectedTitle?.title || currentGeneratedData.titles[0]?.title || "";
    const tags = currentGeneratedData.tags || [];
    const content = generatedContent || "";

    // 标题 h1
    const titleHtml = title ? `<h1>${title}</h1>` : "";
    // 标签行
    const tagsHtml =
      tags && tags.length > 0
        ? `<p>${tags.map((t) => `#${t}`).join(" ")}</p>`
        : "";

    try {
      const processed = remark()
        .use(remarkGfmPlugin)
        .use(remarkHtml)
        .processSync(content || "");

      const rendered = String(processed);
      const finalHtml = `${titleHtml}${tagsHtml}${rendered}`;

      const write = (navigator.clipboard as any)?.write;
      if (write && window.ClipboardItem) {
        const blob = new Blob([finalHtml], { type: "text/html" });
        const data = [new ClipboardItem({ "text/html": blob })];
        await navigator.clipboard.write(data as any);
      } else {
        await copyToClipboard(finalHtml);
      }

      showCopySuccess("all-html");
    } catch (err) {
      console.warn(
        "remark html conversion failed, falling back to React render",
        err
      );
      // fallback: try ReactMarkdown -> renderToStaticMarkup
      try {
        const markdownElement = React.createElement(
          ReactMarkdown as any,
          { remarkPlugins: [remarkGfm] },
          content
        );
        const rendered = ReactDOMServer.renderToStaticMarkup(markdownElement);
        const finalHtml = `${titleHtml}${tagsHtml}${rendered}`;

        const write = (navigator.clipboard as any)?.write;
        if (write && window.ClipboardItem) {
          const blob = new Blob([finalHtml], { type: "text/html" });
          const data = [new ClipboardItem({ "text/html": blob })];
          await navigator.clipboard.write(data as any);
        } else {
          await copyToClipboard(finalHtml);
        }

        showCopySuccess("all-html");
      } catch (err2) {
        console.error("copy html error", err2);
        const fallback = formatPlainFullContent(title, tags, content);
        await copyToClipboard(fallback);
        alert("复制 HTML 失败，已回退为纯文本复制。");
      }
    }
  };

  // 复制单个标题
  const handleCopyTitle = async (title: string) => {
    const success = await copyTitle(title);
    if (success) {
      showCopySuccess(`title-${title}`);
    }
  };

  // 复制所有标签
  const handleCopyAllTags = async (tags: string[]) => {
    const success = await copyAllTags(tags);
    if (success) {
      showCopySuccess("tags");
    }
  };

  // 复制正文
  const handleCopyContent = async (content: string) => {
    const success = await copyContent(content);
    if (success) {
      showCopySuccess("content");
    }
  };

  // 复制 Markdown（标题 # + 标签带# + 正文 Markdown）
  const handleCopyMarkdown = async (
    currentGeneratedData: AIGeneratedData | null,
    selectedTitle: AITitle | null,
    generatedContent: string
  ) => {
    if (!currentGeneratedData) return;

    const title =
      selectedTitle?.title || currentGeneratedData.titles[0]?.title || "";
    const tags = currentGeneratedData.tags || [];
    const content = generatedContent || "";

    // 构建 Markdown 格式
    const titleMd = title ? `# ${title}\n\n` : "";
    const tagsMd =
      tags && tags.length > 0
        ? `${tags.map((t) => `#${t}`).join(" ")}\n\n`
        : "";
    const finalMarkdown = `${titleMd}${tagsMd}${content}`;

    const success = await copyToClipboard(finalMarkdown);
    if (success) {
      showCopySuccess("all-markdown");
    } else {
      alert("复制失败,请重试");
    }
  };

  return {
    copySuccess,
    handleCopyAll,
    handleCopyAllHTML,
    handleCopyMarkdown,
    handleCopyTitle,
    handleCopyAllTags,
    handleCopyContent,
  };
}
