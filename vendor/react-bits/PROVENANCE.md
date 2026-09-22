# React Bits components

## ScrollExpand

Installed on 15 September 2026 from the user-requested `@react-bits/ScrollExpand-JS-CSS` registry item using shadcn CLI 4.21.0.

```sh
npx --yes shadcn@latest add @react-bits/ScrollExpand-JS-CSS --yes --cwd work/scroll-expand-install
```

The command succeeded and created `src/components/ScrollExpand.jsx` and `src/components/ScrollExpand.css` inside the temporary staging project. A preceding `--dry-run` confirmed two files and no dependency changes. The staging configuration provides component aliases only; Tailwind and unrelated UI dependencies were not installed. The portfolio's package files and configuration were not changed.

The CLI preserved the CSS exactly and reformatted three JSX opening/self-closing tags. The initial copies at `src/ScrollExpand.jsx` and `src/ScrollExpand.css` use the exact file-content strings from the saved registry item, before any portfolio-specific integration. `installation.json` records those original file hashes. The registry snapshot itself is kept locally rather than redistributed (see below); its whole-file SHA-256 is recorded in `installation.json`, so it can be checked against the registry URL.

- Component documentation: <https://reactbits.dev/animations/scroll-expand>
- Registry item: <https://reactbits.dev/r/ScrollExpand-JS-CSS.json>
- Upstream repository: <https://github.com/DavidHDev/react-bits>
- Licence retrieved from: <https://raw.githubusercontent.com/DavidHDev/react-bits/main/LICENSE.md>
- Included licence: `../../licences/react-bits-LICENSE.md`

The applicable upstream licence is MIT plus the Commons Clause condition. Its copyright and permission notice are retained. This component is included as part of Mun Wai Space; it is not offered as a standalone component product. The registry declares no dependencies or registry dependencies.

The registry snapshot is source provenance. It is not published on the site or in this repository, because the licence does not permit redistributing the components on their own; the registry URL and the recorded hashes keep it verifiable.

## ScrollReveal, MaskedHeading and VariableProximity

Installed on 15 September 2026 with the same shadcn CLI 4.21.0 staging configuration:

```sh
npx --yes shadcn@latest add @react-bits/ScrollReveal-JS-CSS @react-bits/MaskedHeading-JS-CSS @react-bits/VariableProximity-JS-CSS --yes --cwd work/scroll-expand-install
```

The command succeeded and created all six JSX/CSS files in the staging project's `src/components/` directory. The exact registry responses were saved locally and are not redistributed here; `timeline-components-installation.json` records their hashes:

- [ScrollReveal JS-CSS](https://reactbits.dev/r/ScrollReveal-JS-CSS.json): `ScrollReveal-JS-CSS.json`; declares `gsap@^3.13.0`.
- [MaskedHeading JS-CSS](https://reactbits.dev/r/MaskedHeading-JS-CSS.json): `MaskedHeading-JS-CSS.json`; declares `gsap@^3.13.0`.
- [VariableProximity JS-CSS](https://reactbits.dev/r/VariableProximity-JS-CSS.json): `VariableProximity-JS-CSS.json`; declares `motion@^12.23.12` and already imports `motion/react`.

All three declare no registry dependencies. GSAP 3.15.0 was added to the portfolio, satisfying both GSAP declarations. The existing Motion 12.43.0 installation satisfies VariableProximity; no duplicate animation package, Framer Motion import conversion, Tailwind installation or app configuration change was needed. GSAP uses its [Standard No Charge licence](https://gsap.com/community/standard-license/), identified by the installed package; the existing React Bits licence notice also applies to these components.

`timeline-components-installation.json` records the exact registry and staging-file hashes, dependency versions and successful command. Before portfolio integration, all six component files were copied to `src/` using the pristine registry content. Later source edits are local adaptations and can be compared with the registry items at the recorded hashes. The existing ScrollExpand source and its original installation record were not overwritten.

The pristine VariableProximity stylesheet includes an external Google Fonts import for Roboto Flex; that is part of the original source record, not an instruction to change the portfolio's fonts. The original ScrollReveal uses global ScrollTrigger cleanup, and MaskedHeading/VariableProximity contain continuous animation loops. Portfolio integration must scope cleanup to the component and preserve the site's local-font, visibility and reduced-motion behaviour. These integration changes are separate from the successful registry installation recorded here.
