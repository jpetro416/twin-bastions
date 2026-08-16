"use client";

import { GameState, Colossus, LAYER_ORDER } from "@/lib/gameTypes";

interface Props {
  state: GameState;
  selectedTower: "A" | "B";
  onSelectTower: (id: "A" | "B") => void;
}

export default function Battlefield({ state, selectedTower, onSelectTower }: Props) {
  const living = state.colossi.filter((c) => c.status !== "destroyed");

  return (
    <div className="relative w-full h-[300px] md:h-[340px] rounded-xl overflow-hidden border border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 shadow-inner">
      {/* Sky / atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(30,58,95,0.25)_0%,_transparent_60%)]" />
      <div className="absolute inset-0 opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjAuOCIgZmlsbD0iIzMzNDE1NSIvPjwvc3ZnPg==')]" />

      {/* Ground plane */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-950 via-slate-900/90 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800/80" />

      {/* Distant ruins */}
      <div className="absolute bottom-8 left-[8%] w-16 h-10 bg-slate-800/40 rounded-sm skew-x-6 opacity-40" />
      <div className="absolute bottom-10 right-[12%] w-20 h-8 bg-slate-800/30 rounded-sm -skew-x-3 opacity-30" />

      {/* Tunnel / Nexus */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
        <div className="text-[9px] uppercase tracking-widest text-slate-500 mb-0.5">Nexus</div>
        <div className="flex items-center gap-1">
          <div className="w-8 h-0.5 bg-cyan-700/60" />
          <div className={`w-3 h-3 rounded-full border-2 ${
            state.tunnelStatus === "open" ? "border-emerald-400 bg-emerald-900/60" :
            state.tunnelStatus === "contested" ? "border-amber-400 bg-amber-900/60" :
            "border-red-400 bg-red-900/60"
          }`} />
          <div className="w-8 h-0.5 bg-cyan-700/60" />
        </div>
      </div>

      <TowerVisual
        tower={state.towers.A}
        side="left"
        selected={selectedTower === "A"}
        onSelect={() => onSelectTower("A")}
      />

      <TowerVisual
        tower={state.towers.B}
        side="right"
        selected={selectedTower === "B"}
        onSelect={() => onSelectTower("B")}
      />

      {living.map((c, idx) => (
        <ColossusEntity key={c.id} colossus={c} index={idx} />
      ))}

      {living.length === 0 && state.phase !== "victory" && state.phase !== "defeat" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-slate-600 text-sm tracking-wide">
            {state.phase === "pause" ? "Awaiting Colossus signatures\u2026" : "Battlefield clear"}
          </p>
        </div>
      )}
    </div>
  );
}

function TowerVisual({
  tower,
  side,
  selected,
  onSelect,
}: {
  tower: GameState["towers"]["A"];
  side: "left" | "right";
  selected: boolean;
  onSelect: () => void;
}) {
  const core = tower.layers.find((l) => l.id === "core");
  const coreAlive = core && !core.destroyed && core.hp > 0;

  return (
    <div
      onClick={onSelect}
      className={`absolute bottom-6 ${side === "left" ? "left-3 md:left-6" : "right-3 md:right-6"} 
        w-20 md:w-24 cursor-pointer transition-all z-20 group
        ${selected ? "scale-105" : "hover:scale-105"}`}
    >
      {selected && (
        <div className="absolute -inset-2 rounded-lg border border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.3)] pointer-events-none" />
      )}

      <div className="relative flex flex-col-reverse items-center">
        {LAYER_ORDER.map((id, i) => {
          const layer = tower.layers.find((l) => l.id === id)!;
          const alive = !layer.destroyed && layer.hp > 0;
          const pct = alive ? layer.hp / layer.maxHp : 0;
          const height = 14 + i * 2;

          return (
            <div
              key={id}
              className={`w-full rounded-sm border transition-all duration-300 ${
                !alive
                  ? "bg-red-950/70 border-red-900/50 opacity-40"
                  : pct > 0.55
                  ? "bg-gradient-to-b from-slate-600 to-slate-700 border-slate-500"
                  : pct > 0.25
                  ? "bg-gradient-to-b from-amber-800/80 to-slate-700 border-amber-700/50"
                  : "bg-gradient-to-b from-red-800/70 to-slate-800 border-red-700/40"
              }`}
              style={{
                height: `${height}px`,
                width: `${70 + i * 8}%`,
                marginBottom: 1,
              }}
            />
          );
        })}

        <div className="w-1.5 h-4 bg-slate-500 rounded-t-sm mb-0.5" />
        <div className={`w-2.5 h-2.5 rounded-full -mt-1 ${
          coreAlive ? "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.7)]" : "bg-red-600"
        }`} />
      </div>

      <div className="mt-2 text-center">
        <div className={`text-[10px] font-bold tracking-wide ${
          selected ? "text-blue-300" : "text-slate-400"
        }`}>
          {tower.id === "A" ? "ALPHA" : "BETA"}
        </div>
        <div className={`text-[9px] ${coreAlive ? "text-emerald-500" : "text-red-400"}`}>
          {coreAlive ? "ONLINE" : "LOST"}
        </div>
      </div>
    </div>
  );
}

function ColossusEntity({ colossus, index }: { colossus: Colossus; index: number }) {
  const c = colossus;
  const isAttacking = c.status === "attacking" || c.position >= 100;
  const isAdvancing = c.status === "advancing";
  const isReconfig = c.status === "reconfiguring";

  let leftPct = 50;
  let bottomPct = 30;
  let scale = 0.85 + (c.position / 100) * 0.35;

  if (c.target === "A") {
    leftPct = 2 + (c.position / 100) * 16;
    bottomPct = 22 + Math.sin((c.position / 100) * Math.PI) * 8;
  } else if (c.target === "B") {
    leftPct = 98 - (c.position / 100) * 16;
    bottomPct = 22 + Math.sin((c.position / 100) * Math.PI) * 8;
  } else {
    leftPct = 42 + (index % 3) * 8;
    bottomPct = 55 - (c.position / 100) * 30;
    scale = 0.7 + (c.position / 100) * 0.5;
  }

  const hpPct = (c.hp / c.maxHp) * 100;

  return (
    <div
      className={`absolute z-30 transition-all duration-1000 ease-linear pointer-events-none
        ${isAttacking ? "colossus-field-attack" : ""}
        ${isAdvancing ? "colossus-field-move" : ""}
        ${isReconfig ? "opacity-70" : ""}
      `}
      style={{
        left: `${leftPct}%`,
        bottom: `${bottomPct}%`,
        transform: `translateX(-50%) scale(${scale})`,
      }}
    >
      <div className="relative flex flex-col items-center">
        <div className={`w-5 h-4 rounded-t-md mb-0.5 border ${
          isAttacking
            ? "bg-red-900 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]"
            : "bg-purple-950 border-purple-600 shadow-[0_0_8px_rgba(168,85,247,0.4)]"
        }`} />

        <div className={`w-14 h-10 rounded-md border relative ${
          isAttacking
            ? "bg-gradient-to-b from-purple-900 to-slate-900 border-purple-500"
            : "bg-gradient-to-b from-slate-800 to-slate-950 border-purple-800"
        }`}>
          <div className={`absolute inset-2 rounded-sm ${
            isAttacking ? "bg-red-600/40 animate-pulse" : "bg-purple-600/30"
          }`} />
          <div className="absolute top-1.5 left-2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_4px_cyan]" />
          <div className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_4px_cyan]" />
        </div>

        <div className="flex gap-3 mt-0.5">
          <div className={`w-2 h-6 rounded-b ${isAttacking ? "bg-purple-800" : "bg-slate-700"}`} />
          <div className={`w-2 h-7 rounded-b ${isAttacking ? "bg-purple-800" : "bg-slate-700"}`} />
          <div className={`w-2 h-6 rounded-b ${isAttacking ? "bg-purple-800" : "bg-slate-700"}`} />
        </div>

        {isAttacking && (
          <div className="absolute -inset-4 rounded-full bg-red-600/20 animate-ping pointer-events-none" />
        )}
      </div>

      <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap flex flex-col items-center">
        <span className="text-[8px] text-purple-300/90 font-medium drop-shadow-md">
          {c.name.replace("Proto-Colossus ", "PC-").replace("Siege Walker ", "SW-").slice(0, 14)}
        </span>
        <div className="w-12 h-1 bg-slate-800 rounded-full mt-0.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-400 transition-all duration-300"
            style={{ width: `${hpPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
