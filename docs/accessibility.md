# Accessibility

Smith Match treats the chart as one view of a calculation, never the only source of information.
Mouse, pen, touch, keyboard, and textual workflows expose the same committed load and matching result.

## Inputs, results, and chart equivalents

Every input has a visible label and spoken unit. Invalid drafts retain the last committed calculation,
associate the error through `aria-errormessage`/`aria-describedby`, announce the stale state, and disable
share, copy, and SVG export until corrected. Result changes use polite announcements; blocking failures
use alerts.

A/B solutions differ through labels, circular/diamond junction shapes, solid/dashed paths, card borders,
and prose—not color alone. Forced colors preserve selection, focus, tooltip, load, junction, and center
match. The visible Chart summary describes physical/normalized load, reflection coefficient, selected
path, both junctions, feed/stub lengths, direction, termination, and residual. Numbered matching steps
provide a text equivalent for staged animation.

Selected-path and compare-both controls expose native radio/checkbox state. Comparison never changes
construction selection or URL. Clipboard failure exposes labeled, selected fallback text.

## Load marker

The marker is one HTML slider positioned over SVG geometry. `aria-valuetext` reports resistance,
reactance, reflection magnitude, and phase. Arrow keys move by `0.002 Γ`; Shift+Arrow moves by `0.02 Γ`.
Enter commits, Escape cancels, and blur commits a pending keyboard adjustment. Commit/cancel announces
once; pointer previews do not flood live regions.

Pointer capture keeps drags active outside the target. Cancellation restores load without URL/history
change. Target size remains at least 44×44 CSS pixels at the supported 320-pixel chart width.
`touch-action: none` applies only to the marker target, preserving page scroll elsewhere. Active loads
outside the passive unit disk remain editable through numeric fields and receive textual diagnosis.

## Dialogs, education, and responsive order

First use starts with a dismissible prompt, not an auto-focused modal. Learn and Examples use labeled
native dialogs with Escape, contained focus, close control, and focus return. Chart education overlays
change no calculation, history, URL, or preference and clear through Escape or visible control.

At mobile widths, DOM/focus order is chart, selected result, inputs, alternate result, advanced details,
then warnings. The app supports a 320-pixel viewport and 200% text scaling without two-dimensional
scrolling. Essential instructions and validation never exist only in tooltips.

## Motion and visual adaptation

Marker movement has no inertia. Matching animation pauses during manipulation. User animation setting
and `prefers-reduced-motion` expose the final diagram immediately. Focus remains visible in normal and
forced-color modes. Light/dark tokens and critical chart identities have automated contrast checks.

## Compatibility evidence and limits

Automated release evidence covers:

- WCAG 2 A/AA, 2.1 A/AA, and 2.2 AA tagged axe scans across solved, invalid, matched, no-passive,
  dialog, dark-theme, mobile, and expanded-summary states
- Accessible names, descriptions, values, errors, native states, announcements, focus, target size,
  keyboard transactions, reflow, reduced motion, forced colors, and text equivalents
- Desktop Chromium, Firefox, and WebKit plus Pixel-class Chromium and iPhone-class WebKit projects

Accessibility trees and ARIA assertions are the Phase 8A compatibility gate. Automated checks cannot
prove every screen-reader/browser/gesture combination. Manual VoiceOver and TalkBack sessions are
desirable exploratory validation and should be recorded when available, but are not release blockers.

Runtime interaction uses an HTML slider rather than interactive SVG `foreignObject` because browser
focus/accessibility-tree behavior differs. Exported SVG retains static marker geometry, title,
description, text construction instructions, and sanitized metadata.

See [testing](testing.md), [architecture](architecture.md), and the
[contribution guide](../CONTRIBUTING.md) for verification commands and change requirements.
