# Twin Bastions: Colossus Protocol

A cooperative-style layered tower defense game born from a dream.

Two fortified towers connected by a tunnel network through the old Academy Nexus. Proto-Colossi the size of mountains slowly grind the buildings down layer by layer. You get deliberate pause windows to repair, re-arm, and transfer resources between the twin bastions.

## Concept

- **Two Bastions** (Alpha & Beta), each with four structural layers: Outer Shell → Mid Structure → Inner Systems → Core Bastion.
- **Proto-Colossi** advance, attack, then enter reconfiguration pauses.
- During pauses (and even during assault) you can:
  - Repair individual layers
  - Fire the tower weapons at the machines
  - Transfer energy through the tunnels
  - Bring additional weapon batteries online
- Keep at least one Core alive. Destroy enough Colossi across phases to claim victory.

## Visuals & Audio (Enhanced)

- Animated grid background + atmospheric glow
- Phase-aware pulsing text (assault red / pause green)
- Colossus cards pulse and glow while attacking; subtle advance animation while approaching
- Smooth HP / approach / energy bars with gradient fills
- Mini building silhouette on each tower card that reflects layer health
- Layer collapse animation on destruction
- Selected tower glow + button press feedback
- **Synthesized sound effects** via Web Audio API (no external files):
  - Weapon fire, repair, transfer, boost
  - Phase transitions (assault / pause)
  - Colossus destroyed, layer lost
  - Victory fanfare / defeat dirge
  - UI select / click

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Desktop**: Tauri 2 (Rust)
- Static export so the Next.js build feeds directly into the Tauri webview.

## Quick Start (Web)

```bash
git clone https://github.com/jpetro416/twin-bastions.git
cd twin-bastions
npm install
npm run dev
```

Open http://localhost:3000  
(Click / interact once to unlock audio in the browser.)

## Desktop (Tauri)

```bash
# Prerequisites: Rust + Tauri system deps
# https://v2.tauri.app/start/prerequisites/

npm install
npm run tauri:dev
```

## Game Controls

1. Click **Initialize Protocol**
2. Select a Bastion (Alpha or Beta)
3. Click a layer to target it for repair
4. Use the action buttons
5. Survive assault phases, use the pause windows wisely

## Project Structure

```
twin-bastions/
├── src/
│   ├── app/           # UI + styles
│   └── lib/
│       ├── gameTypes.ts
│       ├── gameEngine.ts
│       └── sounds.ts     # Web Audio SFX
├── src-tauri/         # Tauri / Rust shell
└── ...
```

## Roadmap / Future

- Multiplayer / co-op roles
- More distinct Colossus types
- Canvas / particle destruction effects
- Persistent scar map across runs
- Companion characters from the original dream

---

Built from a dream about machines attacking two buildings, tunnels under an old high school, pauses that let the defenders breathe, and friends fighting side-by-side.

**Joe Petro / @JoeRamb0t**
