import type { SVGProps } from "react";

export function Icon({
  name,
  className,
  ...rest
}: { name: string; className?: string } & SVGProps<SVGSVGElement>) {
  return (
    <svg className={className ? `icon ${className}` : "icon"} aria-hidden="true" focusable="false" {...rest}>
      <use href={`#${name}`} />
    </svg>
  );
}

export function IconSprite() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="sprite" aria-hidden="true" focusable="false">
      <defs>
        <symbol id="i-donut" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3.4" /><path d="M6.4 8.4 7.8 7M16.4 6.6l1.3 1.3M17.7 15.2l1.2 1.2M7.2 17.4 6 18.6" /></symbol>
        <symbol id="i-coin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.6" /><circle cx="12" cy="12" r="3" /><path d="M8.2 5.9a7 7 0 0 1 3.8-1.2" strokeOpacity=".5" /></symbol>
        <symbol id="i-grid" viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="7" height="7" rx="2" /><rect x="13.5" y="3.5" width="7" height="7" rx="2" /><rect x="3.5" y="13.5" width="7" height="7" rx="2" /><rect x="13.5" y="13.5" width="7" height="7" rx="2" /></symbol>
        <symbol id="i-caret" viewBox="0 0 24 24"><path d="m7 10 5 5 5-5" /></symbol>
        <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M4 12h15M13 6l6 6-6 6" /></symbol>
        <symbol id="i-arrow-left" viewBox="0 0 24 24"><path d="M20 12H5M11 6l-6 6 6 6" /></symbol>
        <symbol id="i-gift" viewBox="0 0 24 24"><rect x="3.5" y="8.5" width="17" height="12" rx="2" /><path d="M3.5 13h17M12 8.5v12M12 8.5C10.5 5 8.6 3.8 7 4.4 5.5 5 5.7 7.4 7.4 8.5H12Zm0 0c1.5-3.5 3.4-4.7 5-4.1 1.5.6 1.3 3-.4 4.1H12Z" /></symbol>
        <symbol id="i-trophy" viewBox="0 0 24 24"><path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" /><path d="M7 6H4.5v2A3.5 3.5 0 0 0 8 11.5M17 6h2.5v2A3.5 3.5 0 0 1 16 11.5M12 14v4M8 21h8M9 18h6" /></symbol>
        <symbol id="i-chest" viewBox="0 0 24 24"><rect x="3.5" y="7.5" width="17" height="12" rx="2" /><path d="M3.5 12h17M12 7.5V5M10 7.5V5h4v2.5M10.5 12h3v3h-3z" /></symbol>
        <symbol id="i-discord" viewBox="0 0 24 24"><path fill="currentColor" stroke="none" d="M19.3 5.4A16.6 16.6 0 0 0 15.2 4l-.5 1a15 15 0 0 0-5.4 0L8.8 4a16.6 16.6 0 0 0-4.1 1.4C2.2 9.2 1.5 13 1.8 16.7a16.7 16.7 0 0 0 5 2.5l1-1.6a10.7 10.7 0 0 1-1.7-.8l.4-.3a11.9 11.9 0 0 0 10.9 0l.4.3a10.7 10.7 0 0 1-1.7.8l1 1.6a16.7 16.7 0 0 0 5-2.5c.4-4.3-.7-8-2.8-11.3ZM8.6 14.5c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.9.9 1.9 2-.9 2-1.9 2Zm6.8 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.9.9 1.9 2-.9 2-1.9 2Z" /></symbol>
        <symbol id="i-chat" viewBox="0 0 24 24"><path d="M20.5 11.5a8 8 0 0 1-11.7 7.1L4 20l1.4-4.6a8 8 0 1 1 15.1-3.9Z" /><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" strokeWidth="2.4" /></symbol>
        <symbol id="i-search" viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4 4" /></symbol>
        <symbol id="i-user" viewBox="0 0 24 24"><circle cx="12" cy="8.2" r="3.8" /><path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" /></symbol>
        <symbol id="i-user-plus" viewBox="0 0 24 24"><circle cx="9.5" cy="8.2" r="3.6" /><path d="M3.5 20a6 6 0 0 1 12 0M18.5 7.5v6M15.5 10.5h6" /></symbol>
        <symbol id="i-users" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.4" /><path d="M3 19.5a6 6 0 0 1 12 0M16 4.6a3.4 3.4 0 0 1 0 6.8M18.5 19.5a6 6 0 0 0-2.4-4.8" /></symbol>
        <symbol id="i-x" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18" /></symbol>
        <symbol id="i-menu" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16" /></symbol>
        <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></symbol>
        <symbol id="i-minus" viewBox="0 0 24 24"><path d="M5 12h14" /></symbol>
        <symbol id="i-play" viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5-11-6.5Z" /></symbol>
        <symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 3.5 19.5 6v6.2c0 4.6-3.2 7.3-7.5 8.3-4.3-1-7.5-3.7-7.5-8.3V6L12 3.5Z" /><path d="m8.8 11.8 2.2 2.2 4.2-4.4" /></symbol>
        <symbol id="i-bolt" viewBox="0 0 24 24"><path d="M13 3 5.5 13.5H11l-1 7.5 8-11H12l1-7Z" /></symbol>
        <symbol id="i-check" viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7" /></symbol>
        <symbol id="i-copy" viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M15 5.5A1.5 1.5 0 0 0 13.5 4h-8A1.5 1.5 0 0 0 4 5.5v8A1.5 1.5 0 0 0 5.5 15" /></symbol>
        <symbol id="i-logout" viewBox="0 0 24 24"><path d="M14 4.5H6.5A1.5 1.5 0 0 0 5 6v12a1.5 1.5 0 0 0 1.5 1.5H14M10 12h10M17 9l3 3-3 3" /></symbol>
        <symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></symbol>
        <symbol id="i-lock" viewBox="0 0 24 24"><rect x="4.5" y="10.5" width="15" height="10" rx="2" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></symbol>
        <symbol id="i-sparkle" viewBox="0 0 24 24"><path d="M12 3.5c.7 4.4 2.1 5.8 6.5 6.5-4.4.7-5.8 2.1-6.5 6.5-.7-4.4-2.1-5.8-6.5-6.5 4.4-.7 5.8-2.1 6.5-6.5ZM18.5 15.5c.3 2 .9 2.6 2.9 2.9-2 .3-2.6.9-2.9 2.9-.3-2-.9-2.6-2.9-2.9 2-.3 2.6-.9 2.9-2.9Z" /></symbol>
        <symbol id="i-case" viewBox="0 0 24 24"><path d="m3.8 7.5 8.2-4 8.2 4v9L12 20.5l-8.2-4v-9Z" /><path d="M3.8 7.5 12 11.6l8.2-4.1M12 11.6v8.9M8.7 5.6l8.3 4.1" /></symbol>
        <symbol id="i-flip" viewBox="0 0 24 24"><circle cx="9" cy="9" r="5.2" /><circle cx="15" cy="15" r="5.2" /><path d="M6 18.5a6.6 6.6 0 0 0 8-1.2M17.8 5.5a7.2 7.2 0 0 0-2.4-1" /></symbol>
        <symbol id="i-duel" viewBox="0 0 24 24"><path d="M4 4 20 20M20 4 4 20" /><path d="m7.5 7.5 2.8 2.8M16.5 7.5l-2.8 2.8M4.5 15.5 8 19M19.5 15.5 16 19" /></symbol>
        <symbol id="i-uno" viewBox="0 0 24 24"><rect x="6.5" y="3.5" width="12.5" height="16" rx="2.2" transform="rotate(8 12 12)" /><rect x="5" y="4.5" width="12.5" height="16" rx="2.2" transform="rotate(-8 12 12)" /><circle cx="11.4" cy="12.4" r="3" /></symbol>
        <symbol id="i-connect" viewBox="0 0 24 24"><circle cx="5.5" cy="6" r="1.6" /><circle cx="12" cy="6" r="1.6" /><circle cx="18.5" cy="6" r="1.6" /><circle cx="5.5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" fill="currentColor" /><circle cx="18.5" cy="12" r="1.6" /><circle cx="5.5" cy="18" r="1.6" fill="currentColor" /><circle cx="12" cy="18" r="1.6" fill="currentColor" /><circle cx="18.5" cy="18" r="1.6" /></symbol>
        <symbol id="i-battles" viewBox="0 0 24 24"><rect x="3" y="11" width="7.5" height="9" rx="1.5" /><rect x="13.5" y="11" width="7.5" height="9" rx="1.5" /><path d="M6.8 11V8.2M17.3 11V8.2M3 15h7.5M13.5 15H21M13 5l-2.5 4h3L11 13" /></symbol>
        <symbol id="i-mines" viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="3" /><path d="M9 3.5v17M15 3.5v17M3.5 9h17M3.5 15h17" /><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" /></symbol>
        <symbol id="i-bomb" viewBox="0 0 24 24"><circle cx="11" cy="14" r="6.2" /><path d="M15.8 8.6 18 6.4M17.2 4.5l2.3 2.3M19 2.8l.6 1.7 1.7.6-1.7.6-.6 1.7-.6-1.7-1.7-.6 1.7-.6.6-1.7Z" /></symbol>
        <symbol id="i-tower" viewBox="0 0 24 24"><path d="M5 20h14M6.5 20v-4h11v4M8 16v-4h8v4M9.5 12V8h5v4M11 8V4.5h2V8" /></symbol>
        <symbol id="i-lava" viewBox="0 0 24 24"><path d="M12.5 3.5c.4 3-1.4 4.2-2.7 5.8-1.2 1.5-1.8 2.7-.6 4.4.6-1.5 1.8-2.3 2.6-3.4 2.7 2.5 4.7 4.6 4.7 7.2a4.5 4.5 0 0 1-9 0c0-2.3 1-4.3 2.4-6.3.7 1 .9 2 .7 3.2 2.4-2.7 2.5-5.7 1.9-9.4Z" /><path d="M9.4 20.5c-1.8 0-3.2-1.2-3.2-3 0-1.3.6-2.5 1.4-3.7" /></symbol>
        <symbol id="i-draw" viewBox="0 0 24 24"><path d="m4 20 3.6-.8L19 7.8a2 2 0 0 0 0-2.8l-.8-.8a2 2 0 0 0-2.8 0L4 15.6 4 20Z" /><path d="m14.5 6.5 3 3M4 15.8l4.2 4.2M4 20c2.3-.3 4.5-1.3 6-2.8" /></symbol>
        <symbol id="i-rps" viewBox="0 0 24 24"><circle cx="6" cy="17" r="2.5" /><circle cx="18" cy="17" r="2.5" /><path d="M7.8 15.2 19 4M16.2 15.2 5 4M12 12l6 6M12 12 6 18" /></symbol>
        <symbol id="i-pickaxe" viewBox="0 0 24 24"><path d="M4 20 15 9" /><path d="M9.5 4.5C13 3 16.5 3.5 20 6c-2.5 1-4 2.5-5 5-1-2-2.5-3-5-3.5l-2 2C7 8 8 6 9.5 4.5Z" /><path d="M15 9.5 19.5 14" /></symbol>
        <symbol id="i-upgrade" viewBox="0 0 24 24"><path d="M12 20V5M6 11l6-6 6 6" /><path d="M5 20h14" strokeOpacity=".5" /></symbol>
        <symbol id="i-blackjack" viewBox="0 0 24 24"><rect x="6" y="3.5" width="11" height="15" rx="2" transform="rotate(8 11.5 11)" /><rect x="7" y="5" width="11" height="15" rx="2" transform="rotate(-8 12.5 12.5)" /><path d="M12.5 13.5 11 12c-.6-.7-1.7-1.4-1.4-2.5.2-.8 1.2-1.1 1.8-.5l.6.6.6-.6c.6-.6 1.6-.3 1.8.5.3 1.1-.8 1.8-1.4 2.5l-1.5 1.5Z" /></symbol>
        <symbol id="i-dice" viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="4" /><circle cx="8.5" cy="8.5" r="1.2" fill="currentColor" stroke="none" /><circle cx="15.5" cy="8.5" r="1.2" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" /><circle cx="8.5" cy="15.5" r="1.2" fill="currentColor" stroke="none" /><circle cx="15.5" cy="15.5" r="1.2" fill="currentColor" stroke="none" /></symbol>
        <symbol id="i-hilo" viewBox="0 0 24 24"><path d="M7 20V7M4 10l3-3 3 3M17 4v13M14 14l3 3 3-3" /><path d="M11 12h2" strokeOpacity=".5" /></symbol>
        <symbol id="i-limbo" viewBox="0 0 24 24"><path d="M13.5 3c3.5 1.5 5.5 4 5 8.5-.2 2-1.5 3.4-2.5 4.7-.6.8-1 1.6-1 2.8h-5c0-1.2-.4-2-1-2.8-1-1.3-2.3-2.7-2.5-4.7-.3-2.6.8-4.6 2.5-6" /><circle cx="13" cy="10.5" r="2" /><path d="M9 19h6M9.5 22h5M14.5 5.5 18 3" /></symbol>
        <symbol id="i-plinko" viewBox="0 0 24 24"><circle cx="12" cy="4.5" r="1.7" fill="currentColor" stroke="none" /><path d="M6 9h.01M9.3 9h.01M12.7 9h.01M16 9h.01M4.5 13.5h.01M8 13.5h.01M11.5 13.5h.01M15 13.5h.01M18.5 13.5h.01M6.5 18h.01M10 18h.01M13.5 18h.01M17 18h.01" strokeWidth="3" /><path d="M3 21h18" strokeOpacity=".5" /></symbol>
        <symbol id="i-crash" viewBox="0 0 24 24"><path d="M3.5 19h17" strokeOpacity=".5" /><path d="m3.5 16 5-5 3.5 3.5L20 6" /><path d="M15 6h5v5" /></symbol>
        <symbol id="i-wheel" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="2" /><path d="M12 3.5v6.5M12 14v6.5M3.5 12H10M14 12h6.5M6 6l4.5 4.5M13.5 13.5 18 18M18 6l-4.5 4.5M10.5 13.5 6 18" /></symbol>
        <symbol id="i-roulette" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.7" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" /><path d="M12 3.3v3.4M12 17.3v3.4M3.3 12h3.4M17.3 12h3.4" /></symbol>
        <symbol id="i-pig" viewBox="0 0 24 24"><path d="M4.5 11a7.5 7.5 0 0 1 15 0v4.5a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3V11Z" /><path d="M7 6.5 5 3.5M17 6.5l2-3M9.5 10.5h.01M14.5 10.5h.01" strokeWidth="2.2" /><ellipse cx="12" cy="14.5" rx="3.2" ry="2.4" /><path d="M10.8 14.5h.01M13.2 14.5h.01" /></symbol>
        <symbol id="i-stocks" viewBox="0 0 24 24"><path d="M4 20V4M4 20h16" strokeOpacity=".5" /><path d="M7 8v7M10 5v9M13 11v6M16 7v9M19 4v7" /><path d="M6.2 8h1.6M9.4 5h1.2M12.4 11h1.2M15.4 7h1.2M18.4 4h1.2" strokeOpacity=".4" /></symbol>
        <symbol id="i-slide" viewBox="0 0 24 24"><path d="M3.5 8.5 20.5 15M14 17.5a2.2 2.2 0 1 0 4.4 0 2.2 2.2 0 1 0-4.4 0Z" /><path d="M3.5 5v4M20.5 12v4" strokeOpacity=".5" /></symbol>
        <symbol id="i-keno" viewBox="0 0 24 24"><circle cx="7" cy="7" r="3.3" /><circle cx="17" cy="8" r="3.3" /><circle cx="10.5" cy="17" r="3.3" /><path d="M5.7 7h2.6M15.7 8h2.6M9.2 17h2.6" /></symbol>
        <symbol id="i-snake" viewBox="0 0 24 24"><path d="M4 6.5c4.5 0 4.5 4 9 4s4.5 4 4.5 4-1 3-4 3c-2.4 0-3.5-1.1-3.5-2.5" /><circle cx="19.4" cy="5.4" r="1.3" fill="currentColor" stroke="none" /><path d="M17.5 6.5 19.4 6M18.6 4.6l1-1.1M19.9 5.9l1.3.1" /></symbol>
        <symbol id="i-chicken" viewBox="0 0 24 24"><path d="M15.5 4.5a5.5 5.5 0 0 0-9.2 5.2L4 14l4.2-.7a5.5 5.5 0 0 0 7.3-8.8Z" /><path d="M13 11.5h.01" strokeWidth="2.4" /><path d="M12.3 12.5 14 15l-2 3 3.5 1.5" /><path d="M18.5 5.5 21 4M19.5 8H22" /></symbol>
        <symbol id="i-race" viewBox="0 0 24 24"><path d="M6 21V3.5M6 4h12l-2.5 4L18 12H6" /><path d="M10 8h4" strokeOpacity=".5" /></symbol>
        <symbol id="i-deposit" viewBox="0 0 24 24"><path d="M12 3.5v11M7.5 10l4.5 4.5L16.5 10M4.5 17.5v2h15v-2" /></symbol>
        <symbol id="i-withdraw" viewBox="0 0 24 24"><path d="M12 15.5v-11M7.5 9 12 4.5 16.5 9M4.5 17.5v2h15v-2" /></symbol>
        <symbol id="i-wallet" viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="13" rx="3" /><path d="M3 9.5h18M16.5 14.5h1.5" /><path d="M6 6V5a1.5 1.5 0 0 1 1.5-1.5H18" strokeOpacity=".5" /></symbol>
        <symbol id="i-history" viewBox="0 0 24 24"><path d="M4.5 8.5A8.5 8.5 0 1 1 3.5 13" /><path d="M3.5 5v4h4M12 8v4.5l3 1.8" /></symbol>
        <symbol id="i-trend" viewBox="0 0 24 24"><path d="m3.5 17 5.5-5.5 4 4L20.5 8" /><path d="M15 8h5.5v5.5" /></symbol>
        <symbol id="i-refresh" viewBox="0 0 24 24"><path d="M20 11a8 8 0 1 0-2.3 6M20 4.5V11h-6.5" /></symbol>
        <symbol id="i-eye" viewBox="0 0 24 24"><path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></symbol>
        <symbol id="i-settings" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.2-1.6l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2.7-1.6L13.5 2h-3l-.3 2.9A7 7 0 0 0 7.5 6.5l-2.3-1-2 3.4 2 1.5a7 7 0 0 0 0 3.2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2.7 1.6l.3 2.9h3l.3-2.9a7 7 0 0 0 2.7-1.6l2.3 1 2-3.4-2-1.5c.1-.5.2-1 .2-1.6Z" /></symbol>
      </defs>
    </svg>
  );
}
