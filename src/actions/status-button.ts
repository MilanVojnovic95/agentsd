import { action } from "@elgato/streamdeck";
import { ManagedAction } from "./base";
import { State, type SessionState } from "../types";
import { svgDataUri } from "../util/svg";
import { renderStatusCard, type StatusCardConfig } from "../renderers/session-slot-renderer";

@action({ UUID: "com.paultyng.agentsd.status" })
export class StatusButton extends ManagedAction {
  protected render(): void {
    const session = this.manager?.activeSession;
    const cfg = this.cardFor(session);
    const image = svgDataUri(renderStatusCard(cfg));
    for (const act of this.actions) {
      act.setTitle("");
      act.setImage(image);
    }
  }

  private cardFor(session: SessionState | undefined): StatusCardConfig {
    if (!session) return { icon: "no-session", label: "No Session", tone: "muted" };
    const work = session.activeWork > 0 ? `${session.activeWork} agent${session.activeWork > 1 ? "s" : ""}` : undefined;
    switch (session.state) {
      case State.PROCESSING:
        return { icon: "activity", label: "Working", subtitle: session.currentTool ?? work ?? "running", detail: session.currentTool ? work : undefined, tone: "info" };
      case State.AWAITING_PERMISSION:
        return { icon: "option", label: "Permission?", subtitle: session.currentTool ?? "approve / deny", tone: "warning" };
      case State.AWAITING_ELICITATION:
        return { icon: "option", label: "Question?", subtitle: "needs input", tone: "purple" };
      case State.IDLE:
        return session.lastError
          ? { icon: "deny", label: "Error", subtitle: "last run failed", tone: "danger" }
          : { icon: "ready", label: "Idle", subtitle: work, tone: "ready" };
      default:
        return { icon: "offline", label: "Offline", tone: "muted" };
    }
  }
}
