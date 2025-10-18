import { Document, Paragraph, TextRun, HeadingLevel } from "docx";
import { saveAs } from "file-saver";
import { remark } from "remark";
import strip from "strip-markdown";
import { getTauriDialog, getTauriFs } from "./tauriImports";

/**
 * 清理文件名,移除非法字符
 * Windows 不允许的字符: < > : " / \ | ? *
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[<>:"\/\\|?*]/g, "") // 移除非法字符
    .replace(/\s+/g, "_") // 将空格替换为下划线
    .trim();
}

/**
 * 复制文本到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy:", err);
    return false;
  }
}

/**
 * 格式化标题、标签和正文为纯文本
 */
export function formatFullContent(
  title: string,
  tags: string[],
  content: string
): string {
  let result = "";

  // 添加标题
  if (title) {
    result += `# ${title}\n\n`;
  }

  // 添加标签
  if (tags && tags.length > 0) {
    result += `标签: ${tags.map((tag) => `#${tag}`).join(" ")}\n\n`;
  }

  // 添加正文（移除 HTML 标签）
  if (content) {
    result += content.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "");
  }

  return result;
}

/**
 * 格式化为纯文本（去除 markdown 标记）
 */
export function formatPlainFullContent(
  title: string,
  tags: string[],
  content: string
): string {
  const processor = remark().use(strip);
  const processed = processor.processSync(content || "");
  const plainBody = String(processed).replace(/\r\n/g, "\n").trim();

  const titlePart = title ? `${title}\n\n` : "";
  const tagsPart =
    tags && tags.length > 0
      ? `${tags.map((tag) => `#${tag}`).join(" ")}\n\n`
      : "";

  if (!plainBody || plainBody.trim().length === 0) {
    throw new Error("Remark produced empty output");
  }

  return `${titlePart}${tagsPart}${plainBody}`.trim();
}

/**
 * 下载为 Word 文档
 */
export async function downloadAsDocx(
  title: string,
  tags: string[],
  content: string,
  filename?: string
): Promise<void> {
  console.log("[Download] === Function called ===");
  console.log("[Download] Parameters:", {
    title,
    tagsCount: tags.length,
    contentLength: content.length,
    filename,
  });

  try {
    // 检测是否在 Tauri 环境
    const isTauriEnv = typeof window !== "undefined" && "__TAURI__" in window;
    console.log("[Download] Is Tauri environment:", isTauriEnv);
    console.log(
      "[Download] window.__TAURI__ exists:",
      typeof window !== "undefined" && (window as any).__TAURI__
    );
    console.log("[Download] window object:", typeof window);

    // 创建文档段落
    const paragraphs: Paragraph[] = [];

    // 添加标题
    if (title) {
      paragraphs.push(
        new Paragraph({
          text: title,
          heading: HeadingLevel.HEADING_1,
          spacing: {
            after: 200,
          },
        })
      );
    }

    // 添加标签
    if (tags && tags.length > 0) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "标签: ",
              bold: true,
            }),
            new TextRun({
              text: tags.map((tag) => `#${tag}`).join(" "),
              color: "7C3AED", // 紫色
            }),
          ],
          spacing: {
            after: 300,
          },
        })
      );
    }

    // 添加正文（处理换行）
    if (content) {
      const cleanContent = content
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, "");
      const lines = cleanContent.split("\n");

      lines.forEach((line) => {
        if (line.trim()) {
          paragraphs.push(
            new Paragraph({
              text: line,
              spacing: {
                after: 120,
              },
            })
          );
        } else {
          paragraphs.push(new Paragraph({ text: "" }));
        }
      });
    }

    // 创建文档
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    });

    // 生成 Blob
    const blob = await require("docx").Packer.toBlob(doc);

    // 清理文件名,移除非法字符
    const cleanTitle = sanitizeFilename(title || "文章");
    const finalFilename = filename
      ? sanitizeFilename(filename)
      : `${cleanTitle}_${Date.now()}.docx`;

    // Tauri 环境下使用 Tauri API
    if (isTauriEnv) {
      console.log("[Tauri Download] Starting Tauri download process");

      try {
        // 动态加载 Tauri 插件
        const dialogPlugin = await getTauriDialog();
        const fsPlugin = await getTauriFs();

        if (!dialogPlugin || !fsPlugin) {
          throw new Error("Failed to load Tauri plugins");
        }

        const { save } = dialogPlugin;
        const { writeFile } = fsPlugin;

        console.log(
          "[Tauri Download] Opening save dialog with filename:",
          finalFilename
        );

        // 打开保存对话框
        const savePath = await save({
          defaultPath: finalFilename,
          filters: [
            {
              name: "Word 文档",
              extensions: ["docx"],
            },
          ],
        });

        console.log("[Tauri Download] User selected path:", savePath);

        if (savePath) {
          // 将 Blob 转换为 ArrayBuffer
          const arrayBuffer = await blob.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);

          console.log(
            "[Tauri Download] Writing file, size:",
            uint8Array.length,
            "bytes"
          );

          // 使用 Tauri 写入文件
          await writeFile(savePath, uint8Array);

          console.log("[Tauri Download] File written successfully");
        } else {
          console.log("[Tauri Download] User cancelled save dialog");
        }
      } catch (err) {
        console.error("[Tauri Download] Error:", err);
        throw err;
      }
    } else {
      // 浏览器环境使用 file-saver
      saveAs(blob, finalFilename);
    }
  } catch (error) {
    console.error("Failed to download as docx:", error);
    throw error;
  }
}

/**
 * 复制单个标签
 */
export async function copySingleTag(tag: string): Promise<boolean> {
  return copyToClipboard(`#${tag}`);
}

/**
 * 复制所有标签
 */
export async function copyAllTags(tags: string[]): Promise<boolean> {
  const tagsText = tags.map((tag) => `#${tag}`).join(" ");
  return copyToClipboard(tagsText);
}

/**
 * 复制标题
 */
export async function copyTitle(title: string): Promise<boolean> {
  return copyToClipboard(title);
}

/**
 * 复制正文
 */
export async function copyContent(content: string): Promise<boolean> {
  const cleanContent = content
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "");
  return copyToClipboard(cleanContent);
}
