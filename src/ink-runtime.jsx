import assembly from "./ink-assembly.json";
import manrope from "./ink-manrope.json";
export { writingTimeline } from "./ink-timing";
export { assembly, manrope };

export function PenGlyph({ letter, font, family, maskId }) {
  if (!letter.glyph || !letter.strokes.length) return null;
  const { advance } = letter.glyph;
  const height = font.ascent + Math.abs(font.descent);
  return (
    <svg
      className="ink-glyph"
      viewBox={`0 0 ${advance} ${height}`}
      style={{
        width: `${advance / font.unitsPerEm}em`,
        height: `${height / font.unitsPerEm}em`,
      }}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          x="-150"
          y="-150"
          width={advance + 300}
          height={height + 300}
          style={{ maskType: "alpha" }}
        >
          {letter.strokes.map((stroke, index) => (
            <path
              key={index}
              className="ink-stroke"
              d={stroke.d}
              fill="none"
              stroke="white"
              strokeWidth={stroke.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength="1"
              style={{
                "--stroke-delay": `${stroke.delay}ms`,
                "--stroke-duration": `${stroke.duration}ms`,
              }}
            />
          ))}
        </mask>
      </defs>
      <text
        x="0"
        y={font.ascent}
        fontFamily={family}
        fontSize={font.unitsPerEm}
        fill="currentColor"
        mask={`url(#${maskId})`}
      >
        {letter.character}
      </text>
    </svg>
  );
}
