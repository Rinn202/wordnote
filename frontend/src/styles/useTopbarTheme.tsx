import {useEffect, useRef} from 'react';

// ─── 테마 정의 ────────────────────────────────────────────────────────────────

interface ThemeBlob {
    cx: number;
    cy: number;
    rx: number;
    ry: number;
    fill: string;
    op: number;
}

interface TopbarTheme {
    hours: number[];
    base: string;
    blobs: ThemeBlob[];
    extra?: string;
    stars?: [number, number][];
    logoCl: string;
    divBg: string;
    clkCl: string;
    dateCl: string;
    noticeBg: string;
    noticeBd: string;
    noticeIcon: string;
    noticeTxt: string;
    btnBd: string;
    btnCl: string;
    btnBg: string;
}

const THEMES: TopbarTheme[] = [
    /* ── 새벽 0–5시 ── */
    {
        hours: [0, 1, 2, 3, 4, 5],
        base: '#0D1B2E',
        blobs: [
            {cx: 100, cy: 20, rx: 140, ry: 50, fill: '#1E3A5F', op: .55},
            {cx: 400, cy: 55, rx: 200, ry: 42, fill: '#162840', op: .45},
            {cx: 580, cy: 10, rx: 130, ry: 48, fill: '#243050', op: .40},
            {cx: 240, cy: 5, rx: 90, ry: 35, fill: '#2A2050', op: .38},
            {cx: 480, cy: 62, rx: 120, ry: 36, fill: '#18243C', op: .35},
        ],
        stars: [[120, 12], [200, 8], [310, 18], [430, 6], [520, 14], [620, 9], [660, 20], [80, 22], [350, 4], [560, 22]],
        logoCl: '#8BACD8', divBg: '#4A6080',
        clkCl: '#A8C8E8', dateCl: '#5A7A9A',
        noticeBg: 'rgba(20,35,60,.65)', noticeBd: 'rgba(80,110,150,.5)',
        noticeIcon: '#5A7A9A', noticeTxt: '#4A6888',
        btnBd: 'rgba(80,110,150,.55)', btnCl: '#5A7A9A', btnBg: 'rgba(20,35,60,.5)',
    },
    /* ── 아침 6–9시 ── */
    /* ── 아침 6–9시 ── */
    {
        hours: [6, 7, 8, 9],
        base: '#3A7FC1',
        blobs: [
            {cx: 340, cy: -20, rx: 500, ry: 80, fill: '#1E3F7A', op: .60},
            {cx: 100, cy: 0, rx: 200, ry: 70, fill: '#2A5FA8', op: .50},
            {cx: 500, cy: 10, rx: 220, ry: 60, fill: '#2855A0', op: .45},
            {cx: 340, cy: 80, rx: 480, ry: 55, fill: '#78C8E8', op: .70},
            {cx: 200, cy: 70, rx: 250, ry: 40, fill: '#90D8E8', op: .55},
        ],
        extra: `
        <ellipse cx="500" cy="75" rx="230" ry="38" fill="#A8E4DC" opacity=".50" filter="url(#tbf2)"/>
        <ellipse cx="340" cy="90" rx="400" ry="40" fill="#C0EEE0" opacity=".45" filter="url(#tbf1)"/>
    `,
        logoCl: '#1A3A6A', divBg: '#4A80B8',
        clkCl: '#0E2448', dateCl: '#3060A0',
        noticeBg: 'rgba(220,238,255,.75)', noticeBd: 'rgba(80,130,200,.45)',
        noticeIcon: '#4A80C0', noticeTxt: '#2858A0',
        btnBd: 'rgba(80,130,200,.55)', btnCl: '#2858A0', btnBg: 'rgba(220,238,255,.6)',
    },
    /* ── 점심 10–16시 ── */
    {
        hours: [10, 11, 12, 13, 14, 15, 16],
        base: '#EAF8F4',
        blobs: [
            {cx: 90, cy: 16, rx: 140, ry: 52, fill: '#90D8C0', op: .42},
            {cx: 370, cy: 55, rx: 195, ry: 40, fill: '#A8E4D0', op: .36},
            {cx: 580, cy: 10, rx: 130, ry: 46, fill: '#78C8B0', op: .34},
            {cx: 220, cy: 4, rx: 85, ry: 33, fill: '#C0EEE0', op: .40},
            {cx: 470, cy: 62, rx: 112, ry: 36, fill: '#68C0A8', op: .30},
        ],
        extra: `
            <ellipse cx="60"  cy="12" rx="65"  ry="20" fill="#FFFFFF" opacity=".55" filter="url(#tbf2)"/>
            <ellipse cx="280" cy="9"  rx="50"  ry="17" fill="#FFFFFF" opacity=".45" filter="url(#tbf2)"/>
            <ellipse cx="500" cy="11" rx="58"  ry="18" fill="#FFFFFF" opacity=".42" filter="url(#tbf2)"/>
            <ellipse cx="340" cy="52" rx="160" ry="28" fill="#50B898" opacity=".14" filter="url(#tbf1)"/>
        `,
        logoCl: '#0E4838', divBg: '#5AA888',
        clkCl: '#082E22', dateCl: '#388068',
        noticeBg: 'rgba(220,248,240,.75)', noticeBd: 'rgba(80,170,140,.45)',
        noticeIcon: '#50A888', noticeTxt: '#287858',
        btnBd: 'rgba(80,170,140,.55)', btnCl: '#208060', btnBg: 'rgba(220,248,240,.6)',
    },
    /* ── 저녁 17–20시 ── */
    {
        hours: [17, 18, 19, 20],
        base: '#FFF8EC',
        blobs: [
            {cx: 80, cy: 18, rx: 145, ry: 52, fill: '#FFD898', op: .48},
            {cx: 350, cy: 54, rx: 195, ry: 42, fill: '#FFC880', op: .42},
            {cx: 575, cy: 10, rx: 130, ry: 48, fill: '#FFB870', op: .36},
            {cx: 210, cy: 4, rx: 88, ry: 34, fill: '#FFE0A8', op: .44},
            {cx: 465, cy: 62, rx: 115, ry: 36, fill: '#FFAA60', op: .30},
        ],
        extra: `
            <ellipse cx="30"  cy="32" rx="56"  ry="56"  fill="#FFCC60" opacity=".22" filter="url(#tbf1)"/>
            <ellipse cx="30"  cy="32" rx="32"  ry="32"  fill="#FFB840" opacity=".26" filter="url(#tbf2)"/>
            <ellipse cx="30"  cy="32" rx="14"  ry="14"  fill="#FFA020" opacity=".35"/>
            <ellipse cx="200" cy="56" rx="170" ry="28"  fill="#FF9050" opacity=".12" filter="url(#tbf1)"/>
            <ellipse cx="100" cy="10" rx="70"  ry="20"  fill="#FFE8B0" opacity=".45" filter="url(#tbf2)"/>
            <ellipse cx="400" cy="8"  rx="55"  ry="18"  fill="#FFE0A0" opacity=".38" filter="url(#tbf2)"/>
        `,
        logoCl: '#5A3010', divBg: '#D09050',
        clkCl: '#3C1E08', dateCl: '#906030',
        noticeBg: 'rgba(255,248,230,.75)', noticeBd: 'rgba(210,150,70,.45)',
        noticeIcon: '#C08840', noticeTxt: '#987030',
        btnBd: 'rgba(210,150,70,.55)', btnCl: '#A87028', btnBg: 'rgba(255,248,230,.6)',
    },
    /* ── 밤 21–23시 ── */
    {
        hours: [21, 22, 23],
        base: '#080D18',
        blobs: [
            {cx: 120, cy: 15, rx: 130, ry: 50, fill: '#2A1858', op: .55},
            {cx: 400, cy: 55, rx: 190, ry: 42, fill: '#180E38', op: .48},
            {cx: 570, cy: 10, rx: 120, ry: 46, fill: '#1E1448', op: .42},
            {cx: 240, cy: 4, rx: 80, ry: 32, fill: '#300E60', op: .38},
            {cx: 470, cy: 62, rx: 110, ry: 36, fill: '#120A30', op: .45},
        ],
        extra: `
            <circle cx="200" cy="16" r="14" fill="#FFF8D0" opacity=".45" filter="url(#tbf2)"/>
            <circle cx="200" cy="16" r="7"  fill="#FFFAEE" opacity=".65"/>
        `,
        stars: [[60, 8], [140, 18], [270, 5], [380, 12], [480, 7], [590, 16], [640, 5], [100, 26], [340, 22], [530, 24], [170, 10], [420, 18]],
        logoCl: '#C8B8E8', divBg: '#4A3878',
        clkCl: '#E0D0F8', dateCl: '#7060A8',
        noticeBg: 'rgba(12,8,30,.65)', noticeBd: 'rgba(80,60,140,.5)',
        noticeIcon: '#6050A8', noticeTxt: '#504088',
        btnBd: 'rgba(80,60,140,.55)', btnCl: '#6050A8', btnBg: 'rgba(12,8,30,.5)',
    },
];

// ─── 유틸 ──────────────────────────────────────────────────────────────────────

function getTheme(): TopbarTheme {
    const h = new Date().getHours();
    return THEMES.find(t => t.hours.includes(h)) ?? THEMES[4];
}

function buildBgSVG(t: TopbarTheme): string {
    const blobs = t.blobs.map(b =>
        `<ellipse cx="${b.cx}" cy="${b.cy}" rx="${b.rx}" ry="${b.ry}" fill="${b.fill}" opacity="${b.op}" filter="url(#tbf1)"/>`
    ).join('');

    const stars = (t.stars ?? []).map(([x, y]) => {
        const r = Math.random() > .5 ? 1.2 : .7;
        const op = (.28 + Math.random() * .45).toFixed(2);
        return `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFFFFF" opacity="${op}"/>`;
    }).join('');

    return `
<svg xmlns="http://www.w3.org/2000/svg"
     style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0"
     viewBox="0 0 680 64" preserveAspectRatio="xMidYMid slice">
  <defs>
    <filter id="tbf1"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="tbf2"><feGaussianBlur stdDeviation="8"/></filter>
  </defs>
  <rect width="680" height="64" fill="${t.base}"/>
  ${blobs}
  ${t.extra ?? ''}
  ${stars}
  <line x1="0" y1="22" x2="680" y2="22" stroke="${t.logoCl}" stroke-width=".35" opacity=".15"/>
  <line x1="0" y1="44" x2="680" y2="44" stroke="${t.logoCl}" stroke-width=".30" opacity=".10"/>
</svg>`.trim();
}

// ─── 훅 ───────────────────────────────────────────────────────────────────────

export function useTopbarTheme(ref: React.RefObject<HTMLElement | null>) {
    const bgRef = useRef<HTMLDivElement | null>(null);

    function apply() {

        const el = ref.current;
        if (!el) return;

        const t = getTheme();

        // SVG 배경 삽입 (최초 1회 생성, 이후 교체)
        if (!bgRef.current) {
            const div = document.createElement('div');
            div.style.cssText = 'position:absolute;inset:0;z-index:0;pointer-events:none';
            el.insertBefore(div, el.firstChild);
            bgRef.current = div;
        }
        bgRef.current.innerHTML = buildBgSVG(t);

        // topbar 자체 position
        el.style.position = 'relative';
        el.style.overflow = 'hidden';

        // 내부 직계 자식들 z-index (배경 위로)
        Array.from(el.children).forEach(child => {
            if (child !== bgRef.current) {
                (child as HTMLElement).style.position = 'relative';
            }
        });

        // 텍스트 / UI 색상
        el.querySelectorAll<HTMLElement>('.logo').forEach(e => {
            e.style.color = t.logoCl;
        });
        el.querySelectorAll<HTMLElement>('.topbar-divider').forEach(e => {
            e.style.background = t.divBg;
            e.style.opacity = '.5';
        });
        el.querySelectorAll<HTMLElement>('.topbar-clock').forEach(e => {
            e.style.color = t.clkCl;
        });
        el.querySelectorAll<HTMLElement>('.topbar-date').forEach(e => {
            e.style.color = t.dateCl;
        });
        el.querySelectorAll<HTMLElement>('.topbar-notice').forEach(e => {
            e.style.background = t.noticeBg;
            e.style.borderColor = t.noticeBd;
        });
        el.querySelectorAll<HTMLElement>('.topbar-notice i').forEach(e => {
            e.style.color = t.noticeIcon;
        });
        el.querySelectorAll<HTMLElement>('.topbar-notice span').forEach(e => {
            e.style.color = t.noticeTxt;
        });
        el.querySelectorAll<HTMLElement>('.icon-btn').forEach(e => {
            e.style.borderColor = t.btnBd;
            e.style.color = t.btnCl;
            e.style.background = t.btnBg;
        });
    }

    useEffect(() => {
        apply();

        // 매 정시마다 자동 전환
        function scheduleNext() {
            const now = new Date();
            const msToNextHour =
                (60 - now.getMinutes()) * 60_000
                - now.getSeconds() * 1_000
                - now.getMilliseconds();
            return setTimeout(() => {
                apply();
                timerRef.current = scheduleNext();
            }, msToNextHour);
        }

        const timerRef = {current: scheduleNext()};
        return () => clearTimeout(timerRef.current);
    }, []);   // eslint-disable-line react-hooks/exhaustive-deps
}