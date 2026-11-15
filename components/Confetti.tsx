const COLOURS = ["#ffd23f", "#ff4f9a", "#3bceac", "#5b8cff", "#ff8c42"];
const PIECES = 28;

// Spread the pieces out without Math.random, so each burst looks the same and
// rendering stays pure.
const pieces = Array.from({ length: PIECES }, (_, index) => ({
  left: (index * 37) % 100,
  delay: (index % 7) * 40,
  drift: ((index * 53) % 120) - 60,
  spin: 180 + ((index * 71) % 360),
  colour: COLOURS[index % COLOURS.length],
  round: index % 3 === 0,
}));

/** A short CSS-only burst. Hidden entirely when the player prefers reduced motion. */
export function Confetti() {
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((piece, index) => (
        <span
          key={index}
          className="confetti__piece"
          data-round={piece.round || undefined}
          style={
            {
              left: `${piece.left}%`,
              background: piece.colour,
              animationDelay: `${piece.delay}ms`,
              "--drift": `${piece.drift}px`,
              "--spin": `${piece.spin}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
