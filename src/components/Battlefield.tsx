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
    <div className="absolute inset-0 overflow-hidden bg-[#060a10]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1220] via-[#0c1524] to-[#080c14]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(59,130,246,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(139,92,246,0.06),transparent_45%)]" />

      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 10% 20%, #64748b 0%, transparent 100%), radial-gradient(1px 1px at 30% 60%, #475569 0%, transparent 100%), radial-gradient(1.5px 1.5px at 50% 15%, #64748b 0%, transparent 100%), radial-gradient(1px 1px at 70% 40%, #475569 0%, transparent 100%), radial-gradient(1px 1px at 85% 70%, #64748b 0%, transparent 100%), radial-gradient(1px 1px at 20% 80%, #334155 0%, transparent 100%)",
          backgroundSize: "100% 100%",
        }}
      />

      <div className="absolute bottom-0 left-0 right-0 h-[28%] bg-gradient-to-t from-[#05080e] via-[#0a1018] to-transparent" />
      <div className="absolute bottom-[26%] left-0 right-0 h-px bg-slate-800/60" />
      <div
        className="absolute bottom-0 left-0 right-0 h-[26%] opacity-20"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(30,41,59,0.4) 40px, rgba(30,41,59,0.4) 41px)",
        }}
      />

      <div className="absolute bottom-[27%] left-[5%] w-24 h-14 bg-slate-900/50 skew-x-12 opacity-50" />
      <div className="absolute bottom-[27%] left-[18%] w-16 h-10 bg-slate-900/40 -skew-x-6 opacity-40" />
      <div className="absolute bottom-[27%] right-[8%] w-28 h-12 bg-slate-900/45 skew-x-[-8deg] opacity-45" />
      <div className="absolute bottom-[27%] right-[22%] w-14 h-8 bg-slate-900/35 opacity-35" />

      <div className="absolute bottom-[26%] left-[22%] right-[22%] h-px bg-gradient-to-r from-transparent via-slate-700/30 to-transparent" />

      <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
        <div className="text-[9px] uppercase tracking-[0.2em] text-slate-600 mb-1">Nexus</div>
        <div className="flex items-center gap-1.5">
          <div className="w-10 h-px bg-cyan-800/50" />
          <div
            className={`w-3.5 h-3.5 rounded-full border-2 shadow-lg ${
              state.tunnelStatus === "open"
                ? "border-emerald-400 bg-emerald-950 shadow-emerald-500/30"
                : state.tunnelStatus === "contested"
                ? "border-amber-400 bg-amber-950 shadow-amber-500/30"
                : "border-red-400 bg-red-950 shadow-red-500/30"
            }`}
          />
          <div className="w-10 h-px bg-cyan-800/50" />
        </div>
      </div>

      <TowerOnField
        tower={state.towers.A}
        side="left"
        selected={selectedTower === "A"}
        onSelect={() => onSelectTower("A")}
      />
      <TowerOnField
        tower={state.towers.B}
        side="right"
        selected={selectedTower === "B"}
        onSelect={() => onSelectTower("B")}
      />

      {living.map((c, idx) => (
        <ColossusOnField key={c.id} colossus={c} index={idx} />
      ))}

      {living.length === 0 && state.phase !== "victory" && state.phase !== "defeat" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-slate-600 text-sm tracking-widest uppercase">
            {state.phase === "pause" ? "Awaiting signatures\u2026" : "Clear"}
          </p>
        </div>
      )}
    </div>
  );
}

function TowerOnField({
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
  const coreAlive = !!(core && !core.destroyed && core.hp > 0);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`absolute bottom-[12%] z-20 flex flex-col items-center transition-transform duration-200
        ${side === "left" ? "left-[6%] md:left-[10%]" : "right-[6%] md:right-[10%]"}
        ${selected ? "scale-110" : "hover:scale-105"}`}
    >
      {selected && (
        <div className="absolute -inset-4 rounded-xl border border-blue-500/40 shadow-[0_0_30px_rgba(59,130,246,0.25)] pointer-events-none" />
      )}

      <div className="relative flex flex-col-reverse items-center">
        {LAYER_ORDER.map((id, i) => {
          const layer = tower.layers.find((l) => l.id === id)!;
          const alive = !layer.destroyed && layer.hp > 0;
          const pct = alive ? layer.hp / layer.maxHp : 0;
          const h = 18 + i * 4;
          const w = 55 + i * 12;

          return (
            <div
              key={id}
              className={`rounded-sm border transition-all duration-500 ${
                !alive
                  ? "bg-red-950/80 border-red-900/60 opacity-35"
                  : pct > 0.55
                  ? "bg-gradient-to-b from-slate-500 to-slate-700 border-slate-400/60"
                  : pct > 0.25
                  ? "bg-gradient-to-b from-amber-700/90 to-slate-700 border-amber-600/50"
                  : "bg-gradient-to-b from-red-800/80 to-slate-800 border-red-600/40"
              }`}
              style={{ height: h, width: w, marginBottom: 2 }}
            />
          );
        })}
        <div className="w-1.5 h-5 bg-slate-500 rounded-t-sm" />
        <div
          className={`w-3 h-3 rounded-full -mt-0.5 ${
            coreAlive
              ? "bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)]"
              : "bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.6)]"
          }`}
        />
      </div>

      <div className="mt-2 text-center">
        <div className={`text-xs font-bold tracking-[0.15em] ${selected ? "text-blue-300" : "text-slate-400"}`}>
          {tower.id === "A" ? "ALPHA" : "BETA"}
        </div>
        <div className={`text-[10px] font-medium ${coreAlive ? "text-emerald-400" : "text-red-400"}`}>
          {coreAlive ? "ONLINE" : "CORE LOST"}
        </div>
      </div>
    </button>
  );
}

function ColossusOnField({ colossus, index }: { colossus: Colossus; index: number }) {
  const c = colossus;
  const isAttacking = c.status === "attacking" || c.position >= 98;
  const isAdvancing = c.status === "advancing";
  const isReconfig = c.status === "reconfiguring";

  let leftPct: number;
  let bottomPct: number;
  let scale: number;

  if (c.target === "A") {
    leftPct = 2 + (c.position / 100) * 12;
    bottomPct = 18 + Math.sin((c.position / 100) * Math.PI) * 10;
    scale = 0.75 + (c.position / 100) * 0.55;
  } else if (c.target === "B") {
    leftPct = 98 - (c.position / 100) * 12;
    bottomPct = 18 + Math.sin((c.position / 100) * Math.PI) * 10;
    scale = 0.75 + (c.position / 100) * 0.55;
  } else {
    leftPct = 40 + (index % 3) * 10;
    bottomPct = 62 - (c.position / 100) * 38;
    scale = 0.65 + (c.position / 100) * 0.6;
  }

  const hpPct = Math.max(0, (c.hp / c.maxHp) * 100);

  return (
    <div
      className={`absolute z-30 pointer-events-none transition-all duration-1000 ease-linear
        ${isAttacking ? "colossus-field-attack" : ""}
        ${isAdvancing ? "colossus-field-move" : ""}
        ${isReconfig ? "opacity-60" : ""}`}
      style={{
        left: `${leftPct}%`,
        bottom: `${bottomPct}%`,
        transform: `translateX(-50%) scale(${scale})`,
      }}
    >
      <div className="absolute -top-9 left-1/2 -translate-x-1/2 flex flex-col items-center whitespace-nowrap">
        <span className="text-[9px] font-semibold text-purple-200/90 drop-shadow">
          {shortName(c.name)}
        </span>
        <div className="w-14 h-1.5 bg-slate-900/90 rounded-full mt-0.5 overflow-hidden border border-slate-700">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-400 transition-all duration-300"
            style={{ width: `${hpPct}%` }}
          />
        </div>
      </div>

      <div className="relative flex flex-col items-center">
        <div
          className={`w-7 h-5 rounded-t-md border mb-0.5 ${
            isAttacking
              ? "bg-red-900 border-red-400 shadow-[0_0_16px_rgba(239,68,68,0.7)]"
              : "bg-purple-950 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
          }`}
        />
        <div
          className={`w-20 h-14 rounded-md border relative ${
            isAttacking
              ? "bg-gradient-to-b from-purple-900 to-slate-950 border-purple-400"
              : "bg-gradient-to-b from-slate-800 to-slate-950 border-purple-700"
          }`}
        >
          <div
            className={`absolute inset-2.5 rounded-sm ${
              isAttacking ? "bg-red-500/30 animate-pulse" : "bg-purple-600/25"
            }`}
          />
          <div className="absolute top-2 left-3 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_cyan]" />
          <div className="absolute top-2 right-3 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_cyan]" />
          <div className="absolute -left-2 top-4 w-3 h-5 bg-slate-700 border border-slate-600 rounded-sm" />
          <div className="absolute -right-2 top-4 w-3 h-5 bg-slate-700 border border-slate-600 rounded-sm" />
        </div>
        <div className="flex gap-4 mt-0.5">
          <div className={`w-2.5 h-9 rounded-b ${isAttacking ? "bg-purple-800" : "bg-slate-700"}`} />
          <div className={`w-2.5 h-11 rounded-b ${isAttacking ? "bg-purple-800" : "bg-slate-700"}`} />
          <div className={`w-2.5 h-9 rounded-b ${isAttacking ? "bg-purple-800" : "bg-slate-700"}`} />
        </div>

        {isAttacking && (
          <div className="absolute -inset-6 rounded-full bg-red-600/15 animate-ping" />
        )}
      </div>
    </div>
  );
}

function shortName(name: string) {
  return name
    .replace("Proto-Colossus ", "PC-")
    .replace("Siege Walker ", "SW-")
    .replace("Tunneling Megaconstruct", "Tunneler")
    .replace("Floating Artillery Platform", "Artillery")
    .replace("Core Reaper", "Reaper")
    .slice(0, 16);
}
