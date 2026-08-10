export type Phase = "assault" | "pause" | "victory" | "defeat";

export type LayerId = "outer" | "mid" | "inner" | "core";

export interface Layer {
  id: LayerId;
  name: string;
  maxHp: number;
  hp: number;
  destroyed: boolean;
}

export interface Tower {
  id: "A" | "B";
  name: string;
  layers: Layer[];
  weaponsOnline: number;
  energy: number;
  maxEnergy: number;
}

export interface Colossus {
  id: string;
  name: string;
  target: "A" | "B" | "both";
  maxHp: number;
  hp: number;
  damagePerTick: number;
  status: "advancing" | "attacking" | "reconfiguring" | "destroyed";
  position: number;
}

export interface GameState {
  phase: Phase;
  phaseTimer: number;
  phaseNumber: number;
  towers: {
    A: Tower;
    B: Tower;
  };
  colossi: Colossus[];
  tunnelStatus: "open" | "contested" | "collapsed";
  resources: number;
  score: number;
  log: string[];
  selectedTower: "A" | "B";
  selectedLayer: LayerId | null;
}

export const LAYER_ORDER: LayerId[] = ["outer", "mid", "inner", "core"];

export const INITIAL_LAYERS: Layer[] = [
  { id: "outer", name: "Outer Shell", maxHp: 100, hp: 100, destroyed: false },
  { id: "mid", name: "Mid Structure", maxHp: 120, hp: 120, destroyed: false },
  { id: "inner", name: "Inner Systems", maxHp: 100, hp: 100, destroyed: false },
  { id: "core", name: "Core Bastion", maxHp: 150, hp: 150, destroyed: false },
];

export function createInitialState(): GameState {
  return {
    phase: "pause",
    phaseTimer: 30,
    phaseNumber: 0,
    towers: {
      A: {
        id: "A",
        name: "Bastion Alpha",
        layers: INITIAL_LAYERS.map((l) => ({ ...l })),
        weaponsOnline: 2,
        energy: 80,
        maxEnergy: 100,
      },
      B: {
        id: "B",
        name: "Bastion Beta",
        layers: INITIAL_LAYERS.map((l) => ({ ...l })),
        weaponsOnline: 2,
        energy: 80,
        maxEnergy: 100,
      },
    },
    colossi: [],
    tunnelStatus: "open",
    resources: 50,
    score: 0,
    log: ["Nexus online. Twin Bastions standing by. Awaiting first Colossus signature..."],
    selectedTower: "A",
    selectedLayer: null,
  };
}
