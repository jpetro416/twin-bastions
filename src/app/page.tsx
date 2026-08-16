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
  const prevLayers = useRef({
    A: state.towers.A.layers,
    B: state.towers.B.layers,
  });

  useEffect(() => {
    if (!running || state.phase === "victory" || state.phase === "defeat") return;
    const id = setInterval(() => setState((s) => tick(s)), 1000);
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
      if (c.status === "destroyed" && !prevIds.has(c.id)) sounds.destroyColossus();
    });
    prevColossi.current = state.colossi;
    (["A", "B"] as const).forEach((tid) => {
      const prev = prevLayers.current[tid];
      const curr = state.towers[tid].layers;
      curr.forEach((layer, i) => {
        if (layer.destroyed && prev[i] && !prev[i].destroyed) sounds.layerLost();
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

  const t = state.towers[state.selectedTower];
  const ended = state.phase === "victory" || state.phase === "defeat";

  return (
    <main className="fixed inset-0 overflow-hidden bg-[#060a10] text-slate-200">
      {/* FULLSCREEN BATTLEFIELD */}
      <Battlefield
        state={state}
        selectedTower={state.selectedTower}
        onSelectTower={(id) => {
          sounds.select();
          setState((s) => ({ ...s, selectedTower: id }));
        }}
      />

      {/* TOP HUD */}
      <header className="absolute top-0 left-0 right-0 z-40 pointer-events-none">
        <div className="pointer-events-auto mx-auto max-w-6xl px-3 pt-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md border border-slate-800/80 rounded-lg px-3 py-2">
            <div className="w-7 h-7 rounded bg-slate-800 border border-slate-600 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-blue-400">
                <path d="M4 20V10l4-3 4 3 4-3 4 3v10H4z" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight leading-none">Twin Bastions</div>
              <div className="text-[10px] text-slate-500">Colossus Protocol</div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md border border-slate-800/80 rounded-lg px-3 py-2">
            <div className="text-right pr-2 border-r border-slate-700">
              <div className={`text-xs font-semibold uppercase tracking-wider ${phaseClass}`}>
                {state.phase}
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                {ended ? "—" : `${state.phaseTimer}s`}
              </div>
            </div>
            <Stat label="Phase" value={state.phaseNumber} />
            <Stat label="Score" value={state.score} />
            <Stat label="Res" value={state.resources} accent />
          </div>
        </div>
      </header>

      {/* BOTTOM HUD */}
      <footer className="absolute bottom-0 left-0 right-0 z-40 pointer-events-none">
        <div className="pointer-events-auto mx-auto max-w-5xl px-3 pb-3">
          <div className="bg-black/60 backdrop-blur-md border border-slate-800/90 rounded-xl p-3 shadow-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[10px] uppercase tracking-wider text-slate-500">
                Bastion {state.selectedTower}
              </span>
              {LAYER_ORDER.map((id) => {
                const layer = t.layers.find((l) => l.id === id)!;
                const pct = layer.destroyed ? 0 : (layer.hp / layer.maxHp) * 100;
                const sel = state.selectedLayer === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      sounds.click();
                      setState((s) => ({ ...s, selectedLayer: id }));
                    }}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[10px] transition ${
                      sel
                        ? "border-blue-500 bg-blue-950/50 text-blue-200"
                        : "border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-500"
                    }`}
                  >
                    <span className={layer.destroyed ? "line-through opacity-50" : ""}>
                      {layer.name.split(" ")[0]}
                    </span>
                    <span className="font-mono tabular-nums opacity-70">
                      {layer.destroyed ? "—" : Math.ceil(layer.hp)}
                    </span>
                    <span className="w-8 h-1 bg-slate-800 rounded-full overflow-hidden">
                      <span
                        className={`block h-full ${
                          layer.destroyed
                            ? "bg-red-900"
                            : pct > 55
                            ? "bg-emerald-500"
                            : pct > 25
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </span>
                  </button>
                );
              })}
              <div className="ml-auto flex items-center gap-3 text-[10px] text-slate-500">
                <span>
                  WPN <span className="text-slate-200 font-mono">{t.weaponsOnline}</span>
                </span>
                <span>
                  EN <span className="text-cyan-300 font-mono">{Math.floor(t.energy)}</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <ActionBtn
                label="Repair"
                cost="15 res"
                disabled={!running || !state.selectedLayer || state.resources < 15 || ended}
                onClick={handleRepair}
                color="emerald"
              />
              <ActionBtn
                label="Fire"
                cost="25 en"
                disabled={!running || t.energy < 25 || ended}
                onClick={handleFire}
                color="red"
              />
              <ActionBtn
                label="Transfer"
                cost="5 res"
                disabled={
                  !running ||
                  state.tunnelStatus === "collapsed" ||
                  state.resources < 5 ||
                  ended
                }
                onClick={handleTransfer}
                color="blue"
              />
              <ActionBtn
                label="Boost"
                cost="25 res"
                disabled={!running || state.resources < 25 || t.weaponsOnline >= 5 || ended}
                onClick={handleBoost}
                color="amber"
              />
            </div>
          </div>
        </div>
      </footer>

      {!running && state.phaseNumber === 0 && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900/95 border border-slate-700 rounded-2xl p-8 max-w-md text-center shadow-2xl overlay-in mx-4">
            <h2 className="text-2xl font-bold text-slate-100 mb-2">
              Twin Bastions: Colossus Protocol
            </h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Proto-Colossi will march across the field toward your towers.
              Select a bastion, repair layers, and fire before the cores fall.
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

      {ended && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900/95 border border-slate-700 rounded-2xl p-8 max-w-sm text-center overlay-in mx-4">
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
    </main>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="text-right px-1.5">
      <div className="text-[9px] text-slate-500 uppercase">{label}</div>
      <div className={`font-mono text-sm ${accent ? "text-amber-300" : "text-slate-200"}`}>
        {value}
      </div>
    </div>
  );
}

function ActionBtn({
  label,
  cost,
  disabled,
  onClick,
  color,
}: {
  label: string;
  cost: string;
  disabled: boolean;
  onClick: () => void;
  color: "emerald" | "red" | "blue" | "amber";
}) {
  const colors = {
    emerald: "bg-emerald-950/70 border-emerald-800/50 text-emerald-200 hover:bg-emerald-900/60",
    red: "bg-red-950/70 border-red-800/50 text-red-200 hover:bg-red-900/60",
    blue: "bg-blue-950/70 border-blue-800/50 text-blue-200 hover:bg-blue-900/60",
    amber: "bg-amber-950/70 border-amber-800/50 text-amber-200 hover:bg-amber-900/60",
  };
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`btn-action px-2 py-2 rounded-lg border text-sm disabled:opacity-30 disabled:cursor-not-allowed ${colors[color]}`}
    >
      <div className="font-medium leading-tight">{label}</div>
      <div className="text-[10px] opacity-60">{cost}</div>
    </button>
  );
}
