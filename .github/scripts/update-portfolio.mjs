// Rebuilds the Portfolio table in README.md from https://tansuasici.com/api/projects.
// The table lives between the PORTFOLIO:START / PORTFOLIO:END markers.
import { readFileSync, writeFileSync } from "node:fs";

const API = "https://tansuasici.com/api/projects";
const START = "<!-- PORTFOLIO:START -->";
const END = "<!-- PORTFOLIO:END -->";

const res = await fetch(API);
if (!res.ok) throw new Error(`${API} returned ${res.status}`);
const { itemListElement = [] } = await res.json();
if (itemListElement.length === 0) throw new Error("API returned no projects; refusing to empty the table");

const rows = itemListElement.map(({ item }) =>
  `| <img src="${item.image}" width="28" height="28" alt="${item.name}"> | [${item.name}](${item.url}) | ${item.description} |`,
);
const table = ["| | Project | Description |", "|:-:|---|---|", ...rows].join("\n");

const readme = readFileSync("README.md", "utf8");
const pattern = new RegExp(`${START}[\\s\\S]*?${END}`);
if (!pattern.test(readme)) throw new Error("Portfolio markers not found in README.md");
writeFileSync("README.md", readme.replace(pattern, `${START}\n${table}\n${END}`));
console.log(`Portfolio table: ${rows.length} projects`);
