"use client";

/**
 * Anatomical muscle map — anatomy-chart proportions and shapes.
 * Continuous body silhouette (head + torso + arms + legs) with realistic
 * muscle regions layered on top. Worked muscles use the cyber-red accent,
 * inactive muscles + the silhouette use cyber-cyan from the design system.
 */

interface MuscleMapProps {
  primaryMuscles: string[];
  secondaryMuscles: string[];
}

export function MuscleMap({ primaryMuscles, secondaryMuscles }: MuscleMapProps) {
  const primary = new Set(primaryMuscles.map((m) => m.toLowerCase()));
  const secondary = new Set(secondaryMuscles.map((m) => m.toLowerCase()));

  // Worked muscles use the design-system red accent; everything else uses the
  // primary cyan accent at low intensity (the theme has no blue token).
  const getFill = (muscle: string) => {
    if (primary.has(muscle)) return "rgba(232, 58, 58, 0.8)";
    if (secondary.has(muscle)) return "rgba(232, 58, 58, 0.4)";
    return "rgba(47, 217, 217, 0.18)";
  };

  const getStroke = (muscle: string) => {
    if (primary.has(muscle)) return "rgba(232, 58, 58, 1)";
    if (secondary.has(muscle)) return "rgba(232, 58, 58, 0.55)";
    return "rgba(47, 217, 217, 0.45)";
  };

  const getGlow = (muscle: string) => {
    if (primary.has(muscle)) return "url(#cyberglow)";
    return "none";
  };

  // Traps appear on both views (visible upper-trap slope from the front,
  // full diamond from the back) so it lights when "traps" is worked from
  // either side.
  const frontMuscles = [
    "chest", "abdominals", "quadriceps", "biceps", "shoulders",
    "forearms", "adductors", "abductors", "neck", "traps", "calves",
  ];
  const backMuscles = [
    "lats", "lower back", "middle back", "traps", "hamstrings",
    "glutes", "triceps", "calves", "shoulders", "forearms",
  ];

  const allMuscles = [...primaryMuscles, ...secondaryMuscles].map((m) =>
    m.toLowerCase()
  );
  const hasFront = allMuscles.some((m) => frontMuscles.includes(m));
  const hasBack = allMuscles.some((m) => backMuscles.includes(m));

  const props = { getFill, getStroke, getGlow };

  return (
    <div className="flex items-start justify-center gap-2">
      {(hasFront || !hasBack) && (
        <div className="flex flex-col items-center">
          <FrontView {...props} />
          <span className="text-[0.5rem] text-cyber-text-dim uppercase tracking-[0.2em] mt-1 font-mono">
            Front
          </span>
        </div>
      )}
      {hasBack && (
        <div className="flex flex-col items-center">
          <BackView {...props} />
          <span className="text-[0.5rem] text-cyber-text-dim uppercase tracking-[0.2em] mt-1 font-mono">
            Back
          </span>
        </div>
      )}
    </div>
  );
}

type ViewProps = {
  getFill: (muscle: string) => string;
  getStroke: (muscle: string) => string;
  getGlow: (muscle: string) => string;
};

function Defs() {
  return (
    <defs>
      <filter id="cyberglow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="1.2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="rgba(47,217,217,0.13)" />
        <stop offset="100%" stopColor="rgba(47,217,217,0.04)" />
      </linearGradient>
    </defs>
  );
}

function M({
  d,
  muscle,
  getFill,
  getStroke,
  getGlow,
}: {
  d: string;
  muscle: string;
} & ViewProps) {
  return (
    <path
      d={d}
      fill={getFill(muscle)}
      stroke={getStroke(muscle)}
      strokeWidth="0.45"
      strokeLinejoin="round"
      filter={getGlow(muscle)}
    />
  );
}

// Detail lines highlight together with their parent muscle.
function DetailLine({
  d,
  muscle,
  getStroke,
  opacity = 0.6,
}: {
  d: string;
  muscle: string;
  opacity?: number;
  getStroke: (muscle: string) => string;
}) {
  return (
    <path
      d={d}
      fill="none"
      stroke={getStroke(muscle)}
      strokeWidth="0.35"
      strokeLinecap="round"
      opacity={opacity}
    />
  );
}

function FrontView({ getFill, getStroke, getGlow }: ViewProps) {
  const mp = { getFill, getStroke, getGlow };
  return (
    <svg width="140" height="296" viewBox="0 0 180 380" fill="none">
      <Defs />

      {/* ===== SILHOUETTE (head+torso, arms, legs as overlapping pieces) ===== */}
      <g fill="url(#bodyGrad)" stroke="rgba(47,217,217,0.5)" strokeWidth="0.5" strokeLinejoin="round">
        {/* torso + head */}
        <path d="M 90 6 C 102 6 113 14 114 27 C 114 38 111 46 107 49 L 101 52 C 104 56 110 59 117 60 L 128 62 C 130 62 132 65 132 70 L 134 90 C 134 110 132 130 126 148 L 122 168 C 124 174 130 176 134 182 L 134 208 C 110 214 70 214 46 208 L 46 182 C 50 176 56 174 58 168 L 54 148 C 48 130 46 110 46 90 L 48 70 C 48 65 50 62 52 62 L 63 60 C 70 59 76 56 79 52 L 73 49 C 69 46 66 38 66 27 C 67 14 78 6 90 6 Z" />
        {/* right arm */}
        <path d="M 128 62 C 138 62 148 66 155 74 C 162 82 165 94 162 106 C 159 122 155 138 152 152 L 150 168 C 150 180 154 192 158 204 C 162 216 162 226 158 234 C 154 240 150 244 146 246 C 142 247 138 246 138 242 L 138 230 L 140 216 C 138 204 138 192 140 180 L 142 162 C 140 148 137 132 134 118 L 130 96 C 128 90 128 80 128 70 Z" />
        {/* left arm */}
        <path d="M 52 62 C 42 62 32 66 25 74 C 18 82 15 94 18 106 C 21 122 25 138 28 152 L 30 168 C 30 180 26 192 22 204 C 18 216 18 226 22 234 C 26 240 30 244 34 246 C 38 247 42 246 42 242 L 42 230 L 40 216 C 42 204 42 192 40 180 L 38 162 C 40 148 43 132 46 118 L 50 96 C 52 90 52 80 52 70 Z" />
        {/* right leg */}
        <path d="M 134 208 C 136 230 136 252 132 274 L 126 286 C 124 302 124 318 126 332 L 128 348 C 130 354 132 358 132 362 L 130 366 L 96 366 L 95 356 C 94 348 92 340 92 332 L 93 310 C 94 290 94 268 92 250 L 92 230 C 100 220 110 218 122 218 Z" />
        {/* left leg */}
        <path d="M 46 208 C 44 230 44 252 48 274 L 54 286 C 56 302 56 318 54 332 L 52 348 C 50 354 48 358 48 362 L 50 366 L 84 366 L 85 356 C 86 348 88 340 88 332 L 87 310 C 86 290 86 268 88 250 L 88 230 C 80 220 70 218 58 218 Z" />
      </g>

      {/* ===== MUSCLES ===== */}

      {/* Sternocleidomastoid */}
      <M d="M 82 50 L 86 60 C 88 61 90 61 90 61 C 90 61 92 61 94 60 L 98 50 C 95 53 92 54 90 54 C 88 54 85 53 82 50 Z" muscle="neck" {...mp} />

      {/* Upper Trapezius (front-visible slope) */}
      <M d="M 76 52 C 68 56 60 60 56 66 L 58 72 L 68 70 C 74 66 80 62 84 60 Z" muscle="traps" {...mp} />
      <M d="M 104 52 C 112 56 120 60 124 66 L 122 72 L 112 70 C 106 66 100 62 96 60 Z" muscle="traps" {...mp} />

      {/* Deltoids (3-head cap) */}
      <M d="M 56 60 C 44 62 34 70 28 80 C 23 90 21 100 24 110 C 30 114 38 114 44 110 C 50 102 54 92 58 84 L 60 72 Z" muscle="shoulders" {...mp} />
      <M d="M 124 60 C 136 62 146 70 152 80 C 157 90 159 100 156 110 C 150 114 142 114 136 110 C 130 102 126 92 122 84 L 120 72 Z" muscle="shoulders" {...mp} />

      {/* Pecs (clavicular + sternal heads, with shelf) */}
      <M d="M 87 60 L 66 64 C 60 68 56 76 58 86 C 60 96 64 106 72 110 L 87 112 L 88 92 L 88 70 Z" muscle="chest" {...mp} />
      <M d="M 93 60 L 114 64 C 120 68 124 76 122 86 C 120 96 116 106 108 110 L 93 112 L 92 92 L 92 70 Z" muscle="chest" {...mp} />

      {/* Serratus anterior (finger pattern under armpit, also lights with chest) */}
      <M d="M 56 100 L 58 108 L 62 106 L 64 114 L 68 112 L 68 122 L 60 122 L 56 116 Z" muscle="chest" {...mp} />
      <M d="M 124 100 L 122 108 L 118 106 L 116 114 L 112 112 L 112 122 L 120 122 L 124 116 Z" muscle="chest" {...mp} />

      {/* Rectus abdominis (6-pack) */}
      <M d="M 78 114 L 87 113 L 87 124 L 78 125 Z" muscle="abdominals" {...mp} />
      <M d="M 78 127 L 87 127 L 87 138 L 78 139 Z" muscle="abdominals" {...mp} />
      <M d="M 79 141 L 87 141 L 87 152 L 80 153 Z" muscle="abdominals" {...mp} />
      <M d="M 93 113 L 102 114 L 102 125 L 93 124 Z" muscle="abdominals" {...mp} />
      <M d="M 93 127 L 102 127 L 102 139 L 93 138 Z" muscle="abdominals" {...mp} />
      <M d="M 93 141 L 101 141 L 100 153 L 93 152 Z" muscle="abdominals" {...mp} />
      {/* Lower abs V-line */}
      <M d="M 80 155 L 90 156 L 100 155 L 96 170 L 90 174 L 84 170 Z" muscle="abdominals" {...mp} />

      {/* External obliques */}
      <M d="M 58 112 L 76 114 L 76 148 L 74 158 L 68 164 L 60 162 L 58 154 Z" muscle="abdominals" {...mp} />
      <M d="M 122 112 L 104 114 L 104 148 L 106 158 L 112 164 L 120 162 L 122 154 Z" muscle="abdominals" {...mp} />

      {/* Biceps */}
      <M d="M 28 110 C 24 120 22 134 24 148 C 26 158 30 164 36 164 C 40 158 42 144 42 130 C 42 122 40 116 38 112 L 32 110 Z" muscle="biceps" {...mp} />
      <M d="M 152 110 C 156 120 158 134 156 148 C 154 158 150 164 144 164 C 140 158 138 144 138 130 C 138 122 140 116 142 112 L 148 110 Z" muscle="biceps" {...mp} />

      {/* Forearms */}
      <M d="M 26 166 C 20 176 16 190 18 206 C 20 218 24 230 30 234 L 36 232 C 36 218 38 204 40 192 C 42 180 40 170 38 166 Z" muscle="forearms" {...mp} />
      <M d="M 154 166 C 160 176 164 190 162 206 C 160 218 156 230 150 234 L 144 232 C 144 218 142 204 140 192 C 138 180 140 170 142 166 Z" muscle="forearms" {...mp} />

      {/* Hands */}
      <path d="M 28 240 C 24 242 22 244 22 248 L 24 254 C 28 256 32 256 36 254 L 40 252 L 42 246 C 42 242 38 240 34 240 Z" fill="url(#bodyGrad)" stroke="rgba(47,217,217,0.4)" strokeWidth="0.4" />
      <path d="M 152 240 C 156 242 158 244 158 248 L 156 254 C 152 256 148 256 144 254 L 140 252 L 138 246 C 138 242 142 240 146 240 Z" fill="url(#bodyGrad)" stroke="rgba(47,217,217,0.4)" strokeWidth="0.4" />

      {/* Iliac crest / TFL band (abductors) */}
      <M d="M 50 210 L 60 212 L 60 230 L 52 230 Z" muscle="abductors" {...mp} />
      <M d="M 130 210 L 120 212 L 120 230 L 128 230 Z" muscle="abductors" {...mp} />

      {/* Adductors (inner thigh) */}
      <M d="M 84 212 L 90 222 L 96 212 L 94 240 C 92 256 91 270 90 280 C 89 270 88 256 86 240 Z" muscle="adductors" {...mp} />

      {/* Quadriceps L (vastus lateralis, rectus femoris, vastus medialis) */}
      <M d="M 52 218 C 48 232 46 254 50 274 L 58 282 C 62 270 66 254 68 240 L 70 222 Z" muscle="quadriceps" {...mp} />
      <M d="M 70 222 L 82 222 C 81 240 79 258 76 274 L 64 282 C 66 264 67 248 68 232 Z" muscle="quadriceps" {...mp} />
      <M d="M 82 222 L 86 232 C 86 248 82 266 78 280 L 70 282 L 66 284 C 70 268 76 248 80 232 Z" muscle="quadriceps" {...mp} />

      {/* Quadriceps R */}
      <M d="M 128 218 C 132 232 134 254 130 274 L 122 282 C 118 270 114 254 112 240 L 110 222 Z" muscle="quadriceps" {...mp} />
      <M d="M 110 222 L 98 222 C 99 240 101 258 104 274 L 116 282 C 114 264 113 248 112 232 Z" muscle="quadriceps" {...mp} />
      <M d="M 98 222 L 94 232 C 94 248 98 266 102 280 L 110 282 L 114 284 C 110 268 104 248 100 232 Z" muscle="quadriceps" {...mp} />

      {/* Knees */}
      <ellipse cx="60" cy="288" rx="8" ry="6" fill="rgba(47,217,217,0.13)" stroke="rgba(47,217,217,0.4)" strokeWidth="0.4" />
      <ellipse cx="120" cy="288" rx="8" ry="6" fill="rgba(47,217,217,0.13)" stroke="rgba(47,217,217,0.4)" strokeWidth="0.4" />

      {/* Calves (front view — tibialis anterior + gastrocnemius edges) */}
      {/* L */}
      <M d="M 52 294 C 48 308 47 326 50 340 L 56 342 L 60 326 L 64 308 Z" muscle="calves" {...mp} />
      <M d="M 64 296 L 70 296 L 72 320 L 70 338 L 64 340 L 62 320 Z" muscle="calves" {...mp} />
      <M d="M 72 296 L 78 296 L 78 316 L 76 332 L 72 336 L 70 320 Z" muscle="calves" {...mp} />
      {/* R */}
      <M d="M 128 294 C 132 308 133 326 130 340 L 124 342 L 120 326 L 116 308 Z" muscle="calves" {...mp} />
      <M d="M 116 296 L 110 296 L 108 320 L 110 338 L 116 340 L 118 320 Z" muscle="calves" {...mp} />
      <M d="M 108 296 L 102 296 L 102 316 L 104 332 L 108 336 L 110 320 Z" muscle="calves" {...mp} />

      {/* ===== DETAIL LINES (highlight with parent muscle) ===== */}
      {/* Sternum (chest) */}
      <DetailLine d="M 90 61 L 90 112" muscle="chest" getStroke={getStroke} opacity={0.5} />
      {/* Pec shelf */}
      <DetailLine d="M 68 102 C 76 108 82 110 88 112" muscle="chest" getStroke={getStroke} opacity={0.65} />
      <DetailLine d="M 112 102 C 104 108 98 110 92 112" muscle="chest" getStroke={getStroke} opacity={0.65} />
      {/* Linea alba */}
      <DetailLine d="M 90 114 L 90 170" muscle="abdominals" getStroke={getStroke} opacity={0.55} />
      {/* Ab cross lines */}
      <DetailLine d="M 78 126 L 102 126" muscle="abdominals" getStroke={getStroke} opacity={0.45} />
      <DetailLine d="M 78 140 L 102 140" muscle="abdominals" getStroke={getStroke} opacity={0.45} />
      <DetailLine d="M 80 153 L 100 153" muscle="abdominals" getStroke={getStroke} opacity={0.45} />
      {/* Deltoid head divisions */}
      <DetailLine d="M 34 80 C 40 90 44 100 44 110" muscle="shoulders" getStroke={getStroke} opacity={0.55} />
      <DetailLine d="M 146 80 C 140 90 136 100 136 110" muscle="shoulders" getStroke={getStroke} opacity={0.55} />
      {/* Sartorius diagonals */}
      <DetailLine d="M 50 218 L 86 274" muscle="quadriceps" getStroke={getStroke} opacity={0.4} />
      <DetailLine d="M 130 218 L 94 274" muscle="quadriceps" getStroke={getStroke} opacity={0.4} />

      {/* Feet */}
      <path d="M 50 366 L 50 358 L 58 354 L 80 354 L 84 360 L 82 366 Z" fill="url(#bodyGrad)" stroke="rgba(47,217,217,0.4)" strokeWidth="0.4" strokeLinejoin="round" />
      <path d="M 130 366 L 130 358 L 122 354 L 100 354 L 96 360 L 98 366 Z" fill="url(#bodyGrad)" stroke="rgba(47,217,217,0.4)" strokeWidth="0.4" strokeLinejoin="round" />
    </svg>
  );
}

function BackView({ getFill, getStroke, getGlow }: ViewProps) {
  const mp = { getFill, getStroke, getGlow };
  return (
    <svg width="140" height="296" viewBox="0 0 180 380" fill="none">
      <Defs />

      {/* ===== SILHOUETTE (same outline as front) ===== */}
      <g fill="url(#bodyGrad)" stroke="rgba(47,217,217,0.5)" strokeWidth="0.5" strokeLinejoin="round">
        <path d="M 90 6 C 102 6 113 14 114 27 C 114 38 111 46 107 49 L 101 52 C 104 56 110 59 117 60 L 128 62 C 130 62 132 65 132 70 L 134 90 C 134 110 132 130 126 148 L 122 168 C 124 174 130 176 134 182 L 134 208 C 110 214 70 214 46 208 L 46 182 C 50 176 56 174 58 168 L 54 148 C 48 130 46 110 46 90 L 48 70 C 48 65 50 62 52 62 L 63 60 C 70 59 76 56 79 52 L 73 49 C 69 46 66 38 66 27 C 67 14 78 6 90 6 Z" />
        <path d="M 128 62 C 138 62 148 66 155 74 C 162 82 165 94 162 106 C 159 122 155 138 152 152 L 150 168 C 150 180 154 192 158 204 C 162 216 162 226 158 234 C 154 240 150 244 146 246 C 142 247 138 246 138 242 L 138 230 L 140 216 C 138 204 138 192 140 180 L 142 162 C 140 148 137 132 134 118 L 130 96 C 128 90 128 80 128 70 Z" />
        <path d="M 52 62 C 42 62 32 66 25 74 C 18 82 15 94 18 106 C 21 122 25 138 28 152 L 30 168 C 30 180 26 192 22 204 C 18 216 18 226 22 234 C 26 240 30 244 34 246 C 38 247 42 246 42 242 L 42 230 L 40 216 C 42 204 42 192 40 180 L 38 162 C 40 148 43 132 46 118 L 50 96 C 52 90 52 80 52 70 Z" />
        <path d="M 134 208 C 136 230 136 252 132 274 L 126 286 C 124 302 124 318 126 332 L 128 348 C 130 354 132 358 132 362 L 130 366 L 96 366 L 95 356 C 94 348 92 340 92 332 L 93 310 C 94 290 94 268 92 250 L 92 230 C 100 220 110 218 122 218 Z" />
        <path d="M 46 208 C 44 230 44 252 48 274 L 54 286 C 56 302 56 318 54 332 L 52 348 C 50 354 48 358 48 362 L 50 366 L 84 366 L 85 356 C 86 348 88 340 88 332 L 87 310 C 86 290 86 268 88 250 L 88 230 C 80 220 70 218 58 218 Z" />
      </g>

      {/* ===== BACK MUSCLES ===== */}

      {/* Trapezius (diamond) */}
      <M d="M 80 48 L 60 64 L 56 76 L 70 80 C 78 76 84 72 88 70 L 90 110 L 92 70 C 96 72 102 76 110 80 L 124 76 L 120 64 L 100 48 C 96 50 94 51 90 51 C 86 51 84 50 80 48 Z" muscle="traps" {...mp} />

      {/* Rear Deltoids (3-head cap) */}
      <M d="M 56 62 C 44 64 34 70 28 80 C 23 90 21 102 24 112 C 30 116 38 116 44 112 C 50 104 54 94 58 86 L 60 74 Z" muscle="shoulders" {...mp} />
      <M d="M 124 62 C 136 64 146 70 152 80 C 157 90 159 102 156 112 C 150 116 142 116 136 112 C 130 104 126 94 122 86 L 120 74 Z" muscle="shoulders" {...mp} />

      {/* Infraspinatus + Teres major (oval bulges between scapulae) */}
      <M d="M 58 90 C 60 86 64 84 68 86 L 74 90 L 72 100 C 70 104 66 106 62 104 C 58 102 56 98 56 94 Z" muscle="middle back" {...mp} />
      <M d="M 122 90 C 120 86 116 84 112 86 L 106 90 L 108 100 C 110 104 114 106 118 104 C 122 102 124 98 124 94 Z" muscle="middle back" {...mp} />

      {/* Lats (teardrop, wide armpit to lumbar V) */}
      <M d="M 56 100 C 54 108 54 118 56 130 C 58 142 62 152 68 158 L 74 156 L 78 140 L 80 120 L 78 100 L 70 96 Z" muscle="lats" {...mp} />
      <M d="M 124 100 C 126 108 126 118 124 130 C 122 142 118 152 112 158 L 106 156 L 102 140 L 100 120 L 102 100 L 110 96 Z" muscle="lats" {...mp} />

      {/* Erector spinae (twin lower-back columns) */}
      <M d="M 82 130 L 88 128 L 88 160 L 86 168 L 80 170 L 78 160 L 78 140 Z" muscle="lower back" {...mp} />
      <M d="M 98 130 L 92 128 L 92 160 L 94 168 L 100 170 L 102 160 L 102 140 Z" muscle="lower back" {...mp} />

      {/* Triceps (lateral + long heads, both sides) */}
      <M d="M 28 108 C 22 120 20 138 24 154 L 30 158 C 32 144 32 130 34 116 Z" muscle="triceps" {...mp} />
      <M d="M 34 116 C 36 130 38 144 38 158 L 42 158 C 44 144 42 128 40 114 Z" muscle="triceps" {...mp} />
      <M d="M 152 108 C 158 120 160 138 156 154 L 150 158 C 148 144 148 130 146 116 Z" muscle="triceps" {...mp} />
      <M d="M 146 116 C 144 130 142 144 142 158 L 138 158 C 136 144 138 128 140 114 Z" muscle="triceps" {...mp} />

      {/* Forearms (back / extensor mass) */}
      <M d="M 26 164 C 20 174 16 188 18 204 C 20 216 24 228 30 232 L 36 230 C 36 216 38 202 40 190 C 42 178 40 168 38 164 Z" muscle="forearms" {...mp} />
      <M d="M 154 164 C 160 174 164 188 162 204 C 160 216 156 228 150 232 L 144 230 C 144 216 142 202 140 190 C 138 178 140 168 142 164 Z" muscle="forearms" {...mp} />

      {/* Hands */}
      <path d="M 28 240 C 24 242 22 244 22 248 L 24 254 C 28 256 32 256 36 254 L 40 252 L 42 246 C 42 242 38 240 34 240 Z" fill="url(#bodyGrad)" stroke="rgba(47,217,217,0.4)" strokeWidth="0.4" />
      <path d="M 152 240 C 156 242 158 244 158 248 L 156 254 C 152 256 148 256 144 254 L 140 252 L 138 246 C 138 242 142 240 146 240 Z" fill="url(#bodyGrad)" stroke="rgba(47,217,217,0.4)" strokeWidth="0.4" />

      {/* Glutes */}
      <M d="M 50 184 C 56 180 64 178 70 180 L 78 186 L 82 196 L 80 210 C 78 218 72 222 64 222 C 56 222 50 218 48 210 L 46 196 Z" muscle="glutes" {...mp} />
      <M d="M 130 184 C 124 180 116 178 110 180 L 102 186 L 98 196 L 100 210 C 102 218 108 222 116 222 C 124 222 130 218 132 210 L 134 196 Z" muscle="glutes" {...mp} />

      {/* Hamstrings — biceps femoris (lateral) + semitendinosus/semimembranosus (medial) */}
      <M d="M 54 228 C 50 244 48 264 50 280 L 58 286 C 62 270 64 254 66 240 L 68 230 Z" muscle="hamstrings" {...mp} />
      <M d="M 70 230 L 84 232 C 82 250 80 268 76 282 L 64 286 C 66 268 68 248 70 232 Z" muscle="hamstrings" {...mp} />
      <M d="M 126 228 C 130 244 132 264 130 280 L 122 286 C 118 270 116 254 114 240 L 112 230 Z" muscle="hamstrings" {...mp} />
      <M d="M 110 230 L 96 232 C 98 250 100 268 104 282 L 116 286 C 114 268 112 248 110 232 Z" muscle="hamstrings" {...mp} />

      {/* Knees (popliteal area) */}
      <ellipse cx="60" cy="290" rx="8" ry="5" fill="rgba(47,217,217,0.13)" stroke="rgba(47,217,217,0.4)" strokeWidth="0.4" />
      <ellipse cx="120" cy="290" rx="8" ry="5" fill="rgba(47,217,217,0.13)" stroke="rgba(47,217,217,0.4)" strokeWidth="0.4" />

      {/* Calves (gastrocnemius heart + soleus tails) */}
      <M d="M 54 298 C 50 310 49 320 52 330 L 58 332 L 62 318 L 64 304 Z" muscle="calves" {...mp} />
      <M d="M 65 300 L 76 302 L 76 320 L 72 332 L 64 332 L 64 318 Z" muscle="calves" {...mp} />
      <M d="M 58 334 L 72 334 L 70 348 L 60 348 Z" muscle="calves" {...mp} />
      <M d="M 126 298 C 130 310 131 320 128 330 L 122 332 L 118 318 L 116 304 Z" muscle="calves" {...mp} />
      <M d="M 115 300 L 104 302 L 104 320 L 108 332 L 116 332 L 116 318 Z" muscle="calves" {...mp} />
      <M d="M 122 334 L 108 334 L 110 348 L 120 348 Z" muscle="calves" {...mp} />

      {/* ===== DETAIL LINES ===== */}
      <DetailLine d="M 60 68 L 90 70" muscle="traps" getStroke={getStroke} opacity={0.45} />
      <DetailLine d="M 120 68 L 90 70" muscle="traps" getStroke={getStroke} opacity={0.45} />
      <DetailLine d="M 68 158 L 80 178" muscle="lats" getStroke={getStroke} opacity={0.4} />
      <DetailLine d="M 112 158 L 100 178" muscle="lats" getStroke={getStroke} opacity={0.4} />
      <DetailLine d="M 34 116 L 34 158" muscle="triceps" getStroke={getStroke} opacity={0.45} />
      <DetailLine d="M 146 116 L 146 158" muscle="triceps" getStroke={getStroke} opacity={0.45} />
      <DetailLine d="M 68 232 L 64 282" muscle="hamstrings" getStroke={getStroke} opacity={0.4} />
      <DetailLine d="M 112 232 L 116 282" muscle="hamstrings" getStroke={getStroke} opacity={0.4} />

      {/* Spine line */}
      <path d="M 90 70 L 90 180" fill="none" stroke="rgba(47,217,217,0.3)" strokeWidth="0.5" strokeDasharray="2 1.5" />

      {/* Feet */}
      <path d="M 50 366 L 50 358 L 60 354 L 78 354 L 82 360 L 80 366 Z" fill="url(#bodyGrad)" stroke="rgba(47,217,217,0.4)" strokeWidth="0.4" strokeLinejoin="round" />
      <path d="M 130 366 L 130 358 L 120 354 L 102 354 L 98 360 L 100 366 Z" fill="url(#bodyGrad)" stroke="rgba(47,217,217,0.4)" strokeWidth="0.4" strokeLinejoin="round" />
    </svg>
  );
}
