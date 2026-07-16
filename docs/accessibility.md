# Accessibility

Visible labels belong to every input. Invalid input retains its committed value and exposes an associated error. Result changes use polite announcements; blocking errors use alerts. A/B solutions use labels, circular/diamond junction shapes, solid/dashed paths, card borders, and prose rather than color alone. Forced colors retain selected, focus, tooltip, load, junction, and center-match states.

Chart description names both unit-conductance intersections, direction toward generator, feed/stub electrical lengths, and residuals. Numbered matching steps provide textual equivalent for staged animation. Selected-path and compare-both controls expose native radio state; comparison never changes construction selection. Clipboard status uses polite announcements, with labeled read-only fallback text when Clipboard API is unavailable.

## Load marker

The load marker is one focusable slider named “Load marker.” Its description gives the keyboard contract, while `aria-valuetext` reports resistance, reactance, reflection magnitude, and phase. Arrow keys move by `0.002 Γ`; Shift plus Arrow moves by `0.02 Γ`. Enter commits, Escape cancels, and moving focus away commits a pending keyboard adjustment. Commit and cancellation get one polite announcement; pointer previews do not flood the live region.

Mouse, pen, and touch share Pointer Events. Pointer capture keeps a drag active outside the target. Cancellation restores the committed load without changing URL or history. The invisible marker target is at least 44 by 44 CSS pixels at the supported 320-pixel chart width. `touch-action: none` applies only to this target, leaving page scrolling available elsewhere.

The tooltip is visual support, not a second accessibility description. It follows the marker without accepting pointer events. Chart prose, marker value, numeric fields, and results all reflect preview state. Active loads outside the passive unit disk remain editable through numeric fields and receive a textual diagnosis; they do not expose an off-chart drag target.

## Education and progressive disclosure

First use begins with a dismissible prompt, never an automatically focused modal. Its optional four-step guide uses native buttons, current-step text, Back/Next/Finish controls, and no timed advance. Completion or dismissal persists; Learn can restart the guide.

Learn and Examples use labeled native modal dialogs with Escape handling, contained focus, close controls, and focus return. Learn topics put plain-language summaries before optional technical details. Every “Show this on the chart” action closes Learn, focuses the chart, announces the target once, and draws a dashed labeled overlay. The overlay changes no URL, preference, solution, or chart-mode state and clears with Escape, its visible button, or the next workspace interaction.

Context help uses real buttons and `role="tooltip"` content. It opens through hover, focus, click, or touch and closes through Escape, pointer exit, focus exit, or outside interaction. Essential instructions, validation, construction warnings, and units remain visible outside help content.

Incomplete numeric drafts retain the committed chart but expose “Showing last valid calculation” and disable copy, SVG export, and share. Matched, active/no-passive, invalid, and numerical-failure results retain distinct headings and actions. Construction warnings appear only for solved constructions.

## Motion and manual checks

Marker movement has no interpolation or inertia. Matching-path animation pauses during manipulation. User animation preference and `prefers-reduced-motion` disable optional sequence motion and immediately expose final diagram. Focus remains visible through SVG-native and forced-color rings.

Automated checks cover accessible name/value/description, keyboard transaction behavior, target size, reduced motion, and Chromium/Firefox/WebKit interaction. Release review must also exercise iOS Safari with VoiceOver and Android Chrome with TalkBack because desktop touch emulation cannot validate assistive-touch slider gestures.
