import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 开发环境注释 output: "export" 以启用 API 路由
  // 生产环境取消注释以支持静态导出和 Tauri
  // output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
