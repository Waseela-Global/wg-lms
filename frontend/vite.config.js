import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

export default defineConfig({
	server: {
		port: 8081,
		host: true,
		strictPort: false,
		hmr: {
			port: 8081,
		},
		watch: {
			usePolling: false,
		},
		proxy: getProxyOptions(),
	},
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
		},
	},
	build: {
		outDir: "../wg_lms/public/frontend",
		emptyOutDir: true,
		target: "es2015",
		sourcemap: true,
		rollupOptions: {
			output: {
				manualChunks: {
					"react-vendor": ["react", "react-dom", "react-router-dom"],
				},
			},
		},
	},
	optimizeDeps: {
		include: ["react", "react-dom", "react-router-dom"],
	},
});

function getProxyOptions() {
	const config = getCommonSiteConfig();
	const webserver_port = config ? config.webserver_port : 8000;
	const default_site = config ? config.default_site : null;

	if (!config) {
		console.log("No common_site_config.json found, using default port 8000");
	}

	return {
		"^/(app|login|api|assets|files|private)": {
			target: `http://127.0.0.1:${webserver_port}`,
			changeOrigin: true,
			ws: true,
			configure: (proxy) => {
				proxy.on("proxyReq", (proxyReq) => {
					if (default_site) {
						proxyReq.setHeader("host", default_site);
					}
				});
				proxy.on("proxyReqWs", (proxyReq) => {
					if (default_site) {
						proxyReq.setHeader("host", default_site);
					}
				});
			},
		},
	};
}

function getCommonSiteConfig() {
	let currentDir = path.resolve(".");

	// Traverse up till we find frappe-bench with sites directory
	while (currentDir !== "/") {
		if (
			fs.existsSync(path.join(currentDir, "sites")) &&
			fs.existsSync(path.join(currentDir, "apps"))
		) {
			let configPath = path.join(currentDir, "sites", "common_site_config.json");
			if (fs.existsSync(configPath)) {
				return JSON.parse(fs.readFileSync(configPath));
			}
			return null;
		}
		currentDir = path.resolve(currentDir, "..");
	}
	return null;
}
