# 🗂️ DSA File Organizer

> An AI-powered CLI tool that automatically categorizes and organizes your DSA JavaScript files using **Groq (LLaMA 3.3-70B)** — so you spend less time managing files and more time solving problems.

---

## 📌 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Folder Structure](#folder-structure)
- [Installation & Setup](#installation--setup)
- [Usage Guide](#usage-guide)
- [How It Works](#how-it-works)
- [Categories](#categories)
- [Tech Stack](#tech-stack)

---

## Overview

**DSA File Organizer** is a Node.js CLI tool that scans your DSA practice files, sends them to the Groq AI API, and automatically suggests the correct category (e.g., Arrays, Trees, DP, etc.). It processes files in batches, supports edit mode for manual overrides, and tracks progress so already-sorted files are never touched again.

---

## ✨ Features

- 🤖 **AI-Powered Categorization** — Uses LLaMA 3.3-70B via Groq to intelligently classify each file
- 📦 **Batch Processing** — Processes 15 files per run to avoid API rate limits
- 💾 **Progress Tracking** — `progress.json` ensures already-organized files are skipped
- ✏️ **Edit Mode** — Manually override any AI suggestion before files are moved
- ⏳ **Rate Limit Handling** — Auto-retries with 30s wait on Groq 429 errors
- 🔍 **Preview Before Move** — Shows a full plan before any file is touched
- 🚫 **Smart Filtering** — Skips `node_modules`, `test` files, and the script itself

---

## 📁 Folder Structure

```
DSA/
├── organize.js          ← Main script
├── .env                 ← Your Groq API key
├── progress.json        ← Auto-generated, tracks sorted files
├── 1_Loop/
├── 2_Pattern/
├── 3_Array/
│   ├── 1_Basic_arrayQ/
│   ├── 2_searching/
│   ├── 3_Sorting/
│   └── 4_2dArray/
├── 4_String-Set/
├── 5_Map/
├── 6_Bitwise/
├── 7_Recursion/
├── 8_AdvancedArray/
├── 9_LinkedList/
├── 10_Stack/
├── 11_Queue/
├── 12_Tree/
├── 13_Graph/
├── 14_Dynamic_Programming/
├── 15_Greedy/
├── 16_Backtracking/
├── 17_Heap/
└── 18_Trie/
```

---

## ⚙️ Installation & Setup

### Prerequisites

- Node.js `v18+`
- A free [Groq API Key](https://console.groq.com)

### Steps

**1. Clone or copy the project**
```bash
git clone https://github.com/imraan011/dsa-organizer.git
cd dsa-organizer
```

**2. Install dependencies**
```bash
npm install groq-sdk dotenv
```

**3. Create your `.env` file**
```bash
touch .env
```

Add this inside `.env`:
```
GROQ_API_KEY=your_groq_api_key_here
```

**4. Place your unsorted `.js` DSA files** in the root DSA directory alongside `organize.js`

---

## 🚀 Usage Guide

Run the script:
```bash
node organize.js
```

### What happens step by step:

**Step 1 — Scan**
The tool scans all `.js` files in the directory (excluding test files and `organize.js` itself).

**Step 2 — AI Classification**
Each new file is sent to Groq with its name and first 20 lines of code. The AI returns the best matching category.

```
🤖 Asking Groq: twoSum.js... → 3_Array/1_Basic_arrayQ
🤖 Asking Groq: dijkstra.js... → 13_Graph
🤖 Asking Groq: knapsack.js... → 14_Dynamic_Programming
```

**Step 3 — Preview**
A full move plan is shown before anything is changed:
```
📋 PREVIEW:

  1. 📄 twoSum.js       →  3_Array/1_Basic_arrayQ
  2. 📄 dijkstra.js     →  13_Graph
  3. 📄 knapsack.js     →  14_Dynamic_Programming

Confirm? (y/n/edit):
```

**Step 4 — Confirm / Edit / Cancel**

| Input | Action |
|-------|--------|
| `y` | Move all files as suggested |
| `n` | Cancel — no files moved |
| `edit` | Enter edit mode to override any suggestion |

**Step 5 — Move & Save**
Files are moved to their target folders. `progress.json` is updated so they won't be processed again.

---

## 🔍 How It Works

```
organize.js
    │
    ├── 1. Load progress.json (skip already sorted files)
    │
    ├── 2. Scan directory for .js files (recursive, skips node_modules & test files)
    │
    ├── 3. For each file (batch of 15):
    │       └── Send filename + first 20 lines → Groq API (LLaMA 3.3-70B)
    │           └── Get back: category name
    │
    ├── 4. Show preview of all planned moves
    │
    ├── 5. User confirms (y / n / edit)
    │       └── edit mode: show categories list, allow manual override
    │
    ├── 6. Move files to destination folders (create folder if not exists)
    │
    └── 7. Update progress.json
```

### Key Functions

| Function | Description |
|----------|-------------|
| `scanFiles(dir)` | Recursively scans directory, returns list of `.js` files |
| `getCategoryFromGroq(filename, content)` | Calls Groq API, returns matched category with retry logic |
| `loadProgress()` / `saveProgress()` | Reads/writes `progress.json` to track sorted files |
| `main()` | Orchestrates the full flow — scan → classify → preview → move |

### Rate Limit Handling

Groq's free tier has rate limits. The script handles this with:
- **1 second delay** between each API call (`sleep(1000)`)
- **Auto-retry** up to 3 times on `429` errors with a **30 second wait**
- Falls back to `8_AdvancedArray` if all retries fail

---

## 📂 Categories

| # | Category | Topics Covered |
|---|----------|----------------|
| 1 | `1_Loop` | Basic loops, iterations |
| 2 | `2_Pattern` | Pattern printing |
| 3 | `3_Array/*` | Basic, Searching, Sorting, 2D Arrays |
| 4 | `4_String-Set` | String manipulation, Sets |
| 5 | `5_Map` | HashMap, frequency problems |
| 6 | `6_Bitwise` | Bit manipulation |
| 7 | `7_Recursion` | Recursion, divide & conquer |
| 8 | `8_AdvancedArray` | Sliding window, two pointer |
| 9 | `9_LinkedList` | Singly, doubly linked lists |
| 10 | `10_Stack` | Stack problems |
| 11 | `11_Queue` | Queue, deque |
| 12 | `12_Tree` | Binary trees, BST, traversals |
| 13 | `13_Graph` | BFS, DFS, shortest path |
| 14 | `14_Dynamic_Programming` | Memoization, tabulation |
| 15 | `15_Greedy` | Greedy algorithms |
| 16 | `16_Backtracking` | Permutations, combinations |
| 17 | `17_Heap` | Min/Max heap, priority queue |
| 18 | `18_Trie` | Prefix trees |

---

## 🛠️ Tech Stack

| Tool | Purpose |
|------|---------|
| **Node.js** | Runtime environment |
| **Groq SDK** | AI API client |
| **LLaMA 3.3-70B** | AI model for file classification |
| **dotenv** | Environment variable management |
| **fs / path** | File system operations (built-in) |
| **readline** | CLI user input (built-in) |

---

## 📄 License

MIT — feel free to use, modify, and share.

---

*Built by [Ishtikhar](https://github.com/imraan011) — because manually organizing 100+ DSA files is not it.* 😄
