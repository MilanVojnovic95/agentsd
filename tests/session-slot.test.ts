import { describe, it, expect, afterEach } from "vitest";
import { SessionManager } from "../src/session-manager";
import { State } from "../src/types";

const A = "sess-aaaa";
const B = "sess-bbbb";
const C = "sess-cccc";

describe("SessionManager slot accessors", () => {
  let m: SessionManager;
  afterEach(() => m?.stop());

  it("orderedSessions / sessionAt return sessions in insertion order", () => {
    m = new SessionManager();
    m.handleEvent("SessionStart", { session_id: A, cwd: "/work/web-app" });
    m.handleEvent("SessionStart", { session_id: B, cwd: "/work/api" });

    const ordered = m.orderedSessions();
    expect(ordered.map((s) => s.id)).toEqual([A, B]);
    expect(m.sessionAt(0)?.id).toBe(A);
    expect(m.sessionAt(1)?.id).toBe(B);
    expect(m.sessionAt(2)).toBeUndefined();
  });

  it("focusIndex makes the slot's session active so Approve/Deny target it", () => {
    m = new SessionManager();
    m.handleEvent("SessionStart", { session_id: A });
    m.handleEvent("SessionStart", { session_id: B });
    m.handleEvent("SessionStart", { session_id: C });
    expect(m.activeIndex).toBe(0);

    m.focusIndex(2);
    expect(m.activeIndex).toBe(2);
    expect(m.activeSession?.id).toBe(C);
  });

  it("focusIndex ignores out-of-range and empty indices", () => {
    m = new SessionManager();
    m.handleEvent("SessionStart", { session_id: A });
    m.focusIndex(5);
    expect(m.activeIndex).toBe(0);
    m.focusIndex(-1);
    expect(m.activeIndex).toBe(0);
  });

  it("emits activeSessionChanged when focusIndex moves the active slot", () => {
    m = new SessionManager();
    m.handleEvent("SessionStart", { session_id: A });
    m.handleEvent("SessionStart", { session_id: B });
    let fired = 0;
    m.on("activeSessionChanged", () => fired++);
    m.focusIndex(1);
    expect(fired).toBe(1);
    m.focusIndex(1); // already active — no re-emit
    expect(fired).toBe(1);
  });
});
