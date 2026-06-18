import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { basename } from "node:path";
import { HookServer } from "../src/hook-server";
import { SessionManager } from "../src/session-manager";
import { State } from "../src/types";
import { renderSessionSlot, type SessionInfo } from "../src/renderers/session-slot-renderer";

let manager: SessionManager;
let server: HookServer;
let baseUrl: string;

const RENDER_STATE: Record<State, string> = {
  [State.DISCONNECTED]: "disconnected",
  [State.IDLE]: "idle",
  [State.PROCESSING]: "processing",
  [State.AWAITING_PERMISSION]: "awaiting_permission",
  [State.AWAITING_ELICITATION]: "awaiting_option",
};

async function start() {
  manager = new SessionManager();
  server = new HookServer(manager, 0, { debugEnabled: true });
  await server.start();
  baseUrl = `http://127.0.0.1:${server.listeningPort}`;
}

async function hook(event: string, payload: object) {
  const res = await fetch(`${baseUrl}/hooks/${event}`, { method: "POST", body: JSON.stringify(payload) });
  if (event !== "PermissionRequest") await res.text();
  return res;
}

function slotSvgFor(s: { state: State; cwd: string; model: string | null }, active: boolean): string {
  const info: SessionInfo = {
    state: RENDER_STATE[s.state],
    agentType: "claude-code",
    projectName: basename(s.cwd),
    modelName: s.model ?? undefined,
  };
  return renderSessionSlot(info, active, 0, undefined, { animated: false });
}

beforeEach(start);
afterEach(async () => {
  await server?.stop();
  manager?.stop();
});

describe("end-to-end: hooks → sessions → AgentDeck slot renderer", () => {
  it("drives real sessions over HTTP and renders the slot wall", async () => {
    await hook("SessionStart", { session_id: "s1", cwd: "/work/web-app", model: "claude-opus-4-8" });
    await hook("SessionStart", { session_id: "s2", cwd: "/work/api-server", model: "claude-sonnet-4-6" });
    await hook("PreToolUse", { session_id: "s1", tool_name: "Bash" });

    const snap = await (await fetch(`${baseUrl}/debug/sessions`)).json();
    expect(snap).toHaveLength(2);
    expect(snap[0]).toMatchObject({ state: State.PROCESSING, cwd: "/work/web-app" });

    const ordered = manager.orderedSessions();
    const k1 = slotSvgFor(ordered[0], true); // active, processing
    const k2 = slotSvgFor(ordered[1], false); // idle

    // Key 1: working → "RUNNING" label, project name, "Running task" footer.
    expect(k1).toContain("RUNNING");
    expect(k1).toContain("web-app");
    expect(k1).toContain("Running task");
    // Key 2: idle → "IDLE" label, project name, aliased model.
    expect(k2).toContain("IDLE");
    expect(k2).toContain("api-server");
    expect(k2).toContain("sonnet 4.6");
  });

  it("pressing slot 2 (focusIndex) retargets the active session", async () => {
    await hook("SessionStart", { session_id: "s1", cwd: "/work/a" });
    await hook("SessionStart", { session_id: "s2", cwd: "/work/b" });
    expect(manager.activeSession?.id).toBe("s1");
    manager.focusIndex(1);
    expect(manager.activeSession?.id).toBe("s2");
  });
});

describe("renderSessionSlot (AgentDeck port)", () => {
  const base: SessionInfo = { state: "idle", agentType: "claude-code", projectName: "proj", modelName: "claude-opus-4-8" };

  it("shows PERMIT? for awaiting states", () => {
    expect(renderSessionSlot({ ...base, state: "awaiting_permission" }, false, 0).includes("PERMIT?")).toBe(true);
  });

  it("draws the claude robot creature watermark (terracotta path)", () => {
    const svg = renderSessionSlot(base, false, 0);
    expect(svg).toContain("M20.998 10.949H24"); // robot creature path
    expect(svg).toContain("#C07058"); // claude brand color
  });

  it("escapes project names to avoid SVG injection", () => {
    const svg = renderSessionSlot({ ...base, projectName: "<script>x</script>" }, false, 0);
    expect(svg).not.toContain("<script>");
    expect(svg).toContain("&lt;script&gt;");
  });

  it("static (animated:false) omits orbiting dash animation", () => {
    const working = renderSessionSlot({ ...base, state: "processing" }, true, 0, undefined, { animated: false });
    expect(working).not.toContain("stroke-dasharray");
  });
});
