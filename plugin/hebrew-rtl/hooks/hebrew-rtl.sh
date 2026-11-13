#!/usr/bin/env bash
# UserPromptSubmit hook: if the prompt contains Hebrew, add the RTL reply rules
# to Claude's context. Prints nothing (and adds nothing) for other prompts.
# Matches Hebrew letters as raw UTF-8 bytes (U+0590-U+05FF) or as \u05xx JSON
# escapes, so it needs no tools beyond bash and grep.

input=$(cat)
if printf '%s' "$input" | LC_ALL=C grep -q -e $'\xd6[\x90-\xbf]' -e $'\xd7[\x80-\xbf]' -e '\\u05[9a-fA-F][0-9a-fA-F]'; then
  cat "$(dirname "$0")/rtl-context.json"
fi
exit 0
