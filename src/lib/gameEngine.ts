import {
  GameState,
  Colossus,
  LayerId,
  LAYER_ORDER,
  createInitialState,
} from "./gameTypes";

const ASSAULT_DURATION = 45;
const PAUSE_DURATION = 35;

function addLog(state: GameState, message: string): GameState {
  const log = [message, ...state.log].slice(0, 12);
  return { ...state, log };
}

function damageTower(
  state: GameState,
  towerId: "A" | "B",
  amount: number
): GameState {
  const tower = { ...state.towers[towerId] };
  const layers = tower.layers.map((l) => ({ ...l }));
  let remaining = amount;

  for (const id of LAYER_ORDER) {
    if (remaining <= 0) break;
    const idx = layers.findIndex((l) => l.id === id);
    if (idx === -1 || layers[idx].destroyed) continue;

    const layer = layers[idx];
    if (layer.hp <= remaining) {
      remaining -= layer.hp;
      layers[idx] = { ...layer, hp: 0, destroyed: true };
    } else {
      layers[idx] = { ...layer, hp: layer.hp - remaining };
      remaining = 0;
    }
  }

  tower.layers = layers;
  const newTowers = { ...state.towers, [towerId]: tower };

  const aCore = newTowers.A.layers.find((l) => l.id === "core");
  const bCore = newTowers.B.layers.find((l) => l.id === "core");
  if ((aCore?.destroyed || aCore?.hp === 0) && (bCore?.destroyed || bCore?.hp === 0)) {
    return {
      ...state,
      towers: newTowers,
      phase: "defeat",
      log: ["BOTH CORE BASTIONS DESTROYED. The Colossi have won.", ...state.log].slice(0, 12),
    };
  }

  return { ...state, towers: newTowers };
}

function spawnColossus(phaseNumber: number): Colossus {
  const names = [
    "Proto-Colossus Alpha",
    "Siege Walker Titan",
    "Tunneling Megaconstruct",
    "Floating Artillery Platform",
    "Core Reaper",
  ];
  const targets: ("A" | "B" | "both")[] = ["A", "B", "both"];
  const name = names[Math.min(phaseNumber, names.length - 1)];
  const target = targets[phaseNumber % 3];

  return {
    id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    target,
    maxHp: 200 + phaseNumber * 80,
    hp: 200 + phaseNumber * 80,
    damagePerTick: 8 + phaseNumber * 2,
    status: "advancing",
    position: 0,
  };
}

export function tick(state: GameState): GameState {
  if (state.phase === "victory" || state.phase === "defeat") return state;

  let next = { ...state, phaseTimer: Math.max(0, state.phaseTimer - 1) };

  if (next.phaseTimer === 0) {
    if (next.phase === "pause") {
      const newColossi = [...next.colossi.filter((c) => c.status !== "destroyed")];
      if (newColossi.length === 0 || next.phaseNumber % 2 === 0) {
        newColossi.push(spawnColossus(next.phaseNumber));
      }
      newColossi.forEach((c) => {
        if (c.status === "reconfiguring") {
          c.status = "advancing";
          c.position = Math.max(0, c.position - 20);
        }
      });

      next = addLog(
        {
          ...next,
          phase: "assault",
          phaseTimer: ASSAULT_DURATION,
          phaseNumber: next.phaseNumber + 1,
          colossi: newColossi,
        },
        `ASSAULT PHASE ${next.phaseNumber + 1} — Colossi advancing on the Twin Bastions.`
      );
    } else if (next.phase === "assault") {
      const updatedColossi = next.colossi.map((c) =>
        c.status !== "destroyed"
          ? { ...c, status: "reconfiguring" as const, position: Math.min(100, c.position) }
          : c
      );
      next = addLog(
        {
          ...next,
          phase: "pause",
          phaseTimer: PAUSE_DURATION,
          colossi: updatedColossi,
        },
        "Colossi entering reconfiguration cycle. Window to reinforce and reorganize."
      );
    }
  }

  if (next.phase === "assault") {
    let working = next;
    for (const col of next.colossi) {
      if (col.status === "destroyed") continue;

      if (col.position < 100) {
        const newPos = Math.min(100, col.position + 4);
        const updated = next.colossi.map((c) =>
          c.id === col.id
            ? { ...c, position: newPos, status: newPos >= 100 ? "attacking" as const : "advancing" as const }
            : c
        );
        working = { ...working, colossi: updated };
        continue;
      }

      if (col.status === "attacking" || col.position >= 100) {
        if (col.target === "A" || col.target === "both") {
          working = damageTower(working, "A", col.damagePerTick);
        }
        if (col.target === "B" || col.target === "both") {
          working = damageTower(working, "B", col.damagePerTick);
        }
      }
    }
    next = working;

    next = {
      ...next,
      towers: {
        A: { ...next.towers.A, energy: Math.min(next.towers.A.maxEnergy, next.towers.A.energy + 1) },
        B: { ...next.towers.B, energy: Math.min(next.towers.B.maxEnergy, next.towers.B.energy + 1) },
      },
    };
  }

  if (next.phase === "pause") {
    next = {
      ...next,
      towers: {
        A: { ...next.towers.A, energy: Math.min(next.towers.A.maxEnergy, next.towers.A.energy + 3) },
        B: { ...next.towers.B, energy: Math.min(next.towers.B.maxEnergy, next.towers.B.energy + 3) },
      },
      resources: next.resources + 2,
    };
  }

  if (
    next.colossi.length > 0 &&
    next.colossi.every((c) => c.status === "destroyed") &&
    next.phaseNumber >= 4
  ) {
    next = {
      ...next,
      phase: "victory",
      log: ["All known Proto-Colossi neutralized. Twin Bastions hold. Protocol complete.", ...next.log].slice(0, 12),
    };
  }

  return next;
}

export function repairLayer(
  state: GameState,
  towerId: "A" | "B",
  layerId: LayerId
): GameState {
  if (state.phase !== "pause" && state.phase !== "assault") return state;
  if (state.resources < 15) {
    return addLog(state, "Insufficient resources for repair.");
  }

  const tower = { ...state.towers[towerId] };
  const layers = tower.layers.map((l) => {
    if (l.id !== layerId) return l;
    if (l.destroyed) {
      return { ...l, destroyed: false, hp: Math.floor(l.maxHp * 0.4) };
    }
    return { ...l, hp: Math.min(l.maxHp, l.hp + 35) };
  });

  tower.layers = layers;
  return addLog(
    {
      ...state,
      resources: state.resources - 15,
      towers: { ...state.towers, [towerId]: tower },
      score: state.score + 10,
    },
    `Repaired ${layerId} layer on Bastion ${towerId}.`
  );
}

export function fireWeapons(state: GameState, towerId: "A" | "B"): GameState {
  const tower = state.towers[towerId];
  if (tower.energy < 25) {
    return addLog(state, `Bastion ${towerId} lacks energy to fire weapons.`);
  }
  if (tower.weaponsOnline <= 0) {
    return addLog(state, `No weapons online on Bastion ${towerId}.`);
  }

  const target =
    state.colossi.find(
      (c) =>
        c.status !== "destroyed" &&
        (c.target === towerId || c.target === "both")
    ) || state.colossi.find((c) => c.status !== "destroyed");

  if (!target) {
    return addLog(state, "No active Colossus in range.");
  }

  const damage = 28 + tower.weaponsOnline * 12;
  const newHp = Math.max(0, target.hp - damage);
  const destroyed = newHp <= 0;

  const updatedColossi = state.colossi.map((c) =>
    c.id === target.id
      ? {
          ...c,
          hp: newHp,
          status: destroyed ? ("destroyed" as const) : c.status,
        }
      : c
  );

  return addLog(
    {
      ...state,
      towers: {
        ...state.towers,
        [towerId]: { ...tower, energy: tower.energy - 25 },
      },
      colossi: updatedColossi,
      score: state.score + (destroyed ? 150 : 25),
    },
    destroyed
      ? `Bastion ${towerId} weapons destroyed ${target.name}!`
      : `Bastion ${towerId} weapons hit ${target.name} for ${damage} damage.`
  );
}

export function transferResources(state: GameState, from: "A" | "B"): GameState {
  if (state.tunnelStatus === "collapsed") {
    return addLog(state, "Tunnel network collapsed. Transfer impossible.");
  }
  if (state.resources < 5) return state;

  const to = from === "A" ? "B" : "A";
  const fromTower = state.towers[from];
  const toTower = state.towers[to];

  const transfer = Math.min(20, fromTower.energy);
  if (transfer <= 0) return state;

  return addLog(
    {
      ...state,
      resources: state.resources - 5,
      towers: {
        ...state.towers,
        [from]: { ...fromTower, energy: fromTower.energy - transfer },
        [to]: {
          ...toTower,
          energy: Math.min(toTower.maxEnergy, toTower.energy + transfer),
        },
      },
      score: state.score + 5,
    },
    `Transferred ${transfer} energy from Bastion ${from} → ${to} via tunnels.`
  );
}

export function boostWeapons(state: GameState, towerId: "A" | "B"): GameState {
  if (state.resources < 25) {
    return addLog(state, "Need 25 resources to bring additional weapons online.");
  }
  const tower = state.towers[towerId];
  if (tower.weaponsOnline >= 5) {
    return addLog(state, "Maximum weapons already online.");
  }

  return addLog(
    {
      ...state,
      resources: state.resources - 25,
      towers: {
        ...state.towers,
        [towerId]: { ...tower, weaponsOnline: tower.weaponsOnline + 1 },
      },
      score: state.score + 15,
    },
    `Additional weapon battery brought online on Bastion ${towerId}.`
  );
}

export { createInitialState };
