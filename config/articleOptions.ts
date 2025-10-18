import {
  FileText,
  Feather,
  BookOpen,
  Sparkles,
  Megaphone,
  Newspaper,
  ShoppingCart,
  Search,
  Edit3,
} from "lucide-react";
import type { OptionSection } from "../components/editor/ArticleOptions";

/**
 * 文章选项配置
 * 定义文章生成时可选的各种参数,包括长度、风格、类型等
 */
export const articleOptionSections: OptionSection[] = [
  {
    title: "文章长度",
    stateKey: "articleLength",
    options: [
      {
        key: "short",
        label: "短文",
        description: "(300-500字)",
        icon: Feather,
      },
      {
        key: "medium",
        label: "中篇",
        description: "800-1500字",
        icon: Edit3,
      },
      {
        key: "long",
        label: "长文",
        description: "2000字+",
        icon: BookOpen,
      },
    ],
  },
  {
    title: "写作风格",
    stateKey: "writingStyle",
    options: [
      {
        key: "professional",
        label: "正式专业",
        description: "正式专业的文章",
        icon: FileText,
      },
      {
        key: "casual",
        label: "轻松随意",
        description: "轻松随意的博客文章",
        icon: Feather,
      },
      {
        key: "report",
        label: "学术严谨",
        description: "学术严谨的报告",
        icon: BookOpen,
      },
      {
        key: "creative",
        label: "创意文学",
        description: "富有创意的文学作品",
        icon: Sparkles,
      },
      {
        key: "marketing",
        label: "营销推广",
        description: "吸引人的营销内容",
        icon: Megaphone,
      },
    ],
  },
  {
    title: "文章类型",
    stateKey: "articleType",
    options: [
      {
        key: "blog",
        label: "博客文章",
        description: "适合发布在博客平台",
        icon: FileText,
      },
      {
        key: "news",
        label: "新闻稿",
        description: "适合新闻发布的稿件",
        icon: Newspaper,
      },
      {
        key: "product",
        label: "产品描述",
        description: "产品描述和介绍",
        icon: ShoppingCart,
      },
      {
        key: "seo",
        label: "SEO文章",
        description: "优化搜索引擎排名",
        icon: Search,
      },
      {
        key: "tutorial",
        label: "教程指南",
        description: "步骤清晰的教程指南",
        icon: BookOpen,
      },
    ],
  },
];

/**
 * 获取选项的默认值
 */
export const getDefaultArticleOptions = () => ({
  articleLength: "medium",
  writingStyle: "professional",
  articleType: "blog",
});
