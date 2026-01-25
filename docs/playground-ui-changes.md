# Playground UI change log

This file tracks manual UI tweaks made during the Codex session so you can
revert or cross-check later.

## Session notes
- File: `frontend/src/pages/Playground/index.tsx`
  - Primary buttons: added subtle outline via `ring-1` plus dark-mode ring.
  - Medication progress bar: added `dark:bg-primary-400` for contrast.
  - "Add medication" button: added outline (`border` in dark/light).
  - Dispenser card: added subtle border (`border-white/10`).
  - Secondary buttons: added outline to schedule add + settings edit buttons.
  - Dark mode contrast: added dark text variants for labels/icons and adjusted schedule dots/bars.
  - CTA buttons: unified to primary style for "일정 추가" and "약 추가하기".
  - Dark mode legibility: brightened "오늘" date styles and medication completion chips.
  - Dark mode legibility: raised contrast for read notification text and inactive bottom tabs.
