import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const DB_PATH = path.resolve(process.cwd(), 'data', 'db.json');

async function readDb() {
  const raw = await readFile(DB_PATH, 'utf8');
  return JSON.parse(raw);
}

async function writeDb(data) {
  await writeFile(DB_PATH, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

export async function getDb() {
  return readDb();
}

export async function updateDb(mutator) {
  const db = await readDb();
  const next = await mutator(db);
  await writeDb(next ?? db);
  return next ?? db;
}
