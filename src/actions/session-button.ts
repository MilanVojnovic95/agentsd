import { action, type KeyDownEvent } from "@elgato/streamdeck";
import { basename } from "node:path";
import { ManagedAction } from "./base";
import { State } from "../types";
import { svgDataUri } from "../util/svg";
import { renderSessionSlot, renderStatusCard, type SessionInfo } from "../renderers/session-slot-renderer";

/** Map agentsd's state enum to AgentDeck's lowercase renderer state strings. */
const RENDER_STATE: Record<State, string> = {
  [State.DISCONNECTED]: "disconnected",
  [State.IDLE]: "idle",
  [State.PROCESSING]: "processing",
  [State.AWAITING_PERMISSION]: "awaiting_permission",
  [State.AWAITING_ELICITATION]: "awaiting_option",
};

@action({ UUID: "com.paultyng.agentsd.session" })
export class SessionButton extends ManagedAction {
  override onKeyDown(_ev: KeyDownEvent): void {
    this.manager?.cycleSession(1);
  }

  protected render(): void {
    const session = this.manager?.activeSession;
    let image: string;
    if (!session) {
      image = svgDataUri(renderStatusCard({ icon: "no-session", label: "No Session", tone: "muted" }));
    } else {
      const count = this.manager?.sessionCount ?? 1;
      const idx = (this.manager?.activeIndex ?? 0) + 1;
      const name = count > 1 ? `${basename(session.cwd)} ${idx}/${count}` : basename(session.cwd);
      const info: SessionInfo = {
        state: RENDER_STATE[session.state],
        agentType: "claude-code",
        projectName: basename(session.cwd),
        modelName: session.model ?? undefined,
      };
      image = svgDataUri(renderSessionSlot(info, true, 0, name, { animated: false }));
    }
    for (const act of this.actions) {
      act.setTitle("");
      act.setImage(image);
    }
  }
}
