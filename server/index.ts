import { createServer } from "node:http";
import type { ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

import { searchLocations } from "./weather/geocoding.js";
import { getForecastComparison } from "./weather/service.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const rootDir = join(__dirname, "..");
const distDir = join(rootDir, "dist");
const port = Number(process.env.PORT || 3000);

const mimeTypes: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

    if (url.pathname === "/api/geocode") {
      await handleGeocode(url, res);
      return;
    }

    if (url.pathname === "/api/forecast") {
      await handleForecast(url, res);
      return;
    }

    await serveStatic(url.pathname, res);
  } catch (error) {
    sendJson(res, 500, {
      error: "Nie udało się obsłużyć żądania.",
      detail: error instanceof Error ? error.message : String(error)
    });
  }
});

server.listen(port, () => {
  console.log(`Meteo Comparator API działa: http://localhost:${port}`);
});

async function handleGeocode(url: URL, res: ServerResponse): Promise<void> {
  const query = url.searchParams.get("q")?.trim();

  if (!query) {
    sendJson(res, 400, { error: "Podaj nazwę miejscowości." });
    return;
  }

  sendJson(res, 200, { results: await searchLocations(query) });
}

async function handleForecast(url: URL, res: ServerResponse): Promise<void> {
  const latitude = Number(url.searchParams.get("lat"));
  const longitude = Number(url.searchParams.get("lon"));
  const label = url.searchParams.get("label")?.trim() || "Wybrana lokalizacja";

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    sendJson(res, 400, { error: "Nieprawidłowe współrzędne lokalizacji." });
    return;
  }

  const comparison = await getForecastComparison({ latitude, longitude, label });

  if (!comparison.sources.length) {
    sendJson(res, 502, {
      error: "Żadne źródło prognozy nie odpowiedziało poprawnie.",
      failedSources: comparison.failedSources
    });
    return;
  }

  sendJson(res, 200, comparison);
}

async function serveStatic(pathname: string, res: ServerResponse): Promise<void> {
  const cleanPath = pathname === "/" ? "/index.html" : decodeURIComponent(pathname);
  const requestedPath = normalize(join(distDir, cleanPath));

  if (!requestedPath.startsWith(distDir)) {
    sendText(res, 403, "Forbidden");
    return;
  }

  try {
    const body = await readFile(requestedPath);
    res.writeHead(200, {
      "Content-Type": mimeTypes[extname(requestedPath)] ?? "application/octet-stream"
    });
    res.end(body);
  } catch {
    try {
      const body = await readFile(join(distDir, "index.html"));
      res.writeHead(200, { "Content-Type": mimeTypes[".html"] });
      res.end(body);
    } catch {
      sendText(res, 404, "Uruchom `npm run build`, aby serwer mógł podać aplikację.");
    }
  }
}

function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function sendText(res: ServerResponse, status: number, payload: string): void {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(payload);
}
