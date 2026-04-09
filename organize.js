require("dotenv").config();

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const Groq = require("groq-sdk");

const DSA_DIR = __dirname;
const PROGRESS_FILE = path.join(DSA_DIR, "progress.json");
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const BATCH_SIZE = 15;

const CATEGORIES = [
  // Core
  "1_Loop",
  "2_Pattern",
  "3_Array/1_Basic_arrayQ",
  "3_Array/2_searching",
  "3_Array/3_Sorting",
  "3_Array/4_2dArray",
  "4_String-Set",
  "5_Map",
  "6_Bitwise",
  "7_Recursion",
  "8_AdvancedArray/Sorting",
  "8_AdvancedArray",
  // New DSA Topics
  "9_LinkedList",
  "10_Stack",
  "11_Queue",
  "12_Tree",
  "13_Graph",
  "14_Dynamic_Programming",
  "15_Greedy",
  "16_Backtracking",
  "17_Heap",
  "18_Trie",
];

function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf-8"));
  }
  return { sorted_files: [] };
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

function scanFiles(dir, fileList = []) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (item === "node_modules") continue;
      scanFiles(fullPath, fileList);
    } else if (item.endsWith(".js") && item !== "organize.js") {
      // skip test files
      const baseName = path.basename(item, path.extname(item)).toLowerCase();
      if (baseName === "test" || /^test\d+$/.test(baseName)) continue;
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getCategoryFromGroq(filename, content, retries = 3) {
  const groq = new Groq({ apiKey: GROQ_API_KEY });

  const prompt = `You are a DSA file organizer. Given this JavaScript file named "${filename}" with content:

${content}

Which category does it belong to? Choose ONLY from this list:
${CATEGORIES.join("\n")}

Reply with ONLY the category name. Nothing else.`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        max_tokens: 50,
      });
      const response = result.choices[0].message.content.trim();
      const matched = CATEGORIES.find(
        (c) => c.toLowerCase() === response.toLowerCase(),
      );
      await sleep(1000);
      return matched || "8_AdvancedArray";
    } catch (err) {
      if (err.status === 429) {
        console.log(
          `\n⏳ Rate limit — waiting 30s (attempt ${attempt}/${retries})...`,
        );
        await sleep(30000);
      } else {
        throw err;
      }
    }
  }
  console.log(`⚠️  Groq failed for ${filename} — using default`);
  return "8_AdvancedArray";
}

function askQuestion(rl, question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  if (!GROQ_API_KEY) {
    console.log("❌ GROQ_API_KEY not set! Add it in .env file");
    process.exit(1);
  }

  const progress = loadProgress();
  const allFiles = scanFiles(DSA_DIR);

  const newFiles = allFiles
    .filter((f) => !progress.sorted_files.includes(path.relative(DSA_DIR, f)))
    .slice(0, BATCH_SIZE);

  if (newFiles.length === 0) {
    console.log("✅ No new files to organize!");
    return;
  }

  console.log(`\n🔍 Found ${newFiles.length} new file(s) to organize...\n`);

  const plan = [];

  for (const filePath of newFiles) {
    const filename = path.basename(filePath);
    const content = fs
      .readFileSync(filePath, "utf-8")
      .split("\n")
      .slice(0, 20)
      .join("\n");

    process.stdout.write(`🤖 Asking Groq: ${filename}...`);
    const category = await getCategoryFromGroq(filename, content);
    console.log(` → ${category}`);

    plan.push({ file: filePath, filename, suggestedCategory: category });
  }

  console.log("\n📋 PREVIEW:\n");
  plan.forEach((item, idx) => {
    console.log(
      `  ${idx + 1}. 📄 ${item.filename}  →  ${item.suggestedCategory}`,
    );
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const answer = await askQuestion(rl, "\nConfirm? (y/n/edit): ");

  if (answer.toLowerCase() === "n") {
    console.log("❌ Cancelled.");
    rl.close();
    return;
  }

  if (answer.toLowerCase() === "edit") {
    console.log("\n✏️  Edit mode — Enter to keep suggestion\n");
    console.log("Available categories:");
    CATEGORIES.forEach((c, i) => console.log(`  ${i + 1}. ${c}`));
    console.log("");

    for (const item of plan) {
      const input = await askQuestion(
        rl,
        `📄 ${item.filename} → [${item.suggestedCategory}] Change to (Enter to keep): `,
      );
      if (input.trim()) {
        const matched = CATEGORIES.find(
          (c) => c.toLowerCase() === input.trim().toLowerCase(),
        );
        if (matched) {
          item.suggestedCategory = matched;
          console.log(`  ✅ Changed to: ${matched}`);
        } else {
          console.log(`  ⚠️  Invalid — keeping: ${item.suggestedCategory}`);
        }
      }
    }
  }

  rl.close();

  console.log("\n🚀 Moving files...\n");

  for (const item of plan) {
    const destDir = path.join(DSA_DIR, item.suggestedCategory);
    const destFile = path.join(destDir, item.filename);

    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

    if (fs.existsSync(destFile)) {
      console.log(`⚠️  Skipped (already exists): ${item.filename}`);
    } else {
      fs.renameSync(item.file, destFile);
      console.log(`✅ Moved: ${item.filename}  →  ${item.suggestedCategory}`);
    }

    progress.sorted_files.push(
      path.join(item.suggestedCategory, item.filename),
    );
  }

  saveProgress(progress);
  console.log("\n🎉 Done! progress.json updated.");
}

main().catch(console.error);
