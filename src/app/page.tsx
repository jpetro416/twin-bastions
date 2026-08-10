"use client";

import { useState, useEffect, useCallback } from "react";
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

export default function Home() {
  const [state, setState] = useState<GameState>(createInitialState);
  const [running, setRunning] = useState(false);

  // Game loop
  useEffect(() => {
    if (!running || state.phase === "victory" || state.phase === "defeat") return;
    const id = setInterval(() => {
      setState((s) => tick(s));
    }, 1000);
    return () => clearInterval(id);
  }, [running, state.phase]);

  const startGame = () => {
    setState(createInitialState());
    setRunning(true);
  };

  const handleRepair = useCallback(() => {
    if (!state.selectedLayer) return;
    setState((s) => repairLayer(s, s.selectedTower, s.selectedLayer!));
  }, [state.selectedLayer]);

  const handleFire = useCallback(() => {
    setState((s) => fireWeapons(s, s.selectedTower));
  }, []);

  const handleTransfer = useCallback(() => {
    setState((s) => transferResources(s, s.selectedTower));
  }, []);

  const handleBoost = useCallback(() => {
    setState((s) => boostWeapons(s, s.selectedTower));
  }, []);

  const phaseColor =
    state.phase === "assault"
      ? "text-red-400"
      : state.phase === "pause"
      ? "text-emerald-400"
      : state.phase === "victory"
      ? "text-amber-300"
      : "text-red-500";

  return (
    <main className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-bastion-border pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100">
            Twin Bastions
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Colossus Protocol · Layered Defense
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className={`text-sm font-semibold uppercase tracking-wider ${phaseColor}`}>
              {state.phase}
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {state.phase === "victory" || state.phase === "defeat"
                ? "—"
                : `${state.phaseTimer}s remaining`}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">Phase</div>
            <div className="font-mono text-slate-200">{state.phaseNumber}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">Score</div>
            <div className="font-mono text-slate-200">{state.score}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">Resources</div>
            <div className="font-mono text-amber-300">{state.resources}</div>
          </div>
        </div>
      </header>

      {/* Start / End overlays */}
      {!running && state.phaseNumber === 0 && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6">
          <div className="bg-bastion-panel border border-bastion-border rounded-xl p-8 max-w-lg text-center shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-100 mb-2">
              Twin Bastions: Colossus Protocol
            </h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Two towers. One tunnel network. Proto-Colossi the size of mountains.
              Defend the layers. Use the pauses. Keep at least one Core standing.
            </p>
            <button
              onClick={startGame}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition"
            >
              Initialize Protocol
            </button>
          </div>
        </div>
      )}

      {(state.phase === "victory" || state.phase === "defeat") && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6">
          <div className="bg-bastion-panel border border-bastion-border rounded-xl p-8 max-w-md text-center">
            <h2
              className={`text-3xl font-bold mb-2 ${
                state.phase === "victory" ? "text-amber-300" : "text-red-400"
              }`}
            >
              {state.phase === "victory" ? "BASTIONS HOLD" : "PROTOCOL FAILED"}
            </h2>
            <p className="text-slate-400 mb-4">Final Score: {state.score}</p>
            <button
              onClick={startGame}
              className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
            >
              Restart Protocol
            </button>
          </div>
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Tower A */}
        <TowerCard
          tower={state.towers.A}
          selected={state.selectedTower === "A"}
          selectedLayer={state.selectedLayer}
          onSelect={() => setState((s) => ({ ...s, selectedTower: "A" }))}
          onSelectLayer={(id) =>
            setState((s) => ({ ...s, selectedLayer: id, selectedTower: "A" }))
          }
        />

        {/* Center: Colossi + Tunnel + Log */}
        <div className="space-y-4">
          <div className="bg-bastion-panel border border-bastion-border rounded-lg p-4">
            <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-3">
              Proto-Colossi
            </h3>
            {state.colossi.length === 0 ? (
              <p className="text-slate-600 text-sm italic">No signatures</p>
            ) : (
              <div className="space-y-3">
                {state.colossi.map((c) => (
                  <div
                    key={c.id}
                    className={`rounded border p-2.5 ${
                      c.status === "destroyed"
                        ? "border-slate-700 opacity-50"
                        : "border-purple-800/50 bg-purple-950/20"
                    }`}
                  >
                    <div className="flex justify-between text-sm">
                      <span
                        className={
                          c.status === "destroyed"
                            ? "line-through text-slate-500"
                            : "text-purple-200"
                        }
                      >
                        {c.name}
                      </span>
                      {c.status !== "destroyed" && (
                        <span className="font-mono text-xs text-purple-300">
                          {Math.ceil(c.hp)}
                        </span>
                      )}
                    </div>
                    {c.status !== "destroyed" && (
                      <>
                        <div className="h-1 bg-slate-800 rounded mt-1.5 overflow-hidden">
                          <div
                            className="h-full bg-purple-500"
                            style={{ width: `${(c.hp / c.maxHp) * 100}%` }}
                          />
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                          <span>{c.status}</span>
                          <div className="flex-1 h-0.5 bg-slate-800 rounded">
                            <div
                              className="h-full bg-amber-500"
                              style={{ width: `${c.position}%` }}
                            />
                          </div>
                          <span>→ {c.target}</span>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-bastion-panel border border-bastion-border rounded-lg p-3 flex items-center justify-between">
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

          <div className="bg-bastion-panel border border-bastion-border rounded-lg p-3 h-40 overflow-y-auto">
            <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-2">
              Nexus Log
            </h3>
            <div className="space-y-1">
              {state.log.map((line, i) => (
                <p key={i} className="text-xs text-slate-400 leading-snug">
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Tower B */}
        <TowerCard
          tower={state.towers.B}
          selected={state.selectedTower === "B"}
          selectedLayer={state.selectedLayer}
          onSelect={() => setState((s) => ({ ...s, selectedTower: "B" }))}
          onSelectLayer={(id) =>
            setState((s) => ({ ...s, selectedLayer: id, selectedTower: "B" }))
          }
        />
      </div>

      {/* Action bar */}
      <div className="bg-bastion-panel border border-bastion-border rounded-lg p-4">
        <div className="text-xs text-slate-500 mb-3 uppercase tracking-wider">
          Actions — Bastion {state.selectedTower}
          {state.selectedLayer ? ` · ${state.selectedLayer}` : " (select a layer)"}
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
            className="px-3 py-2.5 rounded bg-emerald-900/40 border border-emerald-800/50 text-emerald-200 text-sm hover:bg-emerald-800/50 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            Repair Layer
            <div className="text-[10px] opacity-70">15 resources</div>
          </button>
          <button
            disabled={
              !running ||
              state.towers[state.selectedTower].energy < 25 ||
              state.phase === "victory" ||
              state.phase === "defeat"
            }
            onClick={handleFire}
            className="px-3 py-2.5 rounded bg-red-900/40 border border-red-800/50 text-red-200 text-sm hover:bg-red-800/50 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            Fire Weapons
            <div className="text-[10px] opacity-70">25 energy</div>
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
            className="px-3 py-2.5 rounded bg-blue-900/40 border border-blue-800/50 text-blue-200 text-sm hover:bg-blue-800/50 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            Tunnel Transfer
            <div className="text-[10px] opacity-70">5 res · move energy</div>
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
            className="px-3 py-2.5 rounded bg-amber-900/40 border border-amber-800/50 text-amber-200 text-sm hover:bg-amber-800/50 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            Boost Weapons
            <div className="text-[10px] opacity-70">25 resources</div>
          </button>
        </div>
      </div>

      <footer className="mt-8 text-center text-xs text-slate-600">
        Twin Bastions: Colossus Protocol · Built with Next.js + Tauri · From the dream
      </footer>
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

  return (
    <div
      onClick={onSelect}
      className={`rounded-lg border-2 p-4 cursor-pointer transition-all ${
        selected
          ? "border-blue-500 bg-bastion-panel shadow-lg shadow-blue-900/20"
          : "border-bastion-border bg-bastion-panel/70 hover:border-slate-600"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-slate-100 tracking-wide">{tower.name}</h2>
        <span
          className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
            coreAlive
              ? "bg-emerald-900/50 text-emerald-300"
              : "bg-red-900/50 text-red-300"
          }`}
        >
          {coreAlive ? "CORE ONLINE" : "CORE LOST"}
        </span>
      </div>

      <div className="space-y-2 mb-4">
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
              className={`rounded p-2 border transition ${
                isSel
                  ? "border-blue-500 bg-blue-950/30"
                  : "border-transparent hover:bg-slate-800/50"
              }`}
            >
              <div className="flex justify-between text-xs mb-1">
                <span
                  className={
                    layer.destroyed
                      ? "text-red-400/80 line-through"
                      : "text-slate-300"
                  }
                >
                  {layer.name}
                </span>
                <span className="text-slate-500 font-mono">
                  {layer.destroyed
                    ? "LOST"
                    : `${Math.ceil(layer.hp)}/${layer.maxHp}`}
                </span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded overflow-hidden">
                <div
                  className={`h-full transition-all ${
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
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-900/50 rounded p-2">
          <div className="text-slate-500">Weapons</div>
          <div className="font-mono text-slate-200">{tower.weaponsOnline}</div>
        </div>
        <div className="bg-slate-900/50 rounded p-2">
          <div className="text-slate-500">Energy</div>
          <div className="font-mono text-slate-200">
            {Math.floor(tower.energy)}/{tower.maxEnergy}
          </div>
        </div>
      </div>
    </div>
  );
}
