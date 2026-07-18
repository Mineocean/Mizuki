/**
 * 字体压缩入口
 *
 * 模块结构：
 *   utils.js          — 共享工具函数（文件遍历、字符串提取、Markdown 解析）
 *   config-parser.js  — 配置解析（单次读取 siteConfig.ts，缓存后分发）
 *   text-collector.js — 文本采集（8 个来源：本地文件 + 3 个远程 API + 常用字符）
 *   font-compressor.js— 字体压缩（Fontmin 子集化 + ttf→woff2 转换）
 *   css-rewriter.js   — CSS 重写（dist/ 中 ttf 引用替换为 woff2）
 *   html-preloader.js — 字体预加载注入（<link rel="preload"> 到 HTML）
 *   index.js          — 入口
 *
 * 注意：Astro Font API 已处理字体子集化和 CSS 重写，
 *       此处仅运行 html-preloader 注入字体预加载标签。
 */

import { injectFontPreload } from "./html-preloader.js";

injectFontPreload();
