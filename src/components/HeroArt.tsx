export function HeroArt() {
  return (
    <svg viewBox="0 0 560 440" role="presentation" aria-hidden="true">
      <defs>
        <radialGradient id="heroGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2fbf71" stopOpacity=".45" />
          <stop offset="60%" stopColor="#2fbf71" stopOpacity=".08" />
          <stop offset="100%" stopColor="#2fbf71" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="glaze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe190" />
          <stop offset="45%" stopColor="#f5c542" />
          <stop offset="100%" stopColor="#d98a13" />
        </linearGradient>
        <radialGradient id="dough" cx="40%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#d8a264" />
          <stop offset="100%" stopColor="#9c5f2c" />
        </radialGradient>
        <linearGradient id="coinFace" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffe79a" />
          <stop offset="50%" stopColor="#f5c542" />
          <stop offset="100%" stopColor="#c98a13" />
        </linearGradient>
        <mask id="holeMask">
          <rect width="560" height="440" fill="#fff" />
          <circle cx="300" cy="228" r="47" fill="#000" />
        </mask>
      </defs>

      <circle cx="300" cy="220" r="210" fill="url(#heroGlow)" />
      <ellipse cx="300" cy="392" rx="190" ry="26" fill="#000" opacity=".35" />
      <ellipse cx="300" cy="226" rx="235" ry="120" fill="none" stroke="#2fbf71" strokeOpacity=".16" strokeDasharray="3 9" transform="rotate(-16 300 226)" />

      <g className="hero-stars" fill="#f5c542">
        <rect x="92" y="96" width="6" height="6" rx="1" opacity=".7" />
        <rect x="452" y="74" width="8" height="8" rx="1" opacity=".5" />
        <rect x="500" y="212" width="5" height="5" rx="1" opacity=".8" />
        <rect x="70" y="268" width="5" height="5" rx="1" opacity=".5" />
        <rect x="410" y="344" width="6" height="6" rx="1" opacity=".6" />
      </g>

      <g className="hero-coin hero-coin--a">
        <circle cx="116" cy="150" r="30" fill="url(#coinFace)" stroke="#a86d0c" strokeWidth="3" />
        <circle cx="116" cy="150" r="9" fill="#10140f" fillOpacity=".55" />
        <path d="M96 138a26 26 0 0 1 15-9" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="3" strokeLinecap="round" />
      </g>
      <g className="hero-coin hero-coin--b">
        <circle cx="462" cy="318" r="23" fill="url(#coinFace)" stroke="#a86d0c" strokeWidth="3" />
        <circle cx="462" cy="318" r="7" fill="#10140f" fillOpacity=".55" />
      </g>
      <g className="hero-coin hero-coin--c">
        <circle cx="443" cy="122" r="16" fill="url(#coinFace)" stroke="#a86d0c" strokeWidth="2.5" />
        <circle cx="443" cy="122" r="5" fill="#10140f" fillOpacity=".55" />
      </g>

      <g className="hero-donut">
        <circle cx="300" cy="228" r="128" fill="url(#dough)" stroke="#7a4519" strokeWidth="5" />
        <g mask="url(#holeMask)">
          <circle cx="300" cy="228" r="112" fill="url(#glaze)" />
          <circle cx="300" cy="222" r="112" fill="url(#glaze)" opacity=".55" />
          <circle cx="284" cy="158" r="97" fill="#fff" opacity=".12" />
          <g fill="url(#glaze)" stroke="#c98413" strokeWidth="2">
            <circle cx="218" cy="310" r="15" />
            <circle cx="252" cy="330" r="13" />
            <circle cx="300" cy="338" r="16" />
            <circle cx="348" cy="328" r="13" />
            <circle cx="380" cy="306" r="15" />
            <circle cx="196" cy="282" r="12" />
            <circle cx="404" cy="276" r="12" />
          </g>
        </g>
        <circle cx="300" cy="228" r="127" fill="none" stroke="#ffdd8a" strokeOpacity=".25" strokeWidth="2" />
        <g strokeLinecap="round" strokeWidth="7">
          <rect x="286" y="146" width="24" height="8" rx="4" fill="#2fbf71" transform="rotate(24 298 150)" />
          <rect x="344" y="166" width="24" height="8" rx="4" fill="#f472b6" transform="rotate(-34 356 170)" />
          <rect x="382" y="218" width="24" height="8" rx="4" fill="#e9f1ea" transform="rotate(62 394 222)" />
          <rect x="348" y="282" width="24" height="8" rx="4" fill="#60a5fa" transform="rotate(-16 360 286)" />
          <rect x="296" y="300" width="24" height="8" rx="4" fill="#f472b6" transform="rotate(18 308 304)" />
          <rect x="238" y="292" width="24" height="8" rx="4" fill="#e9f1ea" transform="rotate(-56 250 296)" />
          <rect x="204" y="240" width="24" height="8" rx="4" fill="#60a5fa" transform="rotate(42 216 244)" />
          <rect x="214" y="178" width="24" height="8" rx="4" fill="#f5c542" stroke="#c98413" strokeWidth="1" transform="rotate(-28 226 182)" />
          <rect x="268" y="168" width="24" height="8" rx="4" fill="#2fbf71" transform="rotate(72 280 172)" />
        </g>
        <path d="M226 190a92 92 0 0 1 54-42" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="9" strokeLinecap="round" />
      </g>

      <g className="hero-chip">
        <rect x="356" y="46" width="150" height="46" rx="12" fill="#121714" stroke="#2fbf71" strokeOpacity=".5" />
        <circle cx="380" cy="69" r="10" fill="url(#coinFace)" />
        <circle cx="380" cy="69" r="3" fill="#10140f" fillOpacity=".5" />
        <text x="398" y="66" fill="#8fa198" fontFamily="var(--font)" fontSize="10" letterSpacing="1.2">
          TOTAL WON
        </text>
        <text x="398" y="82" fill="#eef4ef" fontFamily="var(--font)" fontSize="15" fontWeight="700">
          12,480.00
        </text>
      </g>
      <g className="hero-chip hero-chip--b">
        <rect x="56" y="330" width="132" height="46" rx="12" fill="#121714" stroke="#f5c542" strokeOpacity=".45" />
        <text x="74" y="349" fill="#8fa198" fontFamily="var(--font)" fontSize="10" letterSpacing="1.2">
          MULTIPLIER
        </text>
        <text x="74" y="366" fill="#f5c542" fontFamily="var(--font)" fontSize="18" fontWeight="700">
          x 7.42
        </text>
      </g>
    </svg>
  );
}
