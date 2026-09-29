export type CardType = 'Challenge' | 'Riddle';

export type CognitiveLevel = 'C2' | 'C4' | 'C5';

export type Indicator = 
  | 'Interpretasi'
  | 'Analisis'
  | 'Evaluasi'
  | 'Inferensi'
  | 'Eksplanasi'
  | 'Regulasi Diri';

export type ZoneId = 1 | 2 | 3 | 4;

export interface ActivityData {
  code: string;            // e.g. 'KE-01'
  zoneId: ZoneId;
  zoneName: string;
  tileNumber: number;
  indicator: Indicator;
  level: CognitiveLevel;
  cardType: CardType;
  title: string;
  instruction: string;
  stimulus?: {
    type: 'case' | 'image' | 'video' | 'data';
    content: string;
    imageUrl?: string;
  };
  expectedResult?: string;
  qrCode?: string;
  selfRegulationReference?: string;
  maxScore: number;
}

export interface TileData {
  id: number;
  x: number;               // Scale 0 - 1600
  y: number;               // Scale 0 - 1600
  type: 'step' | 'challenge' | 'riddle' | 'badge' | 'finish';
  zone: ZoneId;
  activityCode?: string;
  badgePoints?: number;
  label?: string;
}

export interface Team {
  id: number;
  name: string;
  color: string;
  badgeColor: string;
  currentTile: number;
  completedActivities: string[];
  badgePoints: number;     // from speed badges
  lkpdScore: number;       // from rubric 0-3
  avatarIcon: string;
  hasFinishedPreTest: boolean;
  hasFinishedPostTest: boolean;
}

export interface TestQuestion {
  id: number;
  indicator: Indicator;
  level: CognitiveLevel;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}
