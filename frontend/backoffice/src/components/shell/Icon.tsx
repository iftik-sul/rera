/**
 * Renders a Figma icon file (public/icons/*.svg) as a mask, so the icon takes
 * the colour of the surrounding text. That lets one file serve both the grey
 * inactive nav item and the white active one, without editing the SVGs.
 * `name` is the file name in public/icons without ".svg".
 */
export function Icon({ name, size = 16, className = "" }: { name: string; size?: number; className?: string }) {
  const url = `url(/icons/${name}.svg)`;
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 bg-current ${className}`}
      style={{
        width: size,
        height: size,
        maskImage: url,
        WebkitMaskImage: url,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
      }}
    />
  );
}
