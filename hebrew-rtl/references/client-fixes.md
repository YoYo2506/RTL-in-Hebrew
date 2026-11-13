# Client-side fixes for left-aligned Hebrew

Only read this when the user asks why a reply still shows left-to-right, or how to get true right alignment. Give only the option for the app they use, in Hebrew, briefly.

The reply text cannot force alignment. In an app that hard-codes left-to-right, the rules in SKILL.md still stop scrambling where the app does bidi reordering, but they do not right-align the text. Real alignment comes from the app or from something that changes it.

| App | Situation | Options |
|---|---|---|
| claude.ai and Claude Code in a browser (claude.ai/code) | No built-in per-message RTL | The user's own userscript `claude-hebrew-rtl.user.js` from the RTL-in-Hebrew repository, installed in Violentmonkey. It sets each block's direction by the majority of its letters, so a mostly-Hebrew paragraph is right-aligned even when it opens with an English term |
| Claude Desktop (Windows) | Sets each paragraph's direction from its first letter (seen November 2026, chat and Claude Code views) | Nothing to install. A Hebrew paragraph that opens with an English term stays left-to-right, so the fix is the wording rules in SKILL.md. The userscript cannot run inside the app |
| Claude Code in VS Code | The panel forces left-to-right | A VS Code extension for Claude Code RTL (search the marketplace for "Claude Code RTL") |
| Claude Code in a terminal | Depends on the terminal: VS Code's terminal, Windows Terminal and many others do no bidi at all, so Hebrew can appear reversed | A terminal with bidi support (for example Konsole, GNOME Terminal with bidi enabled, mlterm), or a wrapper that reshapes RTL text in transit |

## Privacy caveat (always mention it with an extension or patch)

A browser extension or app patch that changes how Claude shows text can read everything on the page or in the app, including client names, privileged material and personal data. For a lawyer that is a confidentiality and data protection question, not just an IT one: check who publishes it, what permissions it asks for, whether the code is open, and whether it sends data anywhere, before installing. Prefer open-source code that can be read, and pin a reviewed version.

Do not call any third-party extension or patch safe; you have not audited it. Violentmonkey is named only as the host for the user's own script, and the user decides whether to install it.
