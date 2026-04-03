"use client";

/**
 * Anatomical muscle map — realistic proportions inspired by anatomy charts.
 * Wide, muscular build with clearly defined muscle groups.
 */

interface MuscleMapProps {
  primaryMuscles: string[];
  secondaryMuscles: string[];
}

export function MuscleMap({ primaryMuscles, secondaryMuscles }: MuscleMapProps) {
  const primary = new Set(primaryMuscles.map((m) => m.toLowerCase()));
  const secondary = new Set(secondaryMuscles.map((m) => m.toLowerCase()));

  const getFill = (muscle: string) => {
    if (primary.has(muscle)) return "rgba(47, 217, 217, 0.75)";
    if (secondary.has(muscle)) return "rgba(47, 217, 217, 0.25)";
    return "rgba(255, 255, 255, 0.025)";
  };

  const getStroke = (muscle: string) => {
    if (primary.has(muscle)) return "rgba(47, 217, 217, 0.9)";
    if (secondary.has(muscle)) return "rgba(47, 217, 217, 0.4)";
    return "rgba(255, 255, 255, 0.06)";
  };

  const getGlow = (muscle: string) => {
    if (primary.has(muscle)) return "url(#cyberglow)";
    return "none";
  };

  const frontMuscles = [
    "chest", "abdominals", "quadriceps", "biceps", "shoulders",
    "forearms", "adductors", "neck",
  ];
  const backMuscles = [
    "lats", "lower back", "middle back", "traps", "hamstrings",
    "glutes", "triceps", "calves",
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
        <stop offset="0%" stopColor="rgba(232,58,58,0.06)" />
        <stop offset="100%" stopColor="rgba(232,58,58,0.02)" />
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
      strokeWidth="0.4"
      strokeLinejoin="round"
      filter={getGlow(muscle)}
    />
  );
}

function FrontView({ getFill, getStroke, getGlow }: ViewProps) {
  const mp = { getFill, getStroke, getGlow };
  return (
    <svg width="130" height="220" viewBox="0 0 180 320" fill="none">
      <Defs />

      {/* Head */}
      <ellipse cx="90" cy="18" rx="14" ry="17" fill="url(#bodyGrad)" stroke="rgba(232,58,58,0.1)" strokeWidth="0.4" />

      {/* Neck */}
      <M d="M80 34 Q82 32 90 31 Q98 32 100 34 L99 46 Q96 48 90 49 Q84 48 81 46 Z" muscle="neck" {...mp} />

      {/* Shoulders / Deltoids — wide, rounded */}
      {/* L Delt */}
      <M d="M68 48 Q58 44 48 46 Q36 50 32 60 Q30 66 32 72 L40 74 Q48 68 56 60 L64 52 Z" muscle="shoulders" {...mp} />
      {/* R Delt */}
      <M d="M112 48 Q122 44 132 46 Q144 50 148 60 Q150 66 148 72 L140 74 Q132 68 124 60 L116 52 Z" muscle="shoulders" {...mp} />

      {/* Chest — two pec shapes with separation */}
      {/* L Pec */}
      <M d="M68 52 Q66 56 64 62 L56 70 Q52 76 54 84 Q58 92 68 94 L86 90 Q88 86 88 78 L88 66 Q88 56 86 52 L78 50 Z" muscle="chest" {...mp} />
      {/* R Pec */}
      <M d="M112 52 Q114 56 116 62 L124 70 Q128 76 126 84 Q122 92 112 94 L94 90 Q92 86 92 78 L92 66 Q92 56 94 52 L102 50 Z" muscle="chest" {...mp} />

      {/* Biceps */}
      {/* L Bicep */}
      <M d="M36 76 Q32 82 28 96 Q26 108 28 116 L34 118 Q38 108 40 96 Q42 86 42 78 Z" muscle="biceps" {...mp} />
      {/* R Bicep */}
      <M d="M144 76 Q148 82 152 96 Q154 108 152 116 L146 118 Q142 108 140 96 Q138 86 138 78 Z" muscle="biceps" {...mp} />

      {/* Forearms */}
      {/* L Forearm */}
      <M d="M28 120 Q24 132 20 148 Q18 160 20 168 L28 170 Q30 158 32 146 Q34 134 34 122 Z" muscle="forearms" {...mp} />
      {/* R Forearm */}
      <M d="M152 120 Q156 132 160 148 Q162 160 160 168 L152 170 Q150 158 148 146 Q146 134 146 122 Z" muscle="forearms" {...mp} />

      {/* Abdominals — 6-pack shape */}
      <M d="M78 96 L88 92 L92 92 L102 96 L102 110 Q102 118 100 126 L100 152 Q100 160 98 166 Q96 172 90 174 Q84 172 82 166 L80 152 L80 126 Q78 118 78 110 Z" muscle="abdominals" {...mp} />
      {/* Ab detail lines */}
      <line x1="90" y1="96" x2="90" y2="170" stroke={getStroke("abdominals")} strokeWidth="0.3" opacity="0.35" />
      <line x1="79" y1="112" x2="101" y2="112" stroke={getStroke("abdominals")} strokeWidth="0.2" opacity="0.25" />
      <line x1="79" y1="128" x2="101" y2="128" stroke={getStroke("abdominals")} strokeWidth="0.2" opacity="0.25" />
      <line x1="80" y1="144" x2="100" y2="144" stroke={getStroke("abdominals")} strokeWidth="0.2" opacity="0.25" />
      <line x1="82" y1="160" x2="98" y2="160" stroke={getStroke("abdominals")} strokeWidth="0.2" opacity="0.25" />

      {/* Obliques / side abs — subtle fill */}
      <M d="M66 96 L78 96 L78 148 Q76 158 74 164 L64 162 Q62 148 62 134 Q62 118 64 104 Z" muscle="abdominals" {...mp} />
      <M d="M114 96 L102 96 L102 148 Q104 158 106 164 L116 162 Q118 148 118 134 Q118 118 116 104 Z" muscle="abdominals" {...mp} />

      {/* Adductors (inner thigh) */}
      <M d="M82 178 Q84 188 86 202 L88 218 L90 222 L92 218 L94 202 Q96 188 98 178 L90 174 Z" muscle="adductors" {...mp} />

      {/* Quadriceps — large thigh muscles */}
      {/* L Quad outer */}
      <M d="M66 168 Q62 178 58 200 Q56 216 56 230 L64 234 Q68 220 70 206 Q72 192 74 180 L74 170 Z" muscle="quadriceps" {...mp} />
      {/* L Quad inner */}
      <M d="M74 172 L82 176 Q80 192 78 210 Q76 224 74 234 L64 236 Q66 222 68 208 Q70 194 72 182 Z" muscle="quadriceps" {...mp} />
      {/* R Quad outer */}
      <M d="M114 168 Q118 178 122 200 Q124 216 124 230 L116 234 Q112 220 110 206 Q108 192 106 180 L106 170 Z" muscle="quadriceps" {...mp} />
      {/* R Quad inner */}
      <M d="M106 172 L98 176 Q100 192 102 210 Q104 224 106 234 L116 236 Q114 222 112 208 Q110 194 108 182 Z" muscle="quadriceps" {...mp} />

      {/* Abductors (outer thigh) */}
      <M d="M58 166 L66 168 L58 230 L52 226 Q50 210 52 194 Q54 178 56 170 Z" muscle="abductors" {...mp} />
      <M d="M122 166 L114 168 L122 230 L128 226 Q130 210 128 194 Q126 178 124 170 Z" muscle="abductors" {...mp} />

      {/* Calves (front — tibialis) */}
      <M d="M58 248 Q56 260 56 274 Q56 286 58 296 L66 298 Q68 288 68 276 Q68 264 66 252 Z" muscle="calves" {...mp} />
      <M d="M122 248 Q124 260 124 274 Q124 286 122 296 L114 298 Q112 288 112 276 Q112 264 114 252 Z" muscle="calves" {...mp} />

      {/* Knees (non-muscle structural) */}
      <ellipse cx="64" cy="242" rx="8" ry="5" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" />
      <ellipse cx="116" cy="242" rx="8" ry="5" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" />

      {/* Hands outline */}
      <ellipse cx="18" cy="176" rx="5" ry="8" fill="url(#bodyGrad)" stroke="rgba(232,58,58,0.06)" strokeWidth="0.3" />
      <ellipse cx="162" cy="176" rx="5" ry="8" fill="url(#bodyGrad)" stroke="rgba(232,58,58,0.06)" strokeWidth="0.3" />

      {/* Feet */}
      <ellipse cx="62" cy="308" rx="8" ry="4" fill="url(#bodyGrad)" stroke="rgba(232,58,58,0.06)" strokeWidth="0.3" />
      <ellipse cx="118" cy="308" rx="8" ry="4" fill="url(#bodyGrad)" stroke="rgba(232,58,58,0.06)" strokeWidth="0.3" />
    </svg>
  );
}

function BackView({ getFill, getStroke, getGlow }: ViewProps) {
  const mp = { getFill, getStroke, getGlow };
  return (
    <svg width="130" height="220" viewBox="0 0 180 320" fill="none">
      <Defs />

      {/* Head */}
      <ellipse cx="90" cy="18" rx="14" ry="17" fill="url(#bodyGrad)" stroke="rgba(232,58,58,0.1)" strokeWidth="0.4" />

      {/* Neck */}
      <M d="M80 34 Q82 32 90 31 Q98 32 100 34 L99 44 Q96 46 90 47 Q84 46 81 44 Z" muscle="neck" {...mp} />

      {/* Traps — large diamond shape */}
      <M d="M70 44 Q76 40 90 38 Q104 40 110 44 L116 56 Q112 64 106 68 L100 70 Q96 72 90 72 Q84 72 80 70 L74 68 Q68 64 64 56 Z" muscle="traps" {...mp} />

      {/* Rear Deltoids */}
      <M d="M64 50 Q54 46 44 48 Q34 52 30 62 Q28 68 30 74 L38 76 Q46 70 54 62 L62 54 Z" muscle="shoulders" {...mp} />
      <M d="M116 50 Q126 46 136 48 Q146 52 150 62 Q152 68 150 74 L142 76 Q134 70 126 62 L118 54 Z" muscle="shoulders" {...mp} />

      {/* Triceps */}
      <M d="M34 78 Q30 84 26 98 Q24 110 26 118 L32 120 Q36 110 38 98 Q40 88 40 80 Z" muscle="triceps" {...mp} />
      <M d="M146 78 Q150 84 154 98 Q156 110 154 118 L148 120 Q144 110 142 98 Q140 88 140 80 Z" muscle="triceps" {...mp} />

      {/* Forearms (back) */}
      <M d="M26 122 Q22 134 18 150 Q16 162 18 170 L26 172 Q28 160 30 148 Q32 136 32 124 Z" muscle="forearms" {...mp} />
      <M d="M154 122 Q158 134 162 150 Q164 162 162 170 L154 172 Q152 160 150 148 Q148 136 148 124 Z" muscle="forearms" {...mp} />

      {/* Lats — wide V shape */}
      {/* L Lat */}
      <M d="M62 62 Q58 66 54 74 Q50 84 50 96 Q52 108 56 116 L64 118 Q66 108 68 96 L70 80 L72 70 Z" muscle="lats" {...mp} />
      {/* R Lat */}
      <M d="M118 62 Q122 66 126 74 Q130 84 130 96 Q128 108 124 116 L116 118 Q114 108 112 96 L110 80 L108 70 Z" muscle="lats" {...mp} />

      {/* Middle Back — rhomboids/mid traps */}
      <M d="M76 68 Q82 66 90 66 Q98 66 104 68 L106 82 Q104 96 102 106 L98 110 Q94 112 90 112 Q86 112 82 110 L78 106 Q76 96 74 82 Z" muscle="middle back" {...mp} />
      {/* Spine line */}
      <line x1="90" y1="38" x2="90" y2="168" stroke="rgba(232,58,58,0.12)" strokeWidth="0.4" strokeDasharray="2 1.5" />

      {/* Lower Back / Erector Spinae */}
      <M d="M78 112 Q82 110 90 110 Q98 110 102 112 L104 136 Q104 148 102 158 Q98 166 90 168 Q82 166 78 158 Q76 148 76 136 Z" muscle="lower back" {...mp} />

      {/* Glutes — large round */}
      {/* L Glute */}
      <M d="M58 166 Q62 162 72 164 L82 168 Q86 170 88 172 L88 186 Q86 196 80 200 Q72 204 64 200 Q56 194 54 184 Q54 176 56 170 Z" muscle="glutes" {...mp} />
      {/* R Glute */}
      <M d="M122 166 Q118 162 108 164 L98 168 Q94 170 92 172 L92 186 Q94 196 100 200 Q108 204 116 200 Q124 194 126 184 Q126 176 124 170 Z" muscle="glutes" {...mp} />

      {/* Hamstrings */}
      {/* L Ham */}
      <M d="M56 204 Q54 216 52 234 Q52 246 54 254 L62 256 Q64 246 64 234 Q64 220 66 208 L62 202 Z" muscle="hamstrings" {...mp} />
      <M d="M66 208 L74 204 Q76 216 76 232 Q76 244 74 254 L64 256 Q66 244 66 232 Q66 218 66 210 Z" muscle="hamstrings" {...mp} />
      {/* R Ham */}
      <M d="M124 204 Q126 216 128 234 Q128 246 126 254 L118 256 Q116 246 116 234 Q116 220 114 208 L118 202 Z" muscle="hamstrings" {...mp} />
      <M d="M114 208 L106 204 Q104 216 104 232 Q104 244 106 254 L116 256 Q114 244 114 232 Q114 218 114 210 Z" muscle="hamstrings" {...mp} />

      {/* Calves — diamond shaped */}
      {/* L Calf */}
      <M d="M54 262 Q50 272 48 286 Q48 296 52 304 L62 306 Q66 298 66 286 Q66 274 64 264 Z" muscle="calves" {...mp} />
      {/* R Calf */}
      <M d="M126 262 Q130 272 132 286 Q132 296 128 304 L118 306 Q114 298 114 286 Q114 274 116 264 Z" muscle="calves" {...mp} />

      {/* Hands */}
      <ellipse cx="16" cy="178" rx="5" ry="8" fill="url(#bodyGrad)" stroke="rgba(232,58,58,0.06)" strokeWidth="0.3" />
      <ellipse cx="164" cy="178" rx="5" ry="8" fill="url(#bodyGrad)" stroke="rgba(232,58,58,0.06)" strokeWidth="0.3" />

      {/* Feet */}
      <ellipse cx="58" cy="314" rx="8" ry="4" fill="url(#bodyGrad)" stroke="rgba(232,58,58,0.06)" strokeWidth="0.3" />
      <ellipse cx="122" cy="314" rx="8" ry="4" fill="url(#bodyGrad)" stroke="rgba(232,58,58,0.06)" strokeWidth="0.3" />
    </svg>
  );
}
