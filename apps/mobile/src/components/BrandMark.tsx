import { View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Circle, G, Line, Path } from "react-native-svg";
import { colors } from "@/theme";

/**
 * The Jainam brand mark — Ahimsa hand + Dharmachakra inside an ornate
 * mandala/lotus border, gold line art (PLAN.md §2.5). This is the in-app
 * vector; the static app-icon / splash PNGs under assets/images are generated
 * from the same geometry by scripts/build-brand-assets.js — keep them in sync.
 *
 * Use the mark alone for headers and avatars; pair it with the wordmark
 * ([[Logo]]) only on splash/onboarding.
 */
type BrandMarkProps = {
  size?: number;
  color?: string;
  /** Drop the mandala border and render just the hand + wheel (compact contexts). */
  withMandala?: boolean;
  style?: StyleProp<ViewStyle>;
};

const CENTER = 256;
const rad = (deg: number) => (deg * Math.PI) / 180;
const pt = (r: number, deg: number): [number, number] => [
  +(CENTER + r * Math.cos(rad(deg))).toFixed(2),
  +(CENTER + r * Math.sin(rad(deg))).toFixed(2),
];

function petalRing(count: number, baseR: number, tipR: number, half: number, bulge = 1): string {
  let d = "";
  for (let i = 0; i < count; i++) {
    const a = (360 / count) * i - 90;
    const [x1, y1] = pt(baseR, a - half);
    const [tx, ty] = pt(tipR, a);
    const [x2, y2] = pt(baseR, a + half);
    const [c1x, c1y] = pt(tipR * bulge, a - half * 0.7);
    const [c2x, c2y] = pt(tipR * bulge, a + half * 0.7);
    d += `M${x1} ${y1} Q${c1x} ${c1y} ${tx} ${ty} Q${c2x} ${c2y} ${x2} ${y2} `;
  }
  return d;
}

function dotRing(count: number, r: number, offset = 0): { cx: number; cy: number }[] {
  const dots: { cx: number; cy: number }[] = [];
  for (let i = 0; i < count; i++) {
    const [cx, cy] = pt(r, (360 / count) * i - 90 + offset);
    dots.push({ cx, cy });
  }
  return dots;
}

function handPath(): string {
  const K = 252;
  const hw = 11;
  const fingers = [
    { cx: 223, tip: 188 },
    { cx: 245, tip: 167 },
    { cx: 267, tip: 186 },
    { cx: 289, tip: 214 },
  ];
  let d = `M302 348 C310 316 306 278 ${(fingers[3].cx + hw).toFixed(1)} ${K}`;
  for (let i = fingers.length - 1; i >= 0; i--) {
    const f = fingers[i];
    const rx = (f.cx + hw).toFixed(1);
    const lx = (f.cx - hw).toFixed(1);
    const capY = (f.tip + hw).toFixed(1);
    const peakY = (f.tip - hw * 0.6).toFixed(1);
    d += ` L${rx} ${capY} Q${f.cx} ${peakY} ${lx} ${capY} L${lx} ${K}`;
    if (i > 0) {
      const nrx = (fingers[i - 1].cx + hw).toFixed(1);
      const midx = ((f.cx - hw + fingers[i - 1].cx + hw) / 2).toFixed(1);
      d += ` Q${midx} ${K + 11} ${nrx} ${K}`;
    }
  }
  d += ` C206 258 200 264 197 274`;
  d += ` C188 266 174 274 170 288 C166 296 172 308 184 310 C192 311 199 308 204 304`;
  d += ` C207 320 209 336 219 348 C240 358 268 358 302 348 Z`;
  return d;
}

const MANDALA_OUTER = petalRing(24, 150, 246, 6.0);
const MANDALA_OUTER_INNER = petalRing(24, 150, 210, 6.4);
const MANDALA_MID = petalRing(12, 96, 138, 12.5, 1.02);
const HAND = handPath();
const DOTS = dotRing(24, 168, 7.5);

const WHEEL = { cx: 259, cy: 296, r: 29 };
const spokes = Array.from({ length: 8 }, (_, i) => {
  const a = rad(i * 45);
  return {
    x1: +(WHEEL.cx + Math.cos(a) * WHEEL.r * 0.15).toFixed(1),
    y1: +(WHEEL.cy + Math.sin(a) * WHEEL.r * 0.15).toFixed(1),
    x2: +(WHEEL.cx + Math.cos(a) * WHEEL.r * 0.72).toFixed(1),
    y2: +(WHEEL.cy + Math.sin(a) * WHEEL.r * 0.72).toFixed(1),
  };
});

export function BrandMark({
  size = 40,
  color = colors.goldDeep,
  withMandala = true,
  style,
}: BrandMarkProps) {
  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 512 512">
        {withMandala ? (
          <>
            <G
              fill="none"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.92}
            >
              <Path d={MANDALA_OUTER} />
              <Path d={MANDALA_OUTER_INNER} />
              <Circle cx={CENTER} cy={CENTER} r={150} />
              <Circle cx={CENTER} cy={CENTER} r={143} />
              <Path d={MANDALA_MID} />
              <Circle cx={CENTER} cy={CENTER} r={92} />
              <Circle cx={CENTER} cy={CENTER} r={86} />
            </G>
            <G fill={color} opacity={0.5}>
              {DOTS.map((d, i) => (
                <Circle key={i} cx={d.cx} cy={d.cy} r={2.3} />
              ))}
            </G>
          </>
        ) : null}

        <G
          transform="translate(3 0)"
          fill="none"
          stroke={color}
          strokeWidth={withMandala ? 4 : 8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <Path d={HAND} />
        </G>
        <G
          fill="none"
          stroke={color}
          strokeWidth={withMandala ? 2.6 : 5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <Circle cx={WHEEL.cx} cy={WHEEL.cy} r={WHEEL.r} />
          <Circle cx={WHEEL.cx} cy={WHEEL.cy} r={+(WHEEL.r * 0.72).toFixed(1)} />
          <Circle cx={WHEEL.cx} cy={WHEEL.cy} r={+(WHEEL.r * 0.15).toFixed(1)} />
          {spokes.map((s, i) => (
            <Line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} />
          ))}
        </G>
      </Svg>
    </View>
  );
}
