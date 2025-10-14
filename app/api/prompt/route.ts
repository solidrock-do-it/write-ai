import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keywords = searchParams.get("keywords") || "";
    const articleLength = searchParams.get("articleLength") || "medium";
    const writingStyle = searchParams.get("writingStyle") || "professional";
    const articleType = searchParams.get("articleType") || "blog";

    // 读取提示词模板文件
    const promptPath = join(process.cwd(), "docs", "prompt.md");
    let promptTemplate = await readFile(promptPath, "utf-8");

    // 替换模板变量
    const lengthMap: Record<string, string> = {
      short: "短文(300-500字)",
      medium: "中篇(800-1500字)",
      long: "长文(2000字以上)",
    };

    const styleMap: Record<string, string> = {
      article: "正式专业",
      blog: "轻松随意",
      report: "学术严谨",
      creative: "创意文学",
      marketing: "营销推广",
    };

    const typeMap: Record<string, string> = {
      blog: "博客文章",
      news: "新闻稿",
      product: "产品描述",
      seo: "SEO文章",
      tutorial: "教程指南",
    };

    promptTemplate = promptTemplate
      .replace("{{keywords}}", keywords)
      .replace("{{articleLength}}", lengthMap[articleLength] || articleLength)
      .replace("{{writingStyle}}", styleMap[writingStyle] || writingStyle)
      .replace("{{articleType}}", typeMap[articleType] || articleType);

    return NextResponse.json({
      success: true,
      prompt: promptTemplate,
    });
  } catch (error) {
    console.error("Error reading prompt:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load prompt template",
      },
      { status: 500 }
    );
  }
}
