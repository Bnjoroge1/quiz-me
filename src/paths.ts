import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir, platform } from "node:os";
import { join } from "node:path";

export function dataDir(): string {
  const xdg = process.env.XDG_DATA_HOME;
  if (xdg) return join(xdg, "quiz-me");
  if (platform() === "darwin") {
    return join(homedir(), "Library", "Application Support", "quiz-me");
  }
  return join(homedir(), ".local", "share", "quiz-me");
}

export function runtimeDir(): string {
  const xdg = process.env.XDG_RUNTIME_DIR;
  if (xdg) return join(xdg, "quiz-me");
  const cache = process.env.XDG_CACHE_HOME ?? join(homedir(), ".cache");
  return join(cache, "quiz-me");
}

export function dbPath(): string {
  return join(dataDir(), "quizzes.db");
}

export function portFilePath(): string {
  return join(runtimeDir(), "port");
}

export function lastDigestPath(): string {
  return join(runtimeDir(), "last-digest");
}

export function ensureDir(dir: string): void {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

export function readPortFile(): number | undefined {
  try {
    const raw = readFileSync(portFilePath(), "utf8").trim();
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : undefined;
  } catch {
    return undefined;
  }
}

export function writePortFile(port: number): void {
  ensureDir(runtimeDir());
  writeFileSync(portFilePath(), String(port), "utf8");
}

export function readLastDigest(): string | undefined {
  try {
    return readFileSync(lastDigestPath(), "utf8").trim() || undefined;
  } catch {
    return undefined;
  }
}

export function writeLastDigest(digest: string): void {
  ensureDir(runtimeDir());
  writeFileSync(lastDigestPath(), digest, "utf8");
}
