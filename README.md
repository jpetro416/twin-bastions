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

Teamwork is critical in the full vision (multiplayer / roles). This prototype is a fully playable single-player loop that captures the dual-structure, progressive destruction, pause cadence, and tunnel logistics.

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Desktop**: Tauri 2 (Rust)
- Static export so the Next.js build feeds directly into the Tauri webview.

## Quick Start (Web)

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Desktop (Tauri)

```bash
# Prerequisites: Rust (rustup), system dependencies for Tauri
# https://v2.tauri.app/start/prerequisites/

npm install
npm run tauri:dev
```

To produce a release build:

```bash
npm run tauri:build
```

## Game Controls

1. Click **Initialize Protocol**
2. Select a Bastion (Alpha or Beta)
3. Click a layer to target it for repair
4. Use the action buttons:
   - **Repair Layer** (15 resources)
   - **Fire Weapons** (25 energy) — damages the active Colossus
   - **Tunnel Transfer** (5 resources) — moves energy to the other tower
   - **Boost Weapons** (25 resources) — increases firepower
5. Survive assault phases, use the pause windows wisely.

## Project Structure

```
twin-bastions/
├── src/
│   ├── app/           # Next.js pages & layout
│   └── lib/
│       ├── gameTypes.ts
│       └── gameEngine.ts
├── src-tauri/         # Tauri / Rust shell
└── ...
```

## Roadmap / Future

- Multiplayer / co-op roles (engineer, gunner, tunnel runner)
- More distinct Colossus types and behaviors
- Visual destruction of floors / particle effects
- Persistent scar map across runs
- Companion characters and narrative events drawn from the original dream

---

Built from a dream about machines attacking two buildings, tunnels under an old high school, pauses that let the defenders breathe, and friends fighting side-by-side.

**Joe Petro / @JoeRamb0t**
