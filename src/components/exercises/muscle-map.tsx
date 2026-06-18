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
      <ellipse cx="90" cy="20" rx="13" ry="15" fill="url(#bodyGrad)" stroke="rgba(232,58,58,0.1)" strokeWidth="0.4" />

      {/* Neck */}
      <M d="M81 33 Q84 30 90 30 Q96 30 99 33 L98 45 Q94 48 90 48 Q86 48 82 45 Z" muscle="neck" {...mp} />

      {/* Shoulders / Deltoids — wide, capped */}
      {/* L Delt */}
      <M d="M68 46 Q54 42 42 47 Q28 54 26 70 Q26 78 30 84 L41 82 Q45 70 53 62 Q61 54 70 52 Z" muscle="shoulders" {...mp} />
      {/* R Delt */}
      <M d="M112 46 Q126 42 138 47 Q152 54 154 70 Q154 78 150 84 L139 82 Q135 70 127 62 Q119 54 110 52 Z" muscle="shoulders" {...mp} />

      {/* Chest — broad, flatter pecs with separation */}
      {/* L Pec */}
      <M d="M70 51 L64 58 Q60 66 60 76 Q62 86 74 88 L86 86 Q88 82 88 74 L88 60 Q88 53 85 51 Z" muscle="chest" {...mp} />
      {/* R Pec */}
      <M d="M110 51 L116 58 Q120 66 120 76 Q118 86 106 88 L94 86 Q92 82 92 74 L92 60 Q92 53 95 51 Z" muscle="chest" {...mp} />

      {/* Biceps */}
      {/* L Bicep */}
      <M d="M30 86 Q24 94 23 108 Q23 120 27 128 L35 127 Q39 114 41 102 Q42 92 41 84 Z" muscle="biceps" {...mp} />
      {/* R Bicep */}
      <M d="M150 86 Q156 94 157 108 Q157 120 153 128 L145 127 Q141 114 139 102 Q138 92 139 84 Z" muscle="biceps" {...mp} />

      {/* Forearms */}
      {/* L Forearm */}
      <M d="M27 130 Q23 142 21 158 Q20 170 24 178 L32 177 Q34 164 36 152 Q38 140 36 132 Z" muscle="forearms" {...mp} />
      {/* R Forearm */}
      <M d="M153 130 Q157 142 159 158 Q160 170 156 178 L148 177 Q146 164 144 152 Q142 140 144 132 Z" muscle="forearms" {...mp} />

      {/* Abdominals — 6-pack shape */}
      <M d="M80 91 L88 88 L92 88 L100 91 L100 116 Q99 132 97 148 L95 160 Q93 166 90 166 Q87 166 85 160 L83 148 Q81 132 80 116 Z" muscle="abdominals" {...mp} />
      {/* Ab detail lines */}
      <line x1="90" y1="94" x2="90" y2="162" stroke={getStroke("abdominals")} strokeWidth="0.3" opacity="0.35" />
      <line x1="81" y1="110" x2="99" y2="110" stroke={getStroke("abdominals")} strokeWidth="0.2" opacity="0.25" />
      <line x1="81" y1="126" x2="99" y2="126" stroke={getStroke("abdominals")} strokeWidth="0.2" opacity="0.25" />
      <line x1="82" y1="140" x2="98" y2="140" stroke={getStroke("abdominals")} strokeWidth="0.2" opacity="0.25" />
      <line x1="83" y1="152" x2="97" y2="152" stroke={getStroke("abdominals")} strokeWidth="0.2" opacity="0.25" />

      {/* Obliques / side abs — subtle fill, taper to waist */}
      <M d="M66 95 L80 93 L80 140 Q78 150 75 158 L67 154 Q64 140 64 124 Q64 108 66 98 Z" muscle="abdominals" {...mp} />
      <M d="M114 95 L100 93 L100 140 Q102 150 105 158 L113 154 Q116 140 116 124 Q116 108 114 98 Z" muscle="abdominals" {...mp} />

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
      <ellipse cx="19" cy="181" rx="5" ry="8" fill="url(#bodyGrad)" stroke="rgba(232,58,58,0.06)" strokeWidth="0.3" />
      <ellipse cx="161" cy="181" rx="5" ry="8" fill="url(#bodyGrad)" stroke="rgba(232,58,58,0.06)" strokeWidth="0.3" />

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
      <ellipse cx="90" cy="20" rx="13" ry="15" fill="url(#bodyGrad)" stroke="rgba(232,58,58,0.1)" strokeWidth="0.4" />

      {/* Neck */}
      <M d="M81 33 Q84 30 90 30 Q96 30 99 33 L98 43 Q94 46 90 46 Q86 46 82 43 Z" muscle="neck" {...mp} />

      {/* Traps — large diamond shape */}
      <M d="M68 43 Q76 38 90 36 Q104 38 112 43 L118 58 Q113 66 106 70 L99 72 Q94 74 90 74 Q86 74 81 72 L74 70 Q67 66 62 58 Z" muscle="traps" {...mp} />

      {/* Rear Deltoids — wide capped */}
      <M d="M66 48 Q52 44 40 49 Q26 56 24 72 Q24 80 28 86 L39 84 Q43 72 51 64 Q59 56 68 54 Z" muscle="shoulders" {...mp} />
      <M d="M114 48 Q128 44 140 49 Q154 56 156 72 Q156 80 152 86 L141 84 Q137 72 129 64 Q121 56 112 54 Z" muscle="shoulders" {...mp} />

      {/* Triceps */}
      <M d="M28 88 Q22 96 21 110 Q21 122 25 130 L33 129 Q37 116 39 104 Q40 94 39 86 Z" muscle="triceps" {...mp} />
      <M d="M152 88 Q158 96 159 110 Q159 122 155 130 L147 129 Q143 116 141 104 Q140 94 141 86 Z" muscle="triceps" {...mp} />

      {/* Forearms (back) */}
      <M d="M25 132 Q21 144 19 160 Q18 172 22 180 L30 179 Q32 166 34 154 Q36 142 34 134 Z" muscle="forearms" {...mp} />
      <M d="M155 132 Q159 144 161 160 Q162 172 158 180 L150 179 Q148 166 146 154 Q144 142 146 134 Z" muscle="forearms" {...mp} />

      {/* Lats — wide V shape */}
      {/* L Lat */}
      <M d="M72 60 L66 64 Q54 70 49 84 Q46 98 50 112 Q56 122 68 124 L74 120 Q75 104 75 88 L74 70 Z" muscle="lats" {...mp} />
      {/* R Lat */}
      <M d="M108 60 L114 64 Q126 70 131 84 Q134 98 130 112 Q124 122 112 124 L106 120 Q105 104 105 88 L106 70 Z" muscle="lats" {...mp} />

      {/* Middle Back — rhomboids/mid traps */}
      <M d="M76 70 Q82 68 90 68 Q98 68 104 70 L105 88 Q103 102 101 110 L97 114 Q93 116 90 116 Q87 116 83 114 L79 110 Q77 102 75 88 Z" muscle="middle back" {...mp} />
      {/* Spine line */}
      <line x1="90" y1="38" x2="90" y2="168" stroke="rgba(232,58,58,0.12)" strokeWidth="0.4" strokeDasharray="2 1.5" />

      {/* Lower Back / Erector Spinae */}
      <M d="M78 116 Q83 114 90 114 Q97 114 102 116 L103 138 Q103 150 100 160 Q96 168 90 170 Q84 168 80 160 Q77 150 77 138 Z" muscle="lower back" {...mp} />

      {/* Glutes — large round */}
      {/* L Glute */}
      <M d="M58 168 Q63 164 73 166 L83 170 Q87 172 88 175 L88 188 Q86 198 80 202 Q72 206 64 202 Q56 196 54 186 Q54 177 56 171 Z" muscle="glutes" {...mp} />
      {/* R Glute */}
      <M d="M122 168 Q117 164 107 166 L97 170 Q93 172 92 175 L92 188 Q94 198 100 202 Q108 206 116 202 Q124 196 126 186 Q126 177 124 171 Z" muscle="glutes" {...mp} />

      {/* Hamstrings */}
      {/* L Ham */}
      <M d="M56 206 Q54 218 52 236 Q52 248 54 256 L62 258 Q64 248 64 236 Q64 222 66 210 L62 204 Z" muscle="hamstrings" {...mp} />
      <M d="M66 210 L74 206 Q76 218 76 234 Q76 246 74 256 L64 258 Q66 246 66 234 Q66 220 66 212 Z" muscle="hamstrings" {...mp} />
      {/* R Ham */}
      <M d="M124 206 Q126 218 128 236 Q128 248 126 256 L118 258 Q116 248 116 236 Q116 222 114 210 L118 204 Z" muscle="hamstrings" {...mp} />
      <M d="M114 210 L106 206 Q104 218 104 234 Q104 246 106 256 L116 258 Q114 246 114 234 Q114 220 114 212 Z" muscle="hamstrings" {...mp} />

      {/* Calves — diamond shaped */}
      {/* L Calf */}
      <M d="M54 264 Q50 274 48 288 Q48 298 52 306 L62 308 Q66 300 66 288 Q66 276 64 266 Z" muscle="calves" {...mp} />
      {/* R Calf */}
      <M d="M126 264 Q130 274 132 288 Q132 298 128 306 L118 308 Q114 300 114 288 Q114 276 116 266 Z" muscle="calves" {...mp} />

      {/* Hands */}
      <ellipse cx="16" cy="182" rx="5" ry="8" fill="url(#bodyGrad)" stroke="rgba(232,58,58,0.06)" strokeWidth="0.3" />
      <ellipse cx="164" cy="182" rx="5" ry="8" fill="url(#bodyGrad)" stroke="rgba(232,58,58,0.06)" strokeWidth="0.3" />

      {/* Feet */}
      <ellipse cx="58" cy="314" rx="8" ry="4" fill="url(#bodyGrad)" stroke="rgba(232,58,58,0.06)" strokeWidth="0.3" />
      <ellipse cx="122" cy="314" rx="8" ry="4" fill="url(#bodyGrad)" stroke="rgba(232,58,58,0.06)" strokeWidth="0.3" />
    </svg>
  );
}
