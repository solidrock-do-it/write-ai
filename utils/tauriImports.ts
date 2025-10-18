/**
 * Tauri 插件的条件导入
 * 只在 Tauri 环境中有效,在浏览器环境中返回 null
 */

// 检测是否在 Tauri 环境
export const isTauriEnvironment = (): boolean => {
  return typeof window !== "undefined" && "__TAURI__" in window;
};

// 条件导入 Tauri Dialog 插件
export const getTauriDialog = async () => {
  if (!isTauriEnvironment()) {
    return null;
  }
  try {
    const { save } = await import("@tauri-apps/plugin-dialog");
    return { save };
  } catch (error) {
    console.error("[Tauri] Failed to load dialog plugin:", error);
    return null;
  }
};

// 条件导入 Tauri FS 插件
export const getTauriFs = async () => {
  if (!isTauriEnvironment()) {
    return null;
  }
  try {
    const { writeFile } = await import("@tauri-apps/plugin-fs");
    return { writeFile };
  } catch (error) {
    console.error("[Tauri] Failed to load fs plugin:", error);
    return null;
  }
};
