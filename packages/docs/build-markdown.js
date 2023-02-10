import { marked } from "marked";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htmlContent = body =>
  fs.readFileSync(path.resolve(__dirname, "index.template.html"), "utf-8").replace("<!-- BODY -->", body);

const INPUT_FILE = path.resolve(__dirname, "index.md");
const OUTPUT_FILE = path.resolve(__dirname, "index.html");

/**
 * @template T
 * @param {string} str
 * @param {()=>T} fn
 * @returns {T}
 */
const wrapLog = (str, fn) => {
  process.stdout.write(`${str}... `);
  try {
    const result = fn();
    process.stdout.write("Done\n");
    return result;
  } catch (e) {
    process.stdout.write("!!!\n");
    throw e;
  }
};

const updateFile = () => {
  const markdownContent = wrapLog(`Reading from ${INPUT_FILE}`, () =>
    fs.readFileSync(INPUT_FILE, { encoding: "utf-8" })
  );

  const html = wrapLog("Converting markdown to html...", () => marked(markdownContent, { gfm: true }));

  wrapLog(`Writing into ${OUTPUT_FILE}...`, () => fs.writeFileSync(OUTPUT_FILE, htmlContent(html)));
  console.log();
};

process.stdout.write("Watching " + INPUT_FILE + "\n");
fs.watchFile(INPUT_FILE, {}, updateFile);
updateFile();
