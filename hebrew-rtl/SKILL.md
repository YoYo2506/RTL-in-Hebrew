---
name: hebrew-rtl
description: Shapes every Hebrew or mixed Hebrew/English reply so it displays right-to-left instead of flipping into left-to-right or scrambling. Use this whenever the user writes in Hebrew (even one Hebrew sentence mixed with English terms), asks for an answer in Hebrew, or the reply will be mostly Hebrew, in Claude Code, Claude chat or Cowork, whatever the topic (legal, code, business). Applies to the chat reply itself, not to files, code or commit messages. Triggers on Hebrew text such as "תענה בעברית", "מה דעתך", "תסביר לי", and on requests about RTL, יישור לימין or כיווניות.
---

# Hebrew RTL replies

## What the model controls, and what it does not

The app that shows the reply decides its direction and alignment: claude.ai, Claude Desktop, the Claude Code terminal, the VS Code panel. The model cannot set `dir="rtl"`: raw HTML in a chat reply is shown as literal text or stripped, so never emit `<div dir="rtl">` or similar.

What the model does control is the characters it emits, and that matters more than it looks. Renderers that follow the Unicode Bidirectional Algorithm decide each paragraph's base direction from its **first strong character**, the first letter that has a direction of its own. Digits, punctuation, spaces and Markdown syntax are not strong.

- First strong character is Hebrew: the paragraph is right-to-left. Where the renderer auto-detects direction it is also right-aligned, and punctuation, numbers and embedded English land in the right places.
- First strong character is Latin: the whole line becomes left-to-right, and the Hebrew around it comes out in the wrong order (a period jumps to the wrong end, the words around an English term swap sides).

So the job is simple to state: **every block of Hebrew text must start with a Hebrew letter.**

## Rules

### 1. Open every block with a Hebrew word

A block is anything the renderer lays out as its own line or paragraph: a paragraph, a list item, a heading, a table cell, a quote line, a line after a line break, a bold lead-in.

Markdown markers (`-`, `1.`, `##`, `**`, `>`) and digits do not count. Only the first letter matters.

| Instead of | Write |
|---|---|
| `GDPR חל על החברה כי...` | `ה-GDPR חל על החברה כי...` |
| `- CCPA: חובת גילוי` | `- חוק ה-CCPA: חובת גילוי` |
| `## Data Processing Agreement` | `## הסכם עיבוד נתונים (DPA)` |
| `**Note:** יש לבדוק` | `**הערה:** יש לבדוק` |
| `Stripe דורשת רישיון?` | `האם Stripe דורשת רישיון?` |
| `npm install מתקין את התלויות` | `הפקודה \`npm install\` מתקינה את התלויות` |
| `2026 היא שנת היעד` | fine as is: digits are weak, the first letter is Hebrew |

The usual tools are a Hebrew prefix with a maqaf (`ה-GDPR`, `ל-MiCA`), a Hebrew noun before the name (`חוק`, `תקנה`, `חברת`, `הספרייה`, `הפקודה`), or reordering the sentence so the English term comes later.

### 2. Keep the English terms

Do not transliterate or translate away the exact term (`גיטהאב` instead of GitHub, a Hebrew paraphrase instead of "legitimate interest"). Precision matters, especially for statutes, regulators, defined terms and product names. The fix is where the term sits, not whether it appears.

### 3. Put code, commands, paths and URLs in backticks or code blocks

An inline code span or a fenced block is fine, and a fenced block is its own left-to-right block, which is what code needs. Introduce it with a Hebrew sentence rather than starting a line with the command.

### 4. Tables

Start each Hebrew cell with a Hebrew word. Cells that hold only a number, a date or an English name are fine. Most renderers still order columns left to right, so keep tables small and put the key column first.

### 5. Last resort: the RLM mark

If a line truly has to start with a Latin name (for example a list of company names where a Hebrew prefix would be awkward), begin the line with U+200F (RIGHT-TO-LEFT MARK), an invisible strong right-to-left character. Use it sparingly: it is invisible, it survives copy-paste into Word, email and contract drafts, and it can break search and document comparison there. Never put it inside code, commands, paths, URLs or tool input.

### 6. Scope

These rules shape the chat reply. They do not apply to files written with tools, code, commit messages, PR descriptions, or documents, unless the user asks. A Word or PDF document in Hebrew needs right-to-left set in the document itself, which is a different task.

When the user writes in English, or asks for an English reply, this skill does not apply.

### 7. Do it silently

Do not mention the formatting, do not explain bidi in the reply, and do not add a note about alignment. The user should just see Hebrew that reads correctly.

## If the user says the reply is still left-aligned

That means the app forces left-to-right, which no reply can override. Say so in one or two sentences, in Hebrew, and if they want options, read `references/client-fixes.md` and give the ones that fit the app they use, including its privacy caveat.
