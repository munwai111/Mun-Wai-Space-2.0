# Mun Wai Space™

A personalised, responsive portfolio for Looi Mun Wai. Built around people, psychology, practical AI creation and commercial experience, with an original visual identity rather than a space theme.

## Run

```sh
npm ci
npm run dev
```

## Production

```sh
npm run build
npm run preview
```

The `dist/` folder is the static production website. It is deployed on Vercel at https://mun-wai-space.vercel.app; `vercel.json` sets the install and build steps, the output directory and the security headers. No API keys, database or external font service are required.

External project and credential links remain external and may require sign-in.

## What works

- Seven project case studies, with category filters and expandable selection.
- Supporting material for four flagship projects: Career OS build records, a M.I.D.A.S decision flow, and VTAC/RMIT archive photographs with method notes.
- Native modal dialogs with keyboard focus containment, Escape dismissal and focus restoration.
- An underlined Applied Science (Psychology) introduction opens four practical contributions: Career OS, VTAC, RMIT CIAIRI and UNIQLO. Each identifies the work, delivered result or current responsibility, and ownership, with a working route to the case study or role. The broader personal perspective is expandable supporting context.
- An interactive People / Strategy / Systems composition with pointer-reactive generative artwork.
- Seven organisation chapters for UNIQLO, VTAC, RMIT CIAIRI, Xolvit, YakBit AI, Kansai University and SuperAI, with a floating Polaroid carousel of eleven archive photos and one illustrated chapter. Organisation colours, matching experience copy and source links follow the selected moment.
- A continuous six-chapter journey covering 2021–2026: one opening photo expansion that the first year grows with, translucent years that fill the frame and respond to the pointer, image-filled titles, and scroll-revealed introductions that settle fully inside the frame with a light elastic drag. All 24 timeline photographs and 18 detail bullets remain. Photo controls, enlargement and a plain reading view remain available. Twenty-five archive photographs are used across the site.
- The full 34-minute podcast in a native player, with audio-reactive particles, synchronised word highlighting, speaker labels, chapter navigation, speed/volume controls and a readable transcript.
- Playback opens a full-page listening scene inspired by the supplied Vizz Mesh Grid preset. Pause or Escape fades back to the same portfolio position; Reset and the end of the episode return and rewind. The scene follows the visitor's light or dark theme, including the mesh: a dark room adds lit points onto the ground, a pale one lays ink points over it.
- Three sourced public stories: the Career OS build reflection, FMTY filmmaking and Xolvit interview.
- Four personal perspectives on connection, curiosity, courage and a balanced life.
- Thirty-one searchable credential records with discipline filtering, empty states and original verification links where supplied.
- Expandable professional experience, including the current UNIQLO Malaysia HQ role.
- A labelled contact form with browser validation and a reviewable email draft. The visitor sends through their own email app. There is no server-side message delivery and no false success state.
- Copy-email feedback, responsive navigation, a light/dark switch and a persistent motion pause control.
- Email, LinkedIn, Instagram and GitHub links in the contact section, with the social profiles opening in a new tab.
- Reduced-motion preference support, local assets and fonts, semantic headings and visible focus states.

The podcast is **AI Unplugged**, produced by Monash DeepNeuron and hosted by Evangeline Wong and Aarush Pandey; Mun Wai appears as a guest. The recording belongs to AI Unplugged / Monash DeepNeuron and is shared here with credit. The creator-published episode is hosted alongside the site so playback and Web Audio analysis share the same origin. The 33 MB recording is fetched only after a visitor plays or seeks. Captions are fetched when the listening section approaches the viewport. Text and speaker turns were generated locally; the interface identifies them as automatic because occasional recognition or attribution errors may remain. Spotify remains available as an external listening option.

## Editing the content

| File                                    | Purpose                                                                        |
| --------------------------------------- | ------------------------------------------------------------------------------ |
| `src/data.js`                           | Projects, career experience, timeline narrative and approach                   |
| `src/credentials.json`                  | Credential names, issuers, dates and original links                            |
| `src/gallery.json`                      | Archive image mapping                                                          |
| `src/main.jsx`                          | Page composition, contact flow and personal perspective copy                   |
| `src/ImpactNote.jsx`                    | Underlined degree link, practical contributions and supporting case navigation |
| `src/impact-note.css`                   | Pen underline, light/dark backdrop and responsive overlay                      |
| `src/Ink.jsx`                           | Accessible writing-on headings and viewport lifecycle                          |
| `src/ink-runtime.jsx`                   | Lazy-loaded SVG stroke masks that preserve the existing typefaces              |
| `src/ink-timing.js`                     | Stroke-length pacing, pen lifts and word/line pauses                           |
| `src/ink-assembly.json`                 | Original centreline routes exported by `generate-font.py`                      |
| `src/ink-manrope.json`                  | Original masks generated against the locally licensed Manrope font             |
| `generate-ink-manrope.py`               | Rebuilds Manrope mask routes using fontTools and the local font                |
| `src/NeuralBrain.jsx`                   | Organic brain contours and animated neural connections                         |
| `src/HeroPortrait.jsx`                  | Six-photo opening album with playback and manual controls                      |
| `src/Journey.jsx`                       | Continuous photo scene, six life chapters, year shortcuts and photo controls   |
| `src/ScrollExpand.jsx`                  | Adapted React Bits frame expansion with externally controlled progress         |
| `src/ScrollExpand.css`                  | Frame clipping, media zoom and static/print presentation                       |
| `src/ScrollReveal.jsx`                  | Scroll-linked paragraph reveal with scoped GSAP cleanup and readable fallback  |
| `src/ScrollReveal.css`                  | Paragraph layout and reduced-motion/print visibility                           |
| `src/MaskedHeading.jsx`                 | Image-filled SVG lettering over a readable native heading                      |
| `src/MaskedHeading.css`                 | Heading mask, native fallback and print/forced-colour presentation             |
| `src/VariableProximity.jsx`             | Pointer-distance interpolation of every requested font variation axis          |
| `src/VariableProximity.css`             | Local Roboto Flex face, styling and accessible label treatment                 |
| `src/journey-expand.css`                | Continuous scene, fixed-header offsets, controls and plain reading layout      |
| `public/images/present-texture.svg`     | Original abstract texture filling the 2026 title; not a photograph             |
| `generate-roboto-flex-digits.py`        | Rebuilds the local digits-only Roboto Flex subset used by the years            |
| `public/fonts/roboto-flex-digits.woff2` | Digits-only Roboto Flex with its weight and optical-size axes                  |
| `vendor/react-bits/`                    | Installation records, source hashes and provenance                             |
| `licences/react-bits-LICENSE.md`        | Upstream MIT plus Commons Clause notice                                        |
| `src/JournalMarks.jsx`                  | Organisation stickers, location stamps and personal journal notes              |
| `src/useSceneActivity.js`               | Shared visibility, hidden-tab and listening-room suspension                    |
| `src/journal.css`                       | Journal details, heading animation and navigation                              |
| `src/Weave.jsx`                         | Original reactive canvas artwork                                               |
| `src/Worlds.jsx`                        | Organisation chapters, photo sequence and accessible carousel controls         |
| `src/Polaroid.jsx`                      | Floating photo transitions and spring-based pointer tilt                       |
| `src/polaroid.css`                      | Paper prints, depth, responsive layout and reduced-motion presentation         |
| `src/podcast-audio.js`                  | Local listening boost, peak compression and voice analysis                     |
| `src/Podcast.jsx`                       | Native audio transport and synchronised caption display                        |
| `src/VoiceField.jsx`                    | Audio sampling, mesh lifecycle and a gently flowing inline preview             |
| `src/mesh-renderer.js`                  | Original GPU point terrain, with a Canvas fallback                             |
| `src/ListeningRoom.jsx`                 | Full-page listening scene, native focus containment and return transitions     |
| `src/listening-room.css`                | Responsive listening scene and transition styling                              |
| `src/podcast-timing.js`                 | Caption lookup, chapter times and transport boundaries                         |
| `public/audio/`                         | Full episode recording, timed captions and readable transcript                 |
| `src/CaseEvidence.jsx`                  | Supporting records, explanatory flow and archive material for flagship cases   |
| `src/case-evidence.css`                 | Responsive presentation of case-study supporting material                      |
| `src/styles.css`                        | Colour tokens, layout, responsive behaviour and motion rules                   |
| `public/images/`                        | Optimised photographs from the original portfolio                              |
| `public/fonts/`                         | Original display typeface, body typeface and licence files                     |

Dates and outcomes are stated conservatively. `SOURCES.md` credits the third-party code, typefaces, media and references the site uses.

## Typography

**Mun Wai Assembly** is an original generated display font, constructed from custom glyph geometry. It includes A-Z, lowercase aliases to uppercase, digits 0–9, @, a period and a hyphen. It is a display alphabet, not a multilingual text family. Its open curved bowls, broad M/W and regular structural strokes express the relationship between people and systems. The generator is included as `generate-font.py`; regeneration requires Python, `fonttools` and `brotli`.

**Manrope** handles body copy, controls, numerals and detailed reading. It is locally hosted under the SIL Open Font Licence, included with the font. Chinese characters use the visitor's system fallback font.

**Roboto Flex** appears only in the timeline years. A digits-only subset is hosted locally under the SIL Open Font Licence, keeping the weight (100–1000) and optical-size (8–144) axes so the years can travel between `'wght' 400, 'opsz' 9` and `'wght' 1000, 'opsz' 40` near the pointer. `generate-roboto-flex-digits.py` rebuilds it from the upstream variable font; no Google Fonts request is made.

## Design decisions

The palette uses mineral white, deep green and chartreuse, picking up the green in the real Melbourne photograph. Light and dark themes share one token system, and every feature follows the theme, including the timeline and the listening room. Where a surface blends rather than paints, the blend inverts with the theme: the timeline years screen onto a dark card and multiply into a pale one, the masked headings' lift does the same, and the listening room's point mesh switches from additive to normal blending. Because normal blending does not accumulate the way additive does, the pale room is given more ink per point than the dark one rather than the same, and its scrim is thinner. The light scrim over the timeline photographs is thinner than the dark one, so the photographs keep their colour; the story copy that sits over them was measured against the busiest part of each image to confirm it stays above its contrast floor. Fills chosen to read as light on a dark card — the photographs and the 2026 texture inside the masked headings — are carried down in light mode so the lettering stays ink. Project art is explicitly typographic illustration, not a simulated product screenshot.

Motion introduces the reading order, acknowledges interaction and responds to the recording. Canvas drawing stops off-screen and when the document is hidden. Reduced motion makes the podcast particles static while audio and word highlighting continue. Device preference changes apply immediately. Pointer coordinates remain outside React state. There is no scroll hijacking or replacement cursor.

The portfolio adds no analytics or tracking scripts. Audio analysis uses the recording, never the microphone. The podcast plays locally without a third-party embed or sign-in. Film-journal reels contact Instagram only when a visitor opens one; Instagram controls its own media, cookies and sign-in requirements. Local storage holds only theme and motion preferences.

The opening album moves through six personal photographs. The organisation journal adds stamps, stickers and pins grounded in the archived experiences. The timeline follows ordinary document scrolling through six life chapters over one shared photo scene; year shortcuts stay below the site header. All photo collections retain manual navigation. A compact footer follows the contact section, where Instagram remains alongside the other social links. Heading reveal reserves the complete text layout and exposes one readable copy to assistive technology.

## Continuous timeline

One sticky photo frame expands at the entrance to the timeline and stays open for all six chapters; it crossfades between the active chapter's photographs and never restarts the expansion. Each chapter is an ordinary scroll track whose year and story layers settle into that frame. The first year sits inside the opening frame and grows with it. Every later year fades in after a short pause, fills the frame, then fades out as its story rises in. The story holds once every word is revealed, then leaves before the next year. Tracks overlap by one frame height, so chapters hand over without an empty frame. Year shortcuts and direct links land while the chosen year fills the frame, below the fixed header and timeline navigation.

The photo console shows the current chapter's caption, previous/next controls, count, autoplay toggle and enlargement action. Photographs advance every seven seconds while the scene is active; hovering or focusing the console holds the photograph, and manual navigation pauses autoplay. All 24 archive photographs remain available across their original five photo-bearing years. The sixth chapter, 2026, keeps its existing three detail bullets and a neutral present-day background, without assigning an older photograph to the year. All six years and 18 detail bullets remain.

The chapter introductions use ScrollReveal's requested configuration (opacity 0, 10 px blur, 5° rotation), scrubbed against the chapter track with a 0.9 s catch-up so the words trail the scroll slightly. Scroll velocity also drives a spring on each story: a fast scroll lets it lag by up to 36 px, and it settles back with a small overshoot. The browser's own scrolling is never intercepted. All stories share one type scale, measured against the tallest chapter, so each revealed description fits above the photo console at every supported size. MaskedHeading fills the titles with the active year's photographs and crossfades as they change rather than replaying its wipe. A light screen-blended lift and outline keep dark areas of a photograph legible, and native lettering stays underneath if an image or mask is unavailable. The 2026 title uses an original abstract texture instead of an older photograph.

VariableProximity uses the registry's linear falloff, with a reach scaled to the numerals. It moves the translucent, screen-blended years from `'wght' 400, 'opsz' 9` towards `'wght' 1000, 'opsz' 40` near the pointer, interpolating every requested axis at once against the locally hosted Roboto Flex digits. The registry's Google Fonts import stays removed. Tall frames stack each year as two pairs of digits. Pointer animation settles to rest, and the shared activity hook suspends the scene in hidden tabs, off-screen and behind the listening, impact or film overlays.

**Read as page**, Pause motion and the device’s reduced-motion preference offer a compact document layout with readable text and manual photographs inside each chapter. Very short or narrow screens select this layout automatically. The ordinary document scrollbar remains in both layouts; no nested timeline scroller or replacement scrolling system is used.

ScrollExpand, ScrollReveal, MaskedHeading and VariableProximity were installed from their exact React Bits JS-CSS registry items with shadcn CLI 4.21.0 in an isolated staging project, then adapted locally. Registry URLs, source hashes and installation records are in `vendor/react-bits/` (the unmodified registry items are not redistributed); the upstream MIT plus Commons Clause notice is retained in `licences/react-bits-LICENSE.md`. ScrollReveal and MaskedHeading require GSAP: the portfolio adds GSAP 3.15.0 under its [Standard No Charge licence](https://gsap.com/community/standard-license/). The existing Motion 12.43.0 satisfies the VariableProximity registry requirement. No Tailwind setup, duplicate Motion package or external font service was added. `vendor/react-bits/PROVENANCE.md` identifies each registry URL and the adaptation boundaries.

## Validation

Lighthouse is a local lab test; deployed performance depends on hosting, device and connection. It does not prove full accessibility conformance or validate the professional claims.

`npm test` checks caption data, transport timing and writing cadence. With the site running, `npm run test:podcast:browser` checks actual audio, particle changes, word highlighting, controls, responsive widths and accessibility in a separate headless Chrome profile. Set `PODCAST_TEST_URL` to test the production preview and `CHROME_PATH` if Chrome is installed outside the default macOS location.

`node tests/journal-browser.mjs` checks the portrait album, neural illustration, journal keepsakes, Singapore chapter, six scroll-led years, photo enlargement, the Instagram contact link, responsive widths and page accessibility. `node tests/worlds-browser.mjs` checks the complete twelve-moment organisation carousel.

`node tests/impact-browser.mjs` verifies the exact introduction, pen underline, four practical contributions, their case-study and role navigation, expandable personal context, both backdrop themes, background suspension, keyboard focus, dismissal and responsive overlay layout.

Podcast playback now includes a local volume boost with peak compression. The more responsive mesh uses a speech-sensitive envelope, faster frequency response and larger displacement and points, retaining the existing frame-rate caps and reduced-motion support. `node tests/podcast-dynamics.mjs` verifies the audio graph, volume/mute behaviour and Canvas fallback. The stored recording is unchanged.

## Handwriting refinement

The established layout, mineral/green/chartreuse palette and font identities are preserved. Large headings now draw through individual strokes with time proportional to travel distance, brief pen lifts and pauses between words and lines. Assembly uses the same original centreline geometry as its font generator. Manrope uses authored mask routes over native SVG text; the exact browser-rendered letters take over at completion. This is a typography treatment, not a recording of Mun Wai’s handwriting.

The writing renderer and glyph maps load once, on demand. Fonts are allowed to settle before tracing; if loading stalls, native text appears within 1.2 seconds without a late animation replay. Only visible headings create SVGs, and those temporary elements are removed after the finite animation or when the heading leaves view. Reduced motion skips the writing download. Print includes unvisited headings. The podcast’s spoken-word captions retain their existing treatment.

`node tests/ink-browser.mjs` checks actual progressive strokes, stable heading dimensions, exact native text restoration, off-screen cleanup, content changes, the motion switch, one shared writing download, reduced motion, stalled-download fallback, print, responsive layouts and accessibility.

## Film journal and quiet motion

The existing public-stories section now includes a nine-film journal: two Xolvit interviews, the Monash DeepNeuron podcast announcement, first-year university life, Kansai, Mount Gambier, Mount Buffalo, a Japan street vignette and the 2024 Japan/graduation recap. Filters and a manual film selector keep every story available. Existing written reflections remain underneath.

`src/films.js` holds verified reel destinations, credited creators, publication months and descriptions. Publication dates are not necessarily travel or event dates. Cover photographs come from the existing photo journal and are labelled accordingly; they are not presented as extracted video frames. Typography provides covers where there is no corresponding archive photograph. `src/FilmJournal.jsx` and `src/film-journal.css` control presentation.

For reels that support inline playback, an explicit Watch action mounts an Instagram iframe. The two Xolvit interviews, Monash announcement, Kansai film and Mount Gambier film were confirmed playing inline. The first-year recap, Japan street clip, Mount Buffalo and 2024 recap use a direct **Watch on Instagram** action because the provider offered outbound playback or could not reliably initialise inline video. The viewer always includes the original link, supports keyboard dismissal and restores the opener’s focus. Closing unmounts the iframe, stopping its media. Instagram owns its player accessibility and availability; the portfolio does not claim that it can add captions or repair provider controls. The separate full podcast retains its existing native audio and captions.

`src/QuietField.jsx` adds twenty restrained ink lines at the edges of Projects and Contact. Drawing is capped at 24 fps and DPR 1.5; it stops off-screen, in hidden tabs, behind native dialogs and under reduced motion or Pause motion. `src/refinements.css` adds primary-button fill and arrow feedback plus soft asymmetric digital frames; physical Polaroids retain their paper edges. `src/PageThread.jsx` adds a thin scroll-position line without taking over scrolling. No runtime dependency was added.

The Japan street vignette and recap are not labelled as programme footage.

Run `node tests/film-browser.mjs` for interface, provider-failure fallback, focus, layout, accessibility and motion-lifecycle checks.

## Licence

Mun Wai Space™ © 2026 Looi Mun Wai. All rights reserved; see `LICENSE`. Third-party code, typefaces and media keep their own licences and credits, listed in `SOURCES.md`.
