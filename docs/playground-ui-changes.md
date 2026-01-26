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
  - Dashboard safe icon: flipped light/dark background to keep contrast in dark mode.
  - Status chips: added dark-mode backgrounds for safe/warning/danger across badges/logs/notifications.
  - Bottom nav: added active icon capsule highlight for clearer current tab.
  - Accessibility: added `aria-label` + focus-visible ring for icon-only buttons.
  - Secondary text: normalized dark-mode secondary text to `gray-300` for consistent hierarchy.
  - Elder list: swapped status avatars to semantic safe/warning colors.
  - Dashboard robot status: aligned pill icon tone to warning palette (removed peach).
  - Fixed dark blocks: tuned muted text in LCD preview, dispenser, emergency, and LCD fullscreen.
  - Dashboard safety icon: moved to safe palette for light/dark consistency.
  - Color consolidation: swapped LCD preview accent to primary and weekly medication dots to safe palette.
  - Notifications: adjusted dark-mode borders so unread is more prominent and read is softer.
  - Notifications: reduced dark-mode border intensity for a softer emphasis.
  - Notifications: matched light-mode feel with very subtle dark borders.
  - Medication dots: aligned weekly completion pills to primary palette for consistency.
  - Settings toggles: unified track tones with primary/gray borders for consistent controls.
  - Primary dark usage: shifted text to `primary-400` and normalized dark fills to `primary-500/20`.
  - Settings accents: matched edit/time chip outlines to primary ring style.
  - Settings accents: softened primary rings for lighter perceived weight.
  - Settings controls: moved edit/time chips to neutral gray to keep CTA hierarchy.
  - Settings controls: softened primary in dark mode for toggles, radio, and TTS bar.
  - Settings toggles: centered the knob with `top-1/2` alignment.
  - Primary dark usage: unified fills to `primary-500/*` and solid accents to `primary-400`.
  - Settings controls: aligned dark-mode primary tones to agreed toggle/radio/TTS values.
  - Dark highlights: bumped primary fills to `primary-400/25` for better contrast.
  - Robot LCD listening bars: bottom-aligned and fixed height for inverse feel.
  - Robot LCD eyes: moved tracking to parent and widened the happy mask for consistent crescent.
  - Robot LCD eyes: raised happy mask and removed mask glow.
  - Robot LCD eyes: rounded mask radius for smoother crescent.
  - Robot LCD eyes: removed eye glow when happy for a cleaner crescent.
  - Robot LCD eyes: added overlap-only glow strip inside mask.
  - Robot LCD eyes: restored base glow while keeping clipped overlap glow.
  - Robot LCD eyes: moved mask inside eye clip to show glow only at overlap.
  - Robot LCD eyes: replaced overlap gradient with clipped mask shadow.
