# Accessibility

Visible labels belong to every input. Invalid input retains its committed value and exposes an associated error. Result changes use polite announcements; blocking errors use alerts. A/B solutions use labels and line treatment rather than color alone. Forced colors retain selected, focus, tooltip, and load states.

## Load marker

The load marker is one focusable slider named “Load marker.” Its description gives the keyboard contract, while `aria-valuetext` reports resistance, reactance, reflection magnitude, and phase. Arrow keys move by `0.002 Γ`; Shift plus Arrow moves by `0.02 Γ`. Enter commits, Escape cancels, and moving focus away commits a pending keyboard adjustment. Commit and cancellation get one polite announcement; pointer previews do not flood the live region.

Mouse, pen, and touch share Pointer Events. Pointer capture keeps a drag active outside the target. Cancellation restores the committed load without changing URL or history. The invisible marker target is at least 44 by 44 CSS pixels at the supported 320-pixel chart width. `touch-action: none` applies only to this target, leaving page scrolling available elsewhere.

The tooltip is visual support, not a second accessibility description. It follows the marker without accepting pointer events. Chart prose, marker value, numeric fields, and results all reflect preview state. Active loads outside the passive unit disk remain editable through numeric fields and receive a textual diagnosis; they do not expose an off-chart drag target.

## Motion and manual checks

Marker movement has no interpolation or inertia. Matching-path animation pauses during manipulation. User animation preference and `prefers-reduced-motion` disable optional sequence motion. Focus remains visible through SVG-native and forced-color rings.

Automated checks cover accessible name/value/description, keyboard transaction behavior, target size, reduced motion, and Chromium/Firefox/WebKit interaction. Release review must also exercise iOS Safari with VoiceOver and Android Chrome with TalkBack because desktop touch emulation cannot validate assistive-touch slider gestures.
