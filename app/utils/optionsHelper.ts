import type { OptionSection } from "../components/editor/ArticleOptions";
import type { ComponentType } from "react";
import type { LanguageOption } from "../config/languageConfig";

/**
 * 通用：根据数组和 key 查找项
 */
export function findByKey<T extends { key: string }>(
  list: T[] | undefined,
  key: string
): T | undefined {
  if (!list) return undefined;
  return list.find((item) => item.key === key);
}

/**
 * 根据 key 和 section 获取对应的 label
 */
export function getOptionLabel(section: OptionSection, key: string): string {
  const option = findByKey(section.options, key);
  return option?.label || key;
}

/**
 * 根据 key 和 section 获取对应的 icon
 */
export function getOptionIcon(
  section: OptionSection,
  key: string
): ComponentType<{ className?: string }> | undefined {
  const option = findByKey(section.options, key);
  return option?.icon;
}

/**
 * 从语言列表中查找 language option
 */
export function findLanguage(
  languages: LanguageOption[] | undefined,
  key: string
): LanguageOption | undefined {
  return findByKey<LanguageOption>(languages, key);
}
