import { action, type KeyAction, type KeyDownEvent, type WillDisappearEvent } from "@elgato/streamdeck";
import { basename } from "node:path";
import { ManagedAction } from "./base";
import { State, type SessionState } from "../types";
import { svgDataUri } from "../util/svg";
import { renderSessionSlot, renderEmptySlot, type SessionInfo } from "../renderers/session-slot-renderer";

/** Map agentsd's state enum to AgentDeck's lowercase renderer state strings. */
const RENDER_STATE: Record<State, string> = {
  [State.DISCONNECTED]: "disconnected",
  [State.IDLE]: "idle",
  [State.PROCESSING]: "processing",
  [State.AWAITING_PERMISSION]: "awaiting_permission",
  [State.AWAITING_ELICITATION]: "awaiting_option",
};

/** Frame interval for the orbiting-border animation (~10fps). */
const ANIM_INTERVAL_MS = 100;

/**
 * Session Slot — one physical key shows one session, using AgentDeck's full
 * session-slot renderer (creature watermark, gradient card, animated orbiting
 * state border, active ring). Keys auto-map to slot index by position
 * (top→bottom, left→right). Pressing a key makes that session active.
 */
@action({ UUID: "com.paultyng.agentsd.session-slot" })
export class SessionSlot extends ManagedAction {
  private animFrame = 0;
  private ticker: ReturnType<typeof setInterval> | null = null;

  /** Visible key instances of this action, ordered by physical position. */
  private orderedKeys(): KeyAction[] {
    const keys: KeyAction[] = [];
    for (const act of this.actions) {
      if (act.isKey() && act.coordinates) keys.push(act);
    }
    keys.sort((a, b) => {
      const ca = a.coordinates!;
      const cb = b.coordinates!;
      return ca.row - cb.row || ca.column - cb.column;
    });
    return keys;
  }

  override onKeyDown(ev: KeyDownEvent): void {
    const idx = this.orderedKeys().findIndex((k) => k.id === ev.action.id);
    if (idx >= 0) this.manager?.focusIndex(idx);
  }

  override onWillDisappear(_ev: WillDisappearEvent): void {
    this.render();
  }

  /** Paint every slot key at the current animation frame. */
  private draw(): boolean {
    const keys = this.orderedKeys();
    const activeIndex = this.manager?.activeIndex ?? -1;
    let needsAnim = false;

    keys.forEach((act, slot) => {
      const session: SessionState | undefined = this.manager?.sessionAt(slot);
      if (!session) {
        act.setImage(svgDataUri(renderEmptySlot()));
        return;
      }
      const info: SessionInfo = {
        state: RENDER_STATE[session.state],
        agentType: "claude-code",
        projectName: basename(session.cwd),
        modelName: session.model ?? undefined,
      };
      if (session.state === State.PROCESSING || session.state === State.AWAITING_PERMISSION || session.state === State.AWAITING_ELICITATION || slot === activeIndex) {
        needsAnim = true;
      }
      act.setImage(svgDataUri(renderSessionSlot(info, slot === activeIndex, this.animFrame, undefined, { animated: true })));
    });

    return needsAnim && keys.length > 0;
  }

  protected render(): void {
    const needsAnim = this.draw();
    if (needsAnim && !this.ticker) {
      this.ticker = setInterval(() => {
        this.animFrame++;
        if (!this.draw() && this.ticker) {
          clearInterval(this.ticker);
          this.ticker = null;
        }
      }, ANIM_INTERVAL_MS);
    } else if (!needsAnim && this.ticker) {
      clearInterval(this.ticker);
      this.ticker = null;
    }
  }
}
