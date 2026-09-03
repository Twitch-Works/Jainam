import type { ComponentType } from "react";
import type { IconKey } from "@/data/types";
import {
  AhimsaHandIcon,
  AnekantavadaIcon,
  AparigrahaIcon,
  BookIcon,
  BrahmacharyaIcon,
  ChantIcon,
  FlameIcon,
  type IconProps,
  LotusIcon,
  MeditateIcon,
  SatyaIcon,
  StandingFigureIcon,
} from "@/components/icons";

/** Maps a data-layer `IconKey` to its brand glyph component. */
export const iconForKey: Record<IconKey, ComponentType<IconProps>> = {
  lotus: LotusIcon,
  meditate: MeditateIcon,
  chant: ChantIcon,
  flame: FlameIcon,
  book: BookIcon,
  hand: AhimsaHandIcon,
  standing: StandingFigureIcon,
  anekant: AnekantavadaIcon,
  aparigraha: AparigrahaIcon,
  satya: SatyaIcon,
  brahmacharya: BrahmacharyaIcon,
};
