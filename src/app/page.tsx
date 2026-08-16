"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  createInitialState,
  GameState,
  LayerId,
  LAYER_ORDER,
} from "@/lib/gameTypes";
import {
  tick,
  repairLayer,
  fireWeapons,
  transferResources,
  boostWeapons,
} from "@/lib/gameEngine";
import { sounds } from "@/lib/sounds";
import Battlefield from "@/components/Battlefield";

export default function Home() {
  const [state, setState] = useState<GameState>(createInitialState);
  const [running, setRunning] = useState(false);
  const prevPhase = useRef(state.phase);
  const prevColossi = useRef(state.colossi);
  const prevLayers = useRef({ A: state.towers.A.layers, B: state.towers.B.layers });

  useEffect(() => {
    if (!running || state.phase === "victory" || state.phase === "defeat") return;
    const id = setInterval(() => {
      setState((s) => tick(s));
    }, 1000);
    return () => clearInterval(id);
  }, [running, state.phase]);

  useEffect(() => {
    if (!running) return;

    if (prevPhase.current !== state.phase) {
      if (state.phase === "assault") sounds.assaultStart();
      else if (state.phase === "pause") sounds.pauseStart();
      else if (state.phase === "victory") sounds.victory();
      else if (state.phase === "defeat") sounds.defeat();
      prevPhase.current = state.phase;
    }

    const prevIds = new Set(
      prevColossi.current.filter((c) => c.status === "destroyed").map((c) => c.id)
    );
    state.colossi.forEach((c) => {
      if (c.status === "destroyed" && !prevIds.has(c.id)) {
        sounds.destroyColossus();
      }
    });
    prevColossi.current = state.colossi;

    (["A", "B"] as const).forEach((tid) => {
      const prev = prevLayers.current[tid];
      const curr = state.towers[tid].layers;
      curr.forEach((layer, i) => {
        if (layer.destroyed && prev[i] && !prev[i].destroyed) {
          sounds.layerLost();
        }
      });
    });
    prevLayers.current = {
      A: state.towers.A.layers.map((l) => ({ ...l })),
      B: state.towers.B.layers.map((l) => ({ ...l })),
    };
  }, [state, running]);

  const startGame = () => {
    sounds.select();
    setState(createInitialState());
    setRunning(true);
    prevPhase.current = "pause";
  };

  const handleRepair = useCallback(() => {
    if (!state.selectedLayer) return;
    sounds.repair();
    setState((s) => repairLayer(s, s.selectedTower, s.selectedLayer!));
  }, [state.selectedLayer]);

  const handleFire = useCallback(() => {
    sounds.fire();
    setState((s) => fireWeapons(s, s.selectedTower));
  }, []);

  const handleTransfer = useCallback(() => {
    sounds.transfer();
    setState((s) => transferResources(s, s.selectedTower));
  }, []);

  const handleBoost = useCallback(() => {
    sounds.boost();
    setState((s) => boostWeapons(s, s.selectedTower));
  }, []);

  const phaseClass =
    state.phase === "assault"
      ? "text-red-400 phase-assault"
      : state.phase === "pause"
      ? "text-emerald-400 phase-pause"
      : state.phase === "victory"
      ? "text-amber-300"
      : "text-red-500";

  return (
    <main className="min-h-screen relative bg-grid overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50" />

      <div className="relative z-10 p-3 md:p-5 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-600 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-blue-400">
                <path d="M4 20V10l4-3 4 3 4-3 4 3v10H4z" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-100">
                Twin Bastions
              </h1>
              <p className="text-xs text-slate-500">Colossus Protocol</p>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-5">
            <div className="text-right">
              <div className={`text-sm font-semibold uppercase tracking-wider ${phaseClass}`}>
                {state.phase}
              </div>
              <div className="text-xs text-slate-400 font-mono">
                {state.phase === "victory" || state.phase === "defeat"
                  ? "—"
                  : `${state.phaseTimer}s`}
              </div>
            </div>
            <div className="h-7 w-px bg-slate-700" />
            <div className="text-right">
              <div className="text-[10px] text-slate-500">Phase</div>
              <div className="font-mono text-slate-200">{state.phaseNumber}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-500">Score</div>
              <div className="font-mono text-slate-200">{state.score}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-500">Res</div>
              <div className="font-mono text-amber-300">{state.resources}</div>
            </div>
          </div>
        </header>

        {!running && state.phaseNumber === 0 && (
          <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
            <div className="bg-slate-900/95 border border-slate-700 rounded-2xl p-8 max-w-lg text-center shadow-2xl overlay-in">
              <h2 className="text-2xl font-bold text-slate-100 mb-2">
                Twin Bastions: Colossus Protocol
              </h2>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Watch the Proto-Colossi advance across the battlefield.
                Defend the twin towers. Use the pauses. Keep at least one Core standing.
              </p>
              <button
                onClick={startGame}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition shadow-lg shadow-blue-900/40 btn-action"
              >
                Initialize Protocol
              </button>
            </div>
          </div>
        )}

        {(state.phase === "victory" || state.phase === "defeat") && (
          <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
            <div className="bg-slate-900/95 border border-slate-700 rounded-2xl p-8 max-w-md text-center overlay-in">
              <h2
                className={`text-3xl font-bold mb-2 ${
                  state.phase === "victory"
                    ? "text-amber-300 title-victory"
                    : "text-red-400 title-defeat"
                }`}
              >
                {state.phase === "victory" ? "BASTIONS HOLD" : "PROTOCOL FAILED"}
              </h2>
              <p className="text-slate-400 mb-6">Final Score: {state.score}</p>
              <button
                onClick={startGame}
                className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition btn-action"
              >
                Restart Protocol
              </button>
            </div>
          </div>
        )}

        {/* BATTLEFIELD */}
        <div className="mb-4">
          <Battlefield
            state={state}
            selectedTower={state.selectedTower}
            onSelectTower={(id) => {
              sounds.select();
              setState((s) => ({ ...s, selectedTower: id }));
            }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
          <TowerCard
            tower={state.towers.A}
            selected={state.selectedTower === "A"}
            selectedLayer={state.selectedLayer}
            onSelect={() => {
              sounds.select();
              setState((s) => ({ ...s, selectedTower: "A" }));
            }}
            onSelectLayer={(id) => {
              sounds.click();
              setState((s) => ({ ...s, selectedLayer: id, selectedTower: "A" }));
            }}
          />

          <div className="space-y-3">
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <span className="text-xs text-slate-500">Tunnel Network</span>
              <span
                className={`text-xs font-semibold uppercase ${
                  state.tunnelStatus === "open"
                    ? "text-emerald-400"
                    : state.tunnelStatus === "contested"
                    ? "text-amber-400"
                    : "text-red-400"
                }`}
              >
                {state.tunnelStatus}
              </span>
            </div>
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 h-36 overflow-y-auto">
              <h3 className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">
                Nexus Log
              </h3>
              <div className="space-y-1">
                {state.log.map((line, i) => (
                  <p
                    key={`${i}-${line.slice(0, 12)}`}
                    className="text-[11px] text-slate-400 leading-snug log-entry"
                  >
                    <span className="text-slate-600 mr-1">›</span>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <TowerCard
            tower={state.towers.B}
            selected={state.selectedTower === "B"}
            selectedLayer={state.selectedLayer}
            onSelect={() => {
              sounds.select();
              setState((s) => ({ ...s, selectedTower: "B" }));
            }}
            onSelectLayer={(id) => {
              sounds.click();
              setState((s) => ({ ...s, selectedLayer: id, selectedTower: "B" }));
            }}
          />
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
          <div className="text-[10px] text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Actions — Bastion {state.selectedTower}
            {state.selectedLayer ? (
              <span className="text-blue-400/80 normal-case">· {state.selectedLayer}</span>
            ) : (
              <span className="text-slate-600 normal-case">(select layer)</span>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              disabled={
                !running ||
                !state.selectedLayer ||
                state.resources < 15 ||
                state.phase === "victory" ||
                state.phase === "defeat"
              }
              onClick={handleRepair}
              className="btn-action px-3 py-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800/50 text-emerald-200 text-sm hover:bg-emerald-900/50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <div className="font-medium">Repair</div>
              <div className="text-[10px] opacity-60">15 res</div>
            </button>
            <button
              disabled={
                !running ||
                state.towers[state.selectedTower].energy < 25 ||
                state.phase === "victory" ||
                state.phase === "defeat"
              }
              onClick={handleFire}
              className="btn-action px-3 py-2.5 rounded-lg bg-red-950/60 border border-red-800/50 text-red-200 text-sm hover:bg-red-900/50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <div className="font-medium">Fire</div>
              <div className="text-[10px] opacity-60">25 energy</div>
            </button>
            <button
              disabled={
                !running ||
                state.tunnelStatus === "collapsed" ||
                state.resources < 5 ||
                state.phase === "victory" ||
                state.phase === "defeat"
              }
              onClick={handleTransfer}
              className="btn-action px-3 py-2.5 rounded-lg bg-blue-950/60 border border-blue-800/50 text-blue-200 text-sm hover:bg-blue-900/50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <div className="font-medium">Transfer</div>
              <div className="text-[10px] opacity-60">5 res</div>
            </button>
            <button
              disabled={
                !running ||
                state.resources < 25 ||
                state.towers[state.selectedTower].weaponsOnline >= 5 ||
                state.phase === "victory" ||
                state.phase === "defeat"
              }
              onClick={handleBoost}
              className="btn-action px-3 py-2.5 rounded-lg bg-amber-950/60 border border-amber-800/50 text-amber-200 text-sm hover:bg-amber-900/50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <div className="font-medium">Boost</div>
              <div className="text-[10px] opacity-60">25 res</div>
            </button>
          </div>
        </div>

        <footer className="mt-6 text-center text-[10px] text-slate-600">
          Twin Bastions · Next.js + Tauri · From the dream
        </footer>
      </div>
    </main>
  );
}

function TowerCard({
  tower,
  selected,
  selectedLayer,
  onSelect,
  onSelectLayer,
}: {
  tower: GameState["towers"]["A"];
  selected: boolean;
  selectedLayer: LayerId | null;
  onSelect: () => void;
  onSelectLayer: (id: LayerId) => void;
}) {
  const core = tower.layers.find((l) => l.id === "core");
  const coreAlive = core && !core.destroyed && core.hp > 0;
  const energyPct = (tower.energy / tower.maxEnergy) * 100;

  return (
    <div
      onClick={onSelect}
      className={`rounded-xl border-2 p-3 cursor-pointer transition-all ${
        selected
          ? "border-blue-500/80 bg-slate-900/80 tower-selected"
          : "border-slate-800 bg-slate-900/60 hover:border-slate-600"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-bold text-slate-100 text-sm tracking-wide">{tower.name}</h2>
        <span
          className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
            coreAlive
              ? "bg-emerald-900/60 text-emerald-300"
              : "bg-red-900/60 text-red-300"
          }`}
        >
          {coreAlive ? "CORE" : "LOST"}
        </span>
      </div>

      <div className="space-y-1.5 mb-3">
        {LAYER_ORDER.map((id) => {
          const layer = tower.layers.find((l) => l.id === id)!;
          const pct = layer.destroyed ? 0 : (layer.hp / layer.maxHp) * 100;
          const isSel = selected && selectedLayer === id;

          return (
            <div
              key={id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectLayer(id);
              }}
              className={`rounded p-1.5 border transition-all ${
                isSel
                  ? "border-blue-500 bg-blue-950/40"
                  : layer.destroyed
                  ? "border-transparent layer-destroyed"
                  : "border-transparent hover:bg-slate-800/60"
              }`}
            >
              <div className="flex justify-between text-[10px] mb-1">
                <span className={layer.destroyed ? "text-red-400/70 line-through" : "text-slate-400"}>
                  {layer.name}
                </span>
                <span className="text-slate-500 font-mono tabular-nums">
                  {layer.destroyed ? "—" : `${Math.ceil(layer.hp)}`}
                </span>
              </div>
              <div className="h-1.5 bg-slate-800/80 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full hp-bar ${
                    layer.destroyed
                      ? "bg-red-900"
                      : pct > 55
                      ? "bg-gradient-to-r from-emerald-600 to-emerald-400"
                      : pct > 25
                      ? "bg-gradient-to-r from-amber-600 to-amber-400"
                      : "bg-gradient-to-r from-red-600 to-red-400"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div className="bg-slate-950/60 rounded p-1.5 border border-slate-800/60">
          <div className="text-slate-500">Weapons</div>
          <div className="font-mono text-slate-200">{tower.weaponsOnline}</div>
        </div>
        <div className="bg-slate-950/60 rounded p-1.5 border border-slate-800/60">
          <div className="text-slate-500 flex justify-between">
            <span>Energy</span>
            <span className="font-mono text-slate-400">{Math.floor(tower.energy)}</span>
          </div>
          <div className="h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-600 to-blue-400 energy-bar rounded-full"
              style={{ width: `${energyPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
