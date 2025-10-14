import { Document, Paragraph, TextRun, HeadingLevel } from "docx";
import { saveAs } from "file-saver";

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
 * 下载为 Word 文档
 */
export async function downloadAsDocx(
  title: string,
  tags: string[],
  content: string,
  filename?: string
): Promise<void> {
  try {
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

    // 生成并下载
    const blob = await require("docx").Packer.toBlob(doc);
    const finalFilename = filename || `${title || "文章"}_${Date.now()}.docx`;
    saveAs(blob, finalFilename);
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
