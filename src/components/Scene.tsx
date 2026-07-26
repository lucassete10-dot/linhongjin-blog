import { useId } from 'react'
import type { Motif, Palette } from '@/data/posts'

/* 手绘风插画：全部用 SVG 现场绘制，不依赖任何图片素材。
   对齐 Wandor 原画的三个要点：
   1) 密度 —— 远山、双层丘陵、多种树、草茬、蕨叶、斑点层层叠加；
   2) 笔触 —— 色块内部有线稿：山的等高线、树的枝脉、坡上的短划、
      建筑的砖缝，深色块上用米色线，浅色块上用墨色线；
   3) 质感 —— rough 位移滤镜揉皱边缘 + grain 高频噪点 + 全局纸纹。 */

const INK = '#3a372c'
const BONE = '#f2e8d2'

function Defs({ uid, seed }: { uid: string; seed: number }) {
  return (
    <defs>
      <filter id={`grain-${uid}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} />
        <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.10 0" />
        <feComposite operator="over" in2="SourceGraphic" />
      </filter>
      <filter id={`rough-${uid}`} x="-8%" y="-8%" width="116%" height="116%">
        <feTurbulence type="fractalNoise" baseFrequency="0.016 0.028" numOctaves="3" seed={seed} result="t" />
        <feDisplacementMap in="SourceGraphic" in2="t" scale="7" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id={`rough-soft-${uid}`} x="-8%" y="-8%" width="116%" height="116%">
        <feTurbulence type="fractalNoise" baseFrequency="0.02 0.04" numOctaves="2" seed={seed + 7} result="t" />
        <feDisplacementMap in="SourceGraphic" in2="t" scale="3.5" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
  )
}

/* ---------- 基础笔触部件 ---------- */

function Sparkle({ x, y, s = 1, color = INK }: { x: number; y: number; s?: number; color?: string }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} stroke={color} strokeWidth={2.2} strokeLinecap="round">
      <line x1={0} y1={-7} x2={0} y2={7} />
      <line x1={-6} y1={-4} x2={6} y2={4} />
      <line x1={-6} y1={4} x2={6} y2={-4} />
    </g>
  )
}

/** 原画里树顶的「!!」惊叹短划 */
function DashMark({ x, y, s = 1, color = INK }: { x: number; y: number; s?: number; color?: string }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} stroke={color} strokeWidth={2.6} strokeLinecap="round" fill="none">
      <path d="M-5 -10 C-4 -7 -3 -4 -2 -1" />
      <path d="M4 -12 C5 -9 6 -6 7 -3" />
    </g>
  )
}

function Cloud({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <path
        d="M-46 12 C-58 12 -62 -2 -50 -6 C-50 -20 -30 -26 -20 -16 C-14 -28 8 -28 14 -16 C30 -22 44 -8 36 4 C44 12 34 16 24 14 Z"
        fill="#f7f1e3"
        stroke="#c4b394"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
    </g>
  )
}

/** 圆冠树：树冠 + 树干 + 枝脉线稿（原画树的标志画法） */
function RoundTree({ x, y, s = 1, fill = '#6f7d51', vein = '#3d4a37' }: { x: number; y: number; s?: number; fill?: string; vein?: string }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <path
        d="M0 -36 C20 -36 32 -22 32 -4 C32 12 20 24 0 24 C-20 24 -32 12 -32 -4 C-32 -22 -20 -36 0 -36 Z"
        fill={fill}
      />
      <line x1={0} y1={24} x2={0} y2={40} stroke={vein} strokeWidth={3.4} strokeLinecap="round" />
      <path
        d="M0 20 L0 -24 M0 -8 L-13 -18 M0 -14 L12 -24 M0 4 L-14 -4 M0 0 L13 -8"
        stroke={vein}
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
      />
    </g>
  )
}

/** 细高树：窄椭圆冠，配枝脉 */
function SlimTree({ x, y, s = 1, fill = '#c98a5e', vein = '#8a4a2e' }: { x: number; y: number; s?: number; fill?: string; vein?: string }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <ellipse cx={0} cy={-22} rx={13} ry={26} fill={fill} />
      <line x1={0} y1={2} x2={0} y2={22} stroke={vein} strokeWidth={3} strokeLinecap="round" />
      <path d="M0 0 L0 -38 M0 -14 L-8 -22 M0 -22 L8 -30" stroke={vein} strokeWidth={1.8} strokeLinecap="round" fill="none" />
    </g>
  )
}

/** 角落的蕨叶（前景植物） */
function Frond({ x, y, s = 1, rot = 0, fill = '#4c5c44', vein = BONE }: { x: number; y: number; s?: number; rot?: number; fill?: string; vein?: string }) {
  return (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
      <path d="M0 0 C11 -15 13 -36 4 -55 C-7 -38 -9 -15 0 0 Z" fill={fill} />
      <path d="M1 -6 C2 -22 3 -36 3 -48" stroke={vein} strokeWidth={1.6} fill="none" />
      <path d="M2 -16 L-5 -22 M2 -27 L9 -33 M3 -37 L-4 -42" stroke={vein} strokeWidth={1.6} strokeLinecap="round" fill="none" />
    </g>
  )
}

function Bush({ x, y, s = 1, dark = false }: { x: number; y: number; s?: number; dark?: boolean }) {
  const a = dark ? '#4c5c44' : '#6f7d51'
  const b = dark ? '#3d4a37' : '#5d6a45'
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <ellipse cx={-14} cy={3} rx={14} ry={11} fill={a} />
      <ellipse cx={6} cy={-3} rx={17} ry={14} fill={b} />
      <ellipse cx={22} cy={5} rx={11} ry={9} fill={a} />
      <path d="M-16 -2 L-12 -8 M6 -10 L10 -16 M20 0 L24 -5" stroke={dark ? BONE : '#3d4a37'} strokeWidth={1.5} strokeLinecap="round" opacity={0.75} />
    </g>
  )
}

/** 远山：带等高线的山脊 */
function Mountain({ x, y, s = 1, fill = '#5d6a45', ridge = BONE }: { x: number; y: number; s?: number; fill?: string; ridge?: string }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <path d="M-70 0 C-50 -24 -32 -56 -6 -74 C10 -60 18 -46 26 -32 C42 -44 54 -28 68 0 Z" fill={fill} />
      <path
        d="M-6 -70 C-2 -56 -3 -42 -9 -26 M-6 -70 C-15 -52 -24 -38 -36 -24 M26 -30 C30 -22 33 -13 35 -4"
        stroke={ridge}
        strokeWidth={1.8}
        strokeLinecap="round"
        fill="none"
        opacity={0.8}
      />
    </g>
  )
}

/** 坡上的草茬短划 */
function GrassTuft({ x, y, s = 1, color = INK }: { x: number; y: number; s?: number; color?: string }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" opacity={0.8}>
      <path d="M0 0 C-1 -4 -1 -7 -2 -10" />
      <path d="M4 0 C4 -5 5 -8 6 -11" />
      <path d="M8 1 C9 -3 10 -6 12 -8" />
    </g>
  )
}

function Speckles({ x, y, color = INK, spread = 1 }: { x: number; y: number; color?: string; spread?: number }) {
  const dots = [
    [0, 0], [14, -6], [28, 4], [44, -3], [8, 10], [36, 12], [22, -14],
  ]
  return (
    <g transform={`translate(${x},${y}) scale(${spread})`} fill={color} opacity={0.45}>
      {dots.map(([dx, dy], i) => (
        <circle key={i} cx={dx} cy={dy} r={1.4} />
      ))}
    </g>
  )
}

/* ---------- 地标（含内部线稿） ---------- */

function Torii({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <path d="M-44 -52 C-14 -60 14 -60 44 -52 L40 -42 C12 -49 -12 -49 -40 -42 Z" fill="#a34424" />
      <rect x={-33} y={-40} width={66} height={7} rx={3} fill="#a34424" />
      <rect x={-26} y={-46} width={7} height={46} rx={3} fill="#b0562f" />
      <rect x={19} y={-46} width={7} height={46} rx={3} fill="#b0562f" />
      <rect x={-4} y={-40} width={8} height={12} rx={2} fill="#b0562f" />
      {/* 木纹与柱脚石 */}
      <path d="M-22.5 -38 L-22.5 -8 M22.5 -38 L22.5 -8 M-30 -50 C-10 -55 10 -55 30 -50" stroke="#7c3018" strokeWidth={1.6} strokeLinecap="round" fill="none" opacity={0.85} />
      <rect x={-29} y={-2} width={13} height={5} rx={2.5} fill={BONE} />
      <rect x={16} y={-2} width={13} height={5} rx={2.5} fill={BONE} />
    </g>
  )
}

function Pagoda({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <path d="M0 -96 L3 -86 L-3 -86 Z" fill="#8a4a2e" />
      <path d="M-26 -84 C-10 -92 10 -92 26 -84 L18 -74 L-18 -74 Z" fill="#a34424" />
      <rect x={-13} y={-74} width={26} height={12} fill="#e8d9b8" />
      <path d="M-34 -62 C-12 -70 12 -70 34 -62 L24 -51 L-24 -51 Z" fill="#a34424" />
      <rect x={-17} y={-51} width={34} height={14} fill="#e8d9b8" />
      <path d="M-42 -37 C-15 -46 15 -46 42 -37 L30 -25 L-30 -25 Z" fill="#a34424" />
      <rect x={-21} y={-25} width={42} height={25} fill="#e8d9b8" />
      <rect x={-4} y={-14} width={8} height={14} fill="#8a4a2e" />
      <path d="M-8 -70 L8 -70 M-11 -45 L11 -45 M-14 -18 L14 -18" stroke="#8a4a2e" strokeWidth={1.5} fill="none" opacity={0.8} />
    </g>
  )
}

function Lighthouse({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <path d="M-14 0 L-9 -58 L9 -58 L14 0 Z" fill="#efe5cf" stroke="#b0562f" strokeWidth={2} />
      <path d="M-12 -14 L12 -14 L13 -4 L-13 -4 Z" fill="#b0562f" />
      <path d="M-10.5 -40 L10.5 -40 L11.5 -30 L-11.5 -30 Z" fill="#b0562f" />
      <rect x={-10} y={-70} width={20} height={12} rx={2} fill="#3a3a35" />
      <circle cx={0} cy={-64} r={4} fill="#d7a944" />
      <path d="M-16 -74 C-6 -80 6 -80 16 -74 L12 -70 L-12 -70 Z" fill="#8a4a2e" />
    </g>
  )
}

function Balloon({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <path d="M0 -46 C26 -46 34 -22 26 -4 C20 9 8 16 0 16 C-8 16 -20 9 -26 -4 C-34 -22 -26 -46 0 -46 Z" fill="#b0562f" />
      <path d="M-10 -45 C-16 -30 -16 -6 -6 13 L0 16 L6 13 C16 -6 16 -30 10 -45 Z" fill="#d9a866" />
      <line x1={-14} y1={12} x2={-8} y2={26} stroke="#3a3a35" strokeWidth={2} />
      <line x1={14} y1={12} x2={8} y2={26} stroke="#3a3a35" strokeWidth={2} />
      <rect x={-9} y={25} width={18} height={13} rx={3} fill="#8a5a33" />
    </g>
  )
}

function Birds({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} stroke="#3a3a35" strokeWidth={2} fill="none" strokeLinecap="round">
      <path d="M0 0 C4 -5 8 -5 12 0 C16 -5 20 -5 24 0" />
      <path d="M34 -12 C37 -16 40 -16 43 -12 C46 -16 49 -16 52 -12" />
    </g>
  )
}

/** 首页英雄区的全景插画（1440 × 430），锚定底部；作为视频层的同风格底稿 */
export function HeroScene() {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  return (
    <svg viewBox="0 0 1440 430" preserveAspectRatio="xMidYMax slice" className="block h-full w-full" aria-hidden="true">
      <Defs uid={uid} seed={11} />

      <g filter={`url(#rough-soft-${uid})`}>
        <circle cx={1150} cy={120} r={52} fill="#d7a944" opacity={0.9} />
        <Cloud x={250} y={95} s={1.1} />
        <Cloud x={620} y={60} s={0.8} />
        <Cloud x={1310} y={70} s={0.9} />
      </g>
      <Balloon x={420} y={130} s={0.9} />
      <Birds x={900} y={95} />

      <g filter={`url(#rough-${uid})`}>
        <path
          d="M0 320 C140 282 260 300 400 278 C560 253 660 290 800 272 C960 251 1060 288 1200 268 C1320 251 1390 268 1440 258 L1440 430 L0 430 Z"
          fill="#d9a866"
          opacity={0.55}
        />
        <path
          d="M0 352 C170 315 320 342 470 320 C640 296 760 335 930 315 C1090 296 1210 330 1440 306 L1440 430 L0 430 Z"
          fill="#a8ad7f"
        />
        <path
          d="M0 402 C220 362 420 392 640 372 C860 352 1050 388 1250 368 C1340 359 1400 368 1440 362 L1440 430 L0 430 Z"
          fill="#c98a5e"
        />
      </g>

      <g filter={`url(#rough-soft-${uid})`}>
        <Mountain x={620} y={330} s={1.3} fill="#5d6a45" />
        <Mountain x={1090} y={318} s={1.0} fill="#8a6a48" />
        <RoundTree x={130} y={352} s={1.05} fill="#4c5c44" vein={BONE} />
        <RoundTree x={560} y={342} s={0.85} />
        <SlimTree x={700} y={356} s={1.0} />
        <RoundTree x={1010} y={346} s={1.0} fill="#4c5c44" vein={BONE} />
        <Bush x={1330} y={372} s={0.9} />
        <Torii x={250} y={330} s={1.05} />
        <Pagoda x={880} y={330} s={1.05} />
        <Lighthouse x={1240} y={382} s={1.0} />
        <GrassTuft x={340} y={392} s={1.2} color={BONE} />
        <GrassTuft x={760} y={398} s={1.2} color={BONE} />
        <GrassTuft x={1120} y={390} s={1.1} color={BONE} />
        <Frond x={30} y={428} s={1.3} rot={-8} />
        <Frond x={1416} y={430} s={1.4} rot={10} />
      </g>

      <Sparkle x={186} y={268} s={0.9} />
      <DashMark x={560} y={302} s={1.1} />
      <Sparkle x={952} y={238} s={0.8} />
      <Speckles x={480} y={330} />
      <Speckles x={1150} y={352} color={BONE} />

      <rect width="1440" height="430" filter={`url(#grain-${uid})`} opacity={0.65} fill="transparent" />
    </svg>
  )
}

/* ---------- 文章封面 ---------- */

interface PaletteSpec {
  sky: string
  back: string
  front: string
  sun: string
  mount: string
  treeFill: string
  treeVein: string
  hatchBack: string
  hatchFront: string
}

const palettes: Record<Palette, PaletteSpec> = {
  warm: {
    sky: '#f0e2c8', back: '#d9a866', front: '#c98a5e', sun: '#b0562f', mount: '#5d6a45',
    treeFill: '#4c5c44', treeVein: BONE, hatchBack: '#8a5a33', hatchFront: '#7c3f22',
  },
  olive: {
    sky: '#ecebd8', back: '#a8ad7f', front: '#6f7d51', sun: '#d7a944', mount: '#8a6a48',
    treeFill: '#3d4a37', treeVein: BONE, hatchBack: '#5d6a45', hatchFront: BONE,
  },
  dusk: {
    sky: '#ecd9c2', back: '#c98a5e', front: '#8a4a2e', sun: '#d7a944', mount: '#4c5c44',
    treeFill: '#3d4a37', treeVein: BONE, hatchBack: '#7c3f22', hatchFront: BONE,
  },
}

/* --- 各主体（放大 + 内部线稿） --- */

function CoffeeCup({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <ellipse cx={0} cy={34} rx={46} ry={6} fill="none" stroke="#8a5a33" strokeWidth={2.5} />
      <path d="M-32 -8 C-32 15 -15 28 0 28 C15 28 32 15 32 -8 Z" fill={BONE} stroke="#8a5a33" strokeWidth={3} />
      <path d="M-24 2 C-20 12 -10 20 0 21 M-27 -4 L27 -4" stroke="#c8a678" strokeWidth={1.8} fill="none" strokeLinecap="round" />
      <path d="M32 -4 C46 -6 48 12 32 14" fill="none" stroke="#8a5a33" strokeWidth={3} />
      <ellipse cx={0} cy={-8} rx={32} ry={6.5} fill="#8a5a33" />
      <ellipse cx={0} cy={-8} rx={24} ry={4.2} fill="#6b4226" />
      <path d="M-11 -22 C-15 -31 -7 -35 -11 -44 M8 -20 C4 -29 12 -33 8 -42 M-1 -26 C-4 -33 2 -38 -1 -46" fill="none" stroke="#8a5a33" strokeWidth={2.5} strokeLinecap="round" />
      <line x1={38} y1={30} x2={54} y2={26} stroke="#8a5a33" strokeWidth={2.5} strokeLinecap="round" />
      <circle cx={-46} cy={30} r={2} fill="#6b4226" />
      <circle cx={-54} cy={34} r={2} fill="#6b4226" />
      <circle cx={-48} cy={38} r={2} fill="#6b4226" />
    </g>
  )
}

function WindScene({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <g fill="none" stroke="#8a5a33" strokeWidth={3.2} strokeLinecap="round">
        <path d="M-62 -22 C-22 -33 12 -13 38 -24 C52 -30 58 -22 53 -15 C49 -10 42 -12 43 -18" />
        <path d="M-68 6 C-30 -5 20 15 48 4 C62 -1 70 8 64 15 C59 20 51 17 53 11" />
        <path d="M-52 30 C-18 21 8 38 32 29" />
      </g>
      {/* 洱海帆影 */}
      <path d="M-14 52 L14 52 L8 58 L-8 58 Z" fill="#8a5a33" />
      <path d="M0 50 L0 26 C8 32 12 40 13 50 Z" fill={BONE} stroke="#8a5a33" strokeWidth={1.8} />
      <path d="M-30 60 C-24 56 -18 56 -12 60 M14 62 C20 58 26 58 32 62" stroke={BONE} strokeWidth={2} fill="none" strokeLinecap="round" />
    </g>
  )
}

function BookStack({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <rect x={-38} y={8} width={76} height={14} rx={3} fill="#b0562f" />
      <rect x={-33} y={-6} width={66} height={14} rx={3} fill="#6f7d51" />
      <rect x={-36} y={-20} width={62} height={14} rx={3} fill="#d9a866" />
      <rect x={-30} y={-33} width={54} height={13} rx={3} fill={BONE} stroke="#8a5a33" strokeWidth={1.6} />
      {/* 书脊线与书签 */}
      <path d="M-30 15 L30 15 M-26 1 L26 1 M-28 -13 L20 -13 M-22 -27 L18 -27" stroke={BONE} strokeWidth={1.6} strokeLinecap="round" opacity={0.9} />
      <path d="M20 -33 L20 -44 L25 -40 L30 -44 L30 -33" fill="#a34424" />
      {/* 台灯与光晕 */}
      <g transform="translate(46,-30)">
        <line x1={0} y1={52} x2={0} y2={6} stroke="#3a3a35" strokeWidth={3} />
        <path d="M-14 6 L14 6 L8 -8 L-8 -8 Z" fill="#a34424" />
        <circle cx={0} cy={10} r={4} fill="#d7a944" />
        <path d="M-18 14 L-24 18 M18 14 L24 18 M0 18 L0 26" stroke="#d7a944" strokeWidth={2.2} strokeLinecap="round" />
      </g>
      <g transform="translate(-6,-52) rotate(10)">
        <rect x={-11} y={0} width={22} height={27} rx={3} fill={BONE} stroke="#8a5a33" strokeWidth={2.2} />
        <path d="M-4 7 L5 7 M-4 13 L5 13 M-4 19 L2 19" stroke="#8a5a33" strokeWidth={1.6} strokeLinecap="round" />
      </g>
    </g>
  )
}

function RoadScene({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <path d="M-18 -62 L18 -62 L58 34 L-58 34 Z" fill="#55503f" />
      <path d="M-12 -58 L-40 30 M12 -58 L40 30" stroke="#3a372c" strokeWidth={1.8} opacity={0.7} />
      <line x1={0} y1={-54} x2={0} y2={-38} stroke={BONE} strokeWidth={3} />
      <line x1={0} y1={-26} x2={0} y2={-2} stroke={BONE} strokeWidth={4} />
      <line x1={0} y1={10} x2={0} y2={34} stroke={BONE} strokeWidth={5} />
      {/* 路侧标杆 */}
      <g stroke="#3a372c" strokeWidth={2.4} strokeLinecap="round">
        <line x1={-52} y1={20} x2={-52} y2={4} />
        <line x1={52} y1={20} x2={52} y2={4} />
      </g>
      <circle cx={-52} cy={2} r={2.6} fill="#d7a944" />
      <circle cx={52} cy={2} r={2.6} fill="#d7a944" />
    </g>
  )
}

/** 闽南山门 + 灯笼 */
function LanternGate({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {/* 燕尾脊屋顶 */}
      <path d="M-58 -56 C-30 -66 30 -66 58 -56 C62 -54 66 -58 68 -62 C60 -46 46 -44 34 -46 L-34 -46 C-46 -44 -60 -46 -68 -62 C-66 -58 -62 -54 -58 -56 Z" fill="#a34424" />
      <path d="M-50 -54 C-20 -61 20 -61 50 -54" stroke="#7c3018" strokeWidth={1.8} fill="none" />
      <rect x={-40} y={-46} width={80} height={8} rx={3} fill="#8a4a2e" />
      {/* 立柱 */}
      <rect x={-40} y={-38} width={9} height={52} rx={3} fill={BONE} stroke="#8a5a33" strokeWidth={1.8} />
      <rect x={31} y={-38} width={9} height={52} rx={3} fill={BONE} stroke="#8a5a33" strokeWidth={1.8} />
      <path d="M-35.5 -30 L-35.5 8 M35.5 -30 L35.5 8" stroke="#c8a678" strokeWidth={1.4} />
      {/* 灯笼 */}
      <line x1={0} y1={-38} x2={0} y2={-26} stroke={INK} strokeWidth={2.4} />
      <rect x={-9} y={-28} width={18} height={5} rx={2.5} fill="#8a4a2e" />
      <path d="M0 -24 C19 -24 23 -2 18 10 C13 20 -13 20 -18 10 C-23 -2 -19 -24 0 -24 Z" fill="#b0562f" />
      <path d="M-14 -14 L14 -14 M-16 -2 L16 -2 M-13 8 L13 8 M-6 -22 C-8 -10 -8 2 -6 14 M6 -22 C8 -10 8 2 6 14" stroke="#8a4a2e" strokeWidth={1.7} fill="none" />
      <rect x={-7} y={16} width={14} height={5} rx={2.5} fill="#8a4a2e" />
      <line x1={0} y1={21} x2={0} y2={33} stroke="#d7a944" strokeWidth={3} strokeLinecap="round" />
      {/* 香火烟 */}
      <path d="M52 6 C48 -2 54 -8 50 -16" stroke="#8a5a33" strokeWidth={1.8} fill="none" strokeLinecap="round" opacity={0.8} />
    </g>
  )
}

function ToriiScene({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <Torii x={0} y={0} s={1.15} />
      {/* 石阶 */}
      <path d="M-14 6 L14 6 M-18 14 L18 14 M-22 22 L22 22" stroke="#8a5a33" strokeWidth={2.4} strokeLinecap="round" fill="none" opacity={0.85} />
    </g>
  )
}

const motifDraw: Record<Motif, (cx: number, cy: number) => JSX.Element> = {
  torii: (cx, cy) => <ToriiScene x={cx} y={cy + 42} s={1.35} />,
  coffee: (cx, cy) => <CoffeeCup x={cx} y={cy + 4} s={1.2} />,
  wind: (cx, cy) => <WindScene x={cx} y={cy - 4} s={1.15} />,
  books: (cx, cy) => <BookStack x={cx - 8} y={cy + 16} s={1.15} />,
  road: (cx, cy) => <RoadScene x={cx} y={cy + 14} s={1.15} />,
  lantern: (cx, cy) => <LanternGate x={cx} y={cy + 22} s={1.12} />,
}

const motifSeed: Record<Motif, number> = { torii: 3, coffee: 17, wind: 29, books: 41, road: 53, lantern: 67 }

/** 文章封面插画（400 × 280）——密度与笔触对齐 Wandor 原画 */
export function PostCover({ motif, palette }: { motif: Motif; palette: Palette }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const p = palettes[palette]
  const seed = motifSeed[motif]
  return (
    <svg viewBox="0 0 400 280" className="block h-full w-full" aria-hidden="true">
      <Defs uid={uid} seed={seed} />
      <rect width={400} height={280} fill={p.sky} />

      <g filter={`url(#rough-soft-${uid})`}>
        <circle cx={324} cy={58} r={28} fill={p.sun} opacity={0.92} />
        <Cloud x={84} y={46} s={0.7} />
      </g>

      {/* 远山（等高线） */}
      <g filter={`url(#rough-soft-${uid})`}>
        <Mountain x={116} y={196} s={1.05} fill={p.mount} />
        <Mountain x={306} y={200} s={0.8} fill={p.mount} />
      </g>

      {/* 双层丘陵 */}
      <g filter={`url(#rough-${uid})`}>
        <path d="M0 196 C70 176 140 190 210 178 C290 165 340 186 400 172 L400 280 L0 280 Z" fill={p.back} opacity={0.82} />
        <path d="M0 236 C90 214 190 232 280 220 C340 212 380 222 400 216 L400 280 L0 280 Z" fill={p.front} />
      </g>

      {/* 坡面草茬与斑点 */}
      <g filter={`url(#rough-soft-${uid})`}>
        <GrassTuft x={58} y={206} color={p.hatchBack} />
        <GrassTuft x={268} y={198} s={0.9} color={p.hatchBack} />
        <GrassTuft x={122} y={252} s={1.1} color={p.hatchFront} />
        <GrassTuft x={236} y={258} color={p.hatchFront} />
        <GrassTuft x={330} y={244} s={0.9} color={p.hatchFront} />
        <Speckles x={160} y={200} color={p.hatchBack} />
        <Speckles x={40} y={252} color={p.hatchFront} spread={0.9} />

        {/* 树与灌木 */}
        <RoundTree x={48} y={196} s={0.82} fill={p.treeFill} vein={p.treeVein} />
        <SlimTree x={372} y={202} s={0.8} />
        <Bush x={352} y={238} s={0.72} dark />
        <Bush x={20} y={232} s={0.6} dark />

        {/* 主体 */}
        {motifDraw[motif](200, 152)}

        {/* 前景蕨叶 */}
        <Frond x={16} y={284} s={1.25} rot={-9} vein={BONE} />
        <Frond x={388} y={286} s={1.35} rot={9} vein={BONE} />
      </g>

      <Sparkle x={132} y={112} s={0.72} />
      <DashMark x={70} y={158} s={0.9} />

      <rect width={400} height={280} filter={`url(#grain-${uid})`} opacity={0.7} fill="transparent" />
    </svg>
  )
}
