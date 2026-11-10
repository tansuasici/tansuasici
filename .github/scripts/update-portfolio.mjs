// Rebuilds the synced tables in README.md from tansuasici.com.
// Each table lives between its own <!-- NAME:START --> / <!-- NAME:END --> markers.
import { readFileSync, writeFileSync } from "node:fs";

async function items(path) {
  const url = `https://tansuasici.com${path}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} returned ${res.status}`);
  const list = ((await res.json()).itemListElement ?? []).map(({ item }) => item);
  if (list.length === 0) throw new Error(`${url} returned no items; refusing to empty the table`);
  return list;
}

const tables = {
  PORTFOLIO: (await items("/api/projects")).map(
    (p) => `| <img src="${p.image}" width="28" height="28" alt="${p.name}"> | [${p.name}](${p.url}) | ${p.description} |`,
  ),
  PUBLICATIONS: (await items("/api/publications")).map(
    (p) => `| [${p.name}](${p.url}) | ${p.publisher} | ${p.datePublished} |`,
  ),
};
const headers = {
  PORTFOLIO: ["| | Project | Description |", "|:-:|---|---|"],
  PUBLICATIONS: ["| Title | Venue | Date |", "|---|---|---|"],
};

let readme = readFileSync("README.md", "utf8");
for (const [name, rows] of Object.entries(tables)) {
  const pattern = new RegExp(`<!-- ${name}:START -->[\\s\\S]*?<!-- ${name}:END -->`);
  if (!pattern.test(readme)) throw new Error(`${name} markers not found in README.md`);
  const block = [`<!-- ${name}:START -->`, ...headers[name], ...rows, `<!-- ${name}:END -->`].join("\n");
  readme = readme.replace(pattern, block);
  console.log(`${name}: ${rows.length} rows`);
}
writeFileSync("README.md", readme);
