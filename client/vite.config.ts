/// <reference types="node" />

import * as fs from "node:fs";
import * as path from "node:path";

import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

import {
  defineConfig,
  type Plugin,
  type ViteDevServer,
} from "vite";

// =============================================================================
// Paths
// =============================================================================

const PROJECT_ROOT = process.cwd();

const LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");

const MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024;
const TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6);

type LogSource =
    | "browserConsole"
    | "networkRequests"
    | "sessionReplay";

// =============================================================================
// Log Utils
// =============================================================================

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function trimLogFile(logPath: string, maxSize: number) {
  try {
    if (
        !fs.existsSync(logPath) ||
        fs.statSync(logPath).size <= maxSize
    ) {
      return;
    }

    const lines = fs
        .readFileSync(logPath, "utf-8")
        .split("\n");

    const keptLines: string[] = [];

    let keptBytes = 0;

    const targetSize = TRIM_TARGET_BYTES;

    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(
          `${lines[i]}\n`,
          "utf-8",
      );

      if (keptBytes + lineBytes > targetSize) {
        break;
      }

      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }

    fs.writeFileSync(
        logPath,
        keptLines.join("\n"),
        "utf-8",
    );
  } catch {
    // ignore
  }
}

function writeToLogFile(
    source: LogSource,
    entries: unknown[],
) {
  if (entries.length === 0) {
    return;
  }

  ensureLogDir();

  const logPath = path.join(
      LOG_DIR,
      `${source}.log`,
  );

  const lines = entries.map((entry) => {
    const ts = new Date().toISOString();

    return `[${ts}] ${JSON.stringify(entry)}`;
  });

  fs.appendFileSync(
      logPath,
      `${lines.join("\n")}\n`,
      "utf-8",
  );

  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}

// =============================================================================
// Debug Plugin
// =============================================================================

function vitePluginManusDebugCollector(): Plugin {
  return {
    name: "manus-debug-collector",

    configureServer(server: ViteDevServer) {
      server.middlewares.use(
          "/__manus__/logs",
          (req, res, next) => {
            if (req.method !== "POST") {
              return next();
            }

            let body = "";

            req.on("data", (chunk) => {
              body += chunk.toString();
            });

            req.on("end", () => {
              try {
                const payload = JSON.parse(body);

                if (payload.consoleLogs?.length > 0) {
                  writeToLogFile(
                      "browserConsole",
                      payload.consoleLogs,
                  );
                }

                if (payload.networkRequests?.length > 0) {
                  writeToLogFile(
                      "networkRequests",
                      payload.networkRequests,
                  );
                }

                if (payload.sessionEvents?.length > 0) {
                  writeToLogFile(
                      "sessionReplay",
                      payload.sessionEvents,
                  );
                }

                res.writeHead(200, {
                  "Content-Type": "application/json",
                });

                res.end(
                    JSON.stringify({
                      success: true,
                    }),
                );
              } catch (e) {
                res.writeHead(400, {
                  "Content-Type": "application/json",
                });

                res.end(
                    JSON.stringify({
                      success: false,
                      error: String(e),
                    }),
                );
              }
            });
          },
      );
    },
  };
}

// =============================================================================
// Vite Config
// =============================================================================

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    vitePluginManusDebugCollector(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },

  server: {
    port: 3000,
    strictPort: false,
    host: true,

    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
    ],

    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});