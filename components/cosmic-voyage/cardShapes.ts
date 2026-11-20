// Irregular background shapes for each song's info card on the homepage.
// Paths live in a 0–100 viewBox and are stretched to the card with
// preserveAspectRatio="none", so keep edges roughly within 0–100 and leave
// the card's padding as a safe area for the content.
//
// Each song has two variants drawn for the box they get stretched into:
// - wide: md+ side card (landscape, ~3:2)
// - tall: phone card (portrait, ~1:2), narrow so the planet stays visible.
// Both variants keep the same idea per song so the card reads the same on
// any screen.

export type CardShapeVariant = 'wide' | 'tall';

const cardShapes: Record<string, Record<CardShapeVariant, string>> = {
  // Domed top like a sun coming over the horizon, with a wobbly base.
  tomorrow: {
    wide: 'M2 24 C10 5 32 0 50 0 C68 0 90 5 98 24 C100 44 97 66 99 86 C99 95 94 99 84 97 C66 94 50 99 32 96 C18 94 6 99 3 92 C0 74 3 50 2 24 Z',
    tall: 'M3 14 C12 3 32 0 50 0 C68 0 88 3 97 14 C99 40 96 70 98 92 C98 98 92 99 84 98 C60 96 40 100 16 98 C6 98 2 96 2 90 C1 66 4 40 3 14 Z',
  },
  // Torn-paper polygon — something ripped open.
  'the-real-reason': {
    wide: 'M3 8 L28 2 L46 6 L71 1 L97 5 L95 31 L99 54 L94 78 L97 96 L68 93 L44 99 L21 94 L2 97 L5 72 L1 47 L4 26 Z',
    tall: 'M4 3 L30 1 L55 4 L80 1 L97 3 L94 18 L99 34 L95 50 L99 66 L94 82 L97 97 L70 99 L45 96 L20 99 L3 97 L6 82 L1 66 L5 50 L1 34 L6 18 Z',
  },
  // A curved bite out of the top-right corner — the view from outside.
  'third-person': {
    wide: 'M5 5 C25 2 50 5 74 3 C76 14 84 21 98 21 C96 52 99 74 96 95 C70 98 40 94 14 98 C8 99 3 97 3 90 C1 66 4 40 1 18 C1 10 2 6 5 5 Z',
    tall: 'M5 3 C25 1 48 3 64 2 C66 9 78 13 98 13 C96 40 99 70 96 97 C70 99 40 96 14 99 C8 99 3 98 3 94 C1 66 4 40 1 12 C1 6 2 4 5 3 Z',
  },
  // Rippling wave edges — water. Wide: waves top/bottom; tall: down the sides.
  'salmon-and-potatoes': {
    wide: 'M2 12 Q14 2 26 9 T50 8 T74 9 T98 10 L96 36 Q100 50 95 64 L98 90 Q86 100 74 93 T50 94 T26 93 T3 92 L5 64 Q0 50 4 36 Z',
    tall: 'M10 2 L90 3 Q100 14 94 26 T94 50 T94 74 Q100 88 92 98 L10 97 Q0 86 6 74 T6 50 T6 26 Q0 12 10 2 Z',
  },
  // Shard tilting up to the right — rising.
  'the-ascension': {
    wide: 'M4 18 L40 8 L72 2 L98 0 L94 30 L97 62 L90 98 L56 94 L22 99 L0 92 L3 56 Z',
    tall: 'M6 10 L60 3 L97 0 L94 40 L98 72 L92 99 L40 96 L2 99 L4 60 Z',
  },
};

const fallbackShapes: Record<CardShapeVariant, string> = {
  wide: 'M5 8 C25 2 75 3 95 6 C99 30 97 70 96 94 C70 99 30 97 4 95 C1 70 2 30 5 8 Z',
  tall: 'M6 4 C30 1 70 2 94 3 C99 30 97 70 96 96 C70 99 30 98 4 97 C1 70 3 30 6 4 Z',
};

export function getCardShape(slug: string, variant: CardShapeVariant): string {
  return cardShapes[slug]?.[variant] ?? fallbackShapes[variant];
}
