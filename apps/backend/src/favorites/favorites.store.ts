import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { FavoriteImage } from "@cloudsmiths/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataFilePath = path.resolve(__dirname, "../../../../data/favorites.json");

async function ensureDataFile() {
  await mkdir(path.dirname(dataFilePath), { recursive: true });

  try {
    await readFile(dataFilePath, "utf8");
  } catch {
    await writeFile(dataFilePath, "[]\n", "utf8");
  }
}

export async function readFavorites(): Promise<FavoriteImage[]> {
  await ensureDataFile();
  const contents = await readFile(dataFilePath, "utf8");

  try {
    const parsed = JSON.parse(contents) as FavoriteImage[];
    return parsed.sort(
      (left, right) =>
        right.createdAt.localeCompare(left.createdAt) ||
        left.label.localeCompare(right.label),
    );
  } catch {
    return [];
  }
}

export async function saveFavorites(favorites: FavoriteImage[]) {
  await ensureDataFile();
  await writeFile(
    dataFilePath,
    `${JSON.stringify(favorites, null, 2)}\n`,
    "utf8",
  );
}
