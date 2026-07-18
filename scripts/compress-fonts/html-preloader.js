import fs from "node:fs";
import path from "node:path";
import { ROOT_DIR } from "./utils.js";

const DIST_DIR = path.join(ROOT_DIR, "dist");

/**
 * 注入字体预加载 <link> 标签到所有 HTML 文件
 * 查找 dist/_astro/fonts/ 中的 .woff2 文件，生成 preload 标签
 */
export async function injectFontPreload() {
	try {
		// Astro Font API outputs to dist/_astro/fonts/
		const fontDir = path.join(DIST_DIR, "_astro", "fonts");
		if (!fs.existsSync(fontDir)) {
			console.log("⚠ Font directory not found, skipping preload injection");
			return;
		}

		const fontFiles = fs.readdirSync(fontDir).filter((f) => f.endsWith(".woff2"));
		if (fontFiles.length === 0) {
			console.log("⚠ No .woff2 files found, skipping preload injection");
			return;
		}

		const preloadTags = fontFiles
			.map(
				(f) =>
					`<link rel="preload" href="/_astro/fonts/${f}" as="font" type="font/woff2" crossorigin>`,
			)
			.join("\n    ");

		const htmlFiles = [];
		function findHtmlFiles(dir) {
			for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
				const fullPath = path.join(dir, entry.name);
				if (entry.isDirectory()) {
					findHtmlFiles(fullPath);
				} else if (entry.name.endsWith(".html")) {
					htmlFiles.push(fullPath);
				}
			}
		}
		findHtmlFiles(DIST_DIR);

		let count = 0;
		for (const htmlFile of htmlFiles) {
			let content = fs.readFileSync(htmlFile, "utf-8");
			if (content.includes('rel="preload"') && content.includes("font/woff2")) {
				continue;
			}
			content = content.replace("</head>", `    ${preloadTags}\n</head>`);
			fs.writeFileSync(htmlFile, content, "utf-8");
			count++;
		}

		console.log(`✅ Injected font preload into ${count} HTML files (${fontFiles.length} fonts)`);
	} catch (err) {
		console.error("⚠ Font preload injection failed:", err.message);
	}
}
