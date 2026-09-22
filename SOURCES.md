# Credits and sources

Mun Wai Space™ is the personal site of Looi Mun Wai. This file credits the third-party code, typefaces, media and references it uses. Everything not listed here is covered by `LICENSE`.

## Code

| Package                                                                                             | Licence                                                                    | Use                                        |
| --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------ |
| [React](https://react.dev) and React DOM                                                            | MIT                                                                        | Interface                                  |
| [Motion](https://motion.dev)                                                                        | MIT                                                                        | Interface motion and the story drag spring |
| [GSAP](https://gsap.com) 3.15                                                                       | [Standard No Charge licence](https://gsap.com/community/standard-license/) | Scroll-linked reveals                      |
| [Phosphor Icons](https://phosphoricons.com)                                                         | MIT                                                                        | Icons                                      |
| [React Bits](https://reactbits.dev) ScrollExpand, ScrollReveal, MaskedHeading and VariableProximity | MIT + Commons Clause                                                       | Adapted for the timeline; see below        |

The four React Bits components were installed from their JS-CSS registry items and adapted for this site. Their licence and copyright notice are kept in `licences/react-bits-LICENSE.md` and served as `/react-bits-LICENSE.txt`. Registry URLs, install commands and SHA-256 hashes are recorded in `vendor/react-bits/`. The unmodified components are not redistributed here, because the licence allows them to be used only as part of an application or website.

## Typefaces

- **Mun Wai Assembly**: an original display typeface made for this site. It is covered by `LICENSE`; see also `public/fonts/Mun-Wai-Assembly-NOTICE.txt`.
- **[Manrope](https://github.com/sharanda/manrope)**: body text, under the SIL Open Font License 1.1 (`public/fonts/Manrope-OFL.txt`).
- **[Roboto Flex](https://github.com/googlefonts/roboto-flex)**: the timeline years, as a digits-only subset built by `generate-roboto-flex-digits.py` from the variable font in Google Fonts' repository, under the SIL Open Font License 1.1 (`public/fonts/RobotoFlex-OFL.txt`).

All fonts are served from the site itself. No font service is contacted.

## Podcast

"Psychology Meets AI: What if your job was to break AI?" is an episode of **AI Unplugged**, produced by [Monash DeepNeuron](https://open.spotify.com/show/0hc5m8KPerwaX7tCXH8yKZ) and hosted by Evangeline Wong and Aarush Pandey, with Mun Wai Looi as guest. The recording belongs to AI Unplugged / Monash DeepNeuron. The creator-published episode is shared on this site with credit; no ownership of it is claimed. It is also available [on Spotify](https://open.spotify.com/episode/4PGM2iWZIBl0OCHZOANxnC).

The captions and transcript were generated automatically from the recording with [MLX Whisper](https://github.com/ml-explore/mlx-examples/tree/main/whisper) and [Sherpa-ONNX speaker diarisation](https://k2-fsa.github.io/sherpa/onnx/speaker-diarization/index.html). They may contain recognition or attribution errors.

## Film journal

The reels play in Instagram's own embed, loaded only when a visitor opens one, and are never rehosted.

| Film                                            | Creator                                | Published     |
| ----------------------------------------------- | -------------------------------------- | ------------- |
| Xolvit interview, part one                      | @xolvit                                | November 2025 |
| Xolvit interview, part two                      | @xolvit                                | November 2025 |
| Psychology Meets AI announcement                | @monashdeepneuron and @aiunplugged_mdn | October 2025  |
| First-year university recap                     | @munwai111                             | January 2023  |
| Kansai Winter School final day                  | @munwai111                             | March 2023    |
| Mount Gambier road trip                         | @antomi_and_go                         | June 2025     |
| Japan shopping-street vignette                  | @munwai111                             | July 2024     |
| Mount Buffalo                                   | @munwai111                             | April 2026    |
| 2024 recap, including Japan and RMIT graduation | @munwai111                             | January 2025  |

## Photographs

The photographs come from Looi Mun Wai's personal archive and show real people and events. None is generated; they are resized and compressed for the web.

## Organisations

UNIQLO, VTAC, RMIT University, Xolvit, YakBit AI, Kansai University, SuperAI and Monash DeepNeuron are named to describe real roles, projects and events. Their names and marks belong to them, and no endorsement is implied.

## Design references

- The listening room's point terrain was informed by the [Vizz](https://vizz.fm) "Mesh Grid Variant #5" preset. The renderer is an original implementation; no Vizz code or branding is included.
- Motion and handwriting pacing were studied from React Bits Waves and Magnet, Magic UI's Interactive Hover Button, Blur Fade and Scroll Progress, Jitter, TypeFlow, GetMyCursive and Calligrapher.ai. The mechanics were reimplemented; no code, template, font or media was copied.
