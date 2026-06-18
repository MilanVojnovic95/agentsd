# agentsd — Stream Deck Mini (Discord Edition)

Turn an **Elgato Stream Deck Mini** into a **Claude Code controller**: live session previews on the keys, and approve / deny / always-allow permission prompts straight from hardware buttons.

This is a Stream Deck **Mini** adaptation of [`paultyng/agentsd`](https://github.com/paultyng/agentsd), with the on-key visuals (creature, gradient cards, animated state borders) ported from [`puritysb/AgentDeck`](https://github.com/puritysb/AgentDeck). The original AgentDeck plugin in [Go Ando's post](https://github.com/puritysb/AgentDeck) only supports the Stream Deck **+** (it relies on the 4 encoders and the LCD touchstrip). The Mini has just 6 keys and no dials/touchscreen — so this fork keeps the part that fits: **live key previews + button-based permission control.**

## What it looks like

A typical 6-key layout on the Mini:

```
┌─────────┬─────────┬─────────┐
│ Slot 1  │ Slot 2  │ Slot 3  │   ← live session previews (state, project, model)
├─────────┼─────────┼─────────┤
│ APPROVE │ ALWAYS  │  DENY   │   ← resolve the active permission prompt
└─────────┴─────────┴─────────┘
```

Each **Session Slot** key auto-maps to its physical position (top→bottom, left→right) and shows one Claude session: state-colored card, the Claude robot creature, project name, model, and an animated orbiting border when the session is working or waiting. Pressing a slot makes that session active, so **Approve / Always / Deny** target it.

## Requirements

- **macOS 13+**
- **Stream Deck app 6.6+** with a **Stream Deck Mini** (Discord Edition or standard — identical to the SDK)
- **Node.js 20+** *(for building/testing; the plugin itself runs on Stream Deck's bundled Node 20)*
- **Claude Code** with [HTTP hooks](https://code.claude.com/docs/en/hooks-guide) support

## Install

```sh
git clone https://github.com/MilanVojnovic95/agentsd.git && cd agentsd
npm install
npm install -g @elgato/cli        # one-time; provides the `streamdeck` CLI
npm run build
npm run link                      # register the plugin with the Stream Deck app
npm run hooks:install             # add Claude Code HTTP hooks to ~/.claude/settings.json
```

Restart the Stream Deck app. Under the **"Claude Code"** category, drag **Session Slot** onto your top-row keys and **Approve / Always / Deny** onto the bottom row. Start any Claude Code session and the keys come alive.

### Rebuild after changes

```sh
npm run build && streamdeck restart com.paultyng.agentsd
```

### Uninstall

```sh
npm run hooks:uninstall           # remove hooks from ~/.claude/settings.json
npm run unlink                    # unregister the plugin
```

## How it works

```
Claude Code HTTP hooks → local server (127.0.0.1:9200) → SessionManager → Stream Deck key images
```

Claude Code posts lifecycle events (SessionStart, PreToolUse, Stop, PermissionRequest, …) to a small local server. `PermissionRequest` hooks hold the HTTP response open (up to 120 s) so a button press can approve or deny. No bridge daemon, no PTY parsing.

## Actions

| Action | Description |
|--------|-------------|
| **Session Slot** | One session per key (auto-mapped by position). Live state card with creature, project, model, animated border. Press to make active. |
| **Session** | Single active session, press to cycle. |
| **Approve** | Approve the active session's pending permission. |
| **Always** | Approve and add a session-scoped allow rule for the tool. |
| **Deny** | Deny the pending permission. |
| **Status** | Current state (Working / Permission? / Question? / Idle / Error). |
| **Mode** | Permission mode + model. |
| **Stop** | Send an interrupt (Ctrl+C / SIGINT) to the active session. |
| **Focus** | Bring Ghostty (or Claude Desktop) to the foreground. |

## Session states

| State | Color | Meaning |
|-------|-------|---------|
| `IDLE` | green | Connected, waiting for input |
| `RUNNING` | blue | Tool execution in progress |
| `PERMIT?` | amber | Permission prompt — approve/deny from the deck |
| `disconnected` | gray | No active session |

## What's different from the Stream Deck+ original

- **6 keys, no encoders/touchstrip.** No dial-based session scrolling or the LCD multi-option plan dialog. Permission approval is button-based (Approve / Always / Deny).
- **Added a `Session Slot` keypad action** that maps each session to a physical key (the "wall of sessions" view), plus `SessionManager.sessionAt / orderedSessions / focusIndex`.
- **Ported AgentDeck's SVG renderers** (`src/renderers/`): creature logos, the full session-slot card with animated orbiting borders, and status cards — brightened for the Mini's display.

## Development

```sh
npm run watch        # rebuild on change
npm run dev          # Stream Deck dev mode
npm test             # unit + integration + e2e (Node 20+)
```

## Credits & licenses

- Base plugin: [`paultyng/agentsd`](https://github.com/paultyng/agentsd) — MIT.
- On-key visuals (creature language, session-slot & status-card renderers, color palette) ported from [`puritysb/AgentDeck`](https://github.com/puritysb/AgentDeck) — MIT © 2025 SerendipityBound. Attribution retained in each ported file under `src/renderers/`.
- Inspiration: the terminal-side fleet manager [`asheshgoplani/agent-deck`](https://github.com/asheshgoplani/agent-deck).

Released under the MIT License (see [LICENSE](LICENSE)).
