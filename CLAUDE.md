# Groundwater scrollytelling (standalone site, featured from getmulhern.com)

Owen Mulhern (freelance analyst / data journalist, getmulhern.com, GitHub Pages, repo moovapp2023/owen_pro) is turning his California groundwater visual series, the 3D California model and the wells viz into one scrollytelling article. This repo is its own website, linked and featured from owen_pro.

## How Owen wants to work
- Implement changes directly and incrementally. No briefs, no extra steps, no planning documents. Discuss in chat.
- Keep a running tally of where things stand at each update (built / not built / open questions).
- Keep his Claude memory updated with every site change and methodology note (portfolio-site and california-water-investigation files).
- No em dashes in any site copy.
- He is not a developer: he describes changes in plain words, you edit the files. Do not ask permission to look things up on the web.

## Source material
- `svg/`: ~20 Figma SVG exports, each frame 6135 x 5440, element ids included. Every file starts with a full-canvas white `<rect>` that must be stripped. Text is NOT in the SVGs; all labels are HTML (fonts/sizes/colors still to come from his Figma "with text" frames).
- `refs/`: end-state reference PNGs (full-size, 6135 x 5440) in scene order. Use them for pixel comparison.
- `template.html` + `build.py`: current build. `build.py` pulls elements out of the SVGs by id and inlines them into `template.html`, producing `site/index.html`. `shot.py` is a Playwright screenshot helper (paths are sandbox-specific, adapt them); `?full` in the URL forces the full-canvas camera so screenshots can be compared 1:1 with `refs/`.
- Plan for the repo: move SVGs to real asset files, keep the scroll code in its own JS file, host GSAP + ScrollTrigger locally or from a pinned CDN (3.12.5). Use his real site fonts when known.

## Architecture (what is built)
- One pinned stage (`position: sticky`/ScrollTrigger pin, scrub) holding a 6135 x 5440 "world" div: inline SVG layers plus absolutely positioned HTML labels. A camera (cx, cy, w, h) is tweened per scene; scale = min(vw/w, vh/h). Label font size is `max(designPx, minScreenPx / scale)` so text stays readable on phones.
- Curve: ONE `<path>`. Frames 4 and 5.5 share identical path structure, so the curve morphs by interpolating numbers. The frame 2.5 pose is an affine fit of the frame 4 path into the 2.5 bounding box (max error ~14px, mean ~4px). Stroke width tweens 35 -> 90. Draw-in uses pathLength=1 dash.
- Frame 4 red band group is reused for the frame 5 left band via a transform (sx 0.7915, sy 0.75, anchored to the 5.5 curve pose); the frame 5 wedge and dashed arrow come from `Frame_5_no_text`.
- Frame 5.5 bis (feTurbulence noise hatch) is revealed upward with a clipPath rect. It is heavy on phones; plan to replace with a static image or simpler pattern. The scribble outlines (thousands of points) are also heavy; simplify.
- Timeline total ~25.4 units, scroll length = total * 0.55 viewport heights.

## Scene status (reference image -> frames)
Built (matches references closely on desktop):
1. `01` Frame 2: full block with "860 km3", leader line, "<- 30,000 years ago", "1960". Block bleeds off the left edge.
2. `02` Frame 2.5: left part of block wipes away, jagged top + red band + curve draws in, "1960"/"2020", dashed arrow (drawn by hand from the reference, not in any SVG), "202 years left".
3. `03` Frame 3: gradient overlay, small gradient bar + arrow, "less usable & harder to get". Year labels fade out.
4. `04` Frame 4: block disappears, curve morphs to centered/bigger, red band, six leader bars + "Drought" labels, headline "THIS MUCH IS GONE FOREVER".
5. `05` Frame 5: curve shrinks to the 5.5 pose, band shrinks, wedge flies in, dashed arrow wipes, "NEVER COMING BACK PART", pile of six "Drought" labels along the arrow, "FUTURE, PROBABLY".
6. `06` Frame 5.5 + 5.5 bis: everything fades except the curve, hatch fades up from the curve, text "where did this go?". Then the pinned stage should scroll up and out and the next viz scrolls in normally (the next section placeholder exists).

NOT built yet (reference images 07-12, SVGs available):
7. Frame 6: bar chart (Cities blue over Agriculture red, 1960-2020) inside a black outline. The outline fades as bars separate. Frame 6 columns are red/blue rect pairs (~58 columns).
8. Frame 6 -> 7: the 19 transition rects (`Frame_6_no_text_transition`, "Rectangle 83-101") are the first 19 yearly bars (2002-2020) and morph into the first 19 bars of Frame 7 (`Rectangle 85-103`, 21 bars total, 2002-2022; 2021-2022 grow in). Frame 7 bars use flipped `matrix(1 0 0 -1 X 4217)` transforms: normalize. Frame 7 has a white label box cutting the dashed blue line (rebuild as HTML) and "Total farm water usage (100%)" dotted line.
9. Frames 7 + 8 + 9: red groundwater % graph stays; the black dry-well graph (Frame 8) is aligned over it on the shared timeline (their original positions are the alignment); then both move together to the Frame 9 pose (about 1.114x scale, shifted so 2006 is the first bar). Frame 8 has a white arrow (invisible on white; purpose unclear) and a red line. Annotations: "70%" and "DROUGHT PEAKS". Reference 11 shows the end pose with axes 50/150/250, years 2012/2026, "FARM GROUNDWATER", "REPORTED DRY WELLS".
10. Frame 10: dry-well bars as three colors (green resolved, blue interim, red outage), in groups `GREEN`/`BLUE`/`RED` (~110 bars each, `Vector_N`, ~22px wide, baseline ~y 4396). Plan: separate by color into rows, bottom-aligned (blue maybe center-aligned), keeping timeline order. Two Frame 10 exports have different baselines/bar widths (confirm same source frame). Labels: "2012-2016" box, "Left at least 2,600 homes waterless *", footnote "* Reported. Strong underestimate.", legend.
- Earlier frames not in references yet: `Frame_1_bis` (right part of block) and `Frame_1.5_bis` (tiny 32.5 x 70.4 rect = LA's annual water use) with the intended beat: quiet scroll, then the small rectangle "pops" in suddenly (tipping point) with a ring/circle for visibility, text says it is LA's annual water use, the groundwater block disappears and a list of LA water uses stacks downward. Not built.

## Next structural change (Owen's request)
Article text blocks scroll past on the sides of or over the pinned viz. Make each scene a named step so a text block can trigger it (scrollama-style steps or ScrollTrigger per step), text beside the viz on desktop and over it on phones.

## Open questions for Owen
- Final fonts, sizes, colors and the copy per step (from his Figma "with text" frames).
- Which volume the block depicts: 860 km3 (Scanlon 2012, 2000) vs 788 km3 (his update, 2023).
- Purpose of the white arrow in Frame 8; whether the two Frame 10 files come from the same Figma frame; what red/blue mean in Frame 6.
- Domain / repo name for the standalone site and how it is featured on getmulhern.com.

## Data context (for copy checks)
Scanlon 2012: 860 km3 in 2000, 2.2 km3/yr -> ~390 years. Owen's update: 788 km3 in 2023, 3.9 km3/yr -> ~202 years. 1 acre-foot = 1,233.5 m3. LADWP supply ~480,000 AFY. Verify the 63% (2022) groundwater share on the red chart against his data.
