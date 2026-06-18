import { action, type KeyDownEvent } from "@elgato/streamdeck";
import { ManagedAction } from "./base";
import { State } from "../types";
import { svgDataUri } from "../util/svg";
import { renderStatusCard } from "../renderers/session-slot-renderer";

@action({ UUID: "com.paultyng.agentsd.deny" })
export class DenyButton extends ManagedAction {
  override onKeyDown(_ev: KeyDownEvent): void {
    const session = this.manager?.activeSession;
    if (!session || session.state !== State.AWAITING_PERMISSION) return;
    this.manager.resolvePermission(session.id, false);
  }

  protected render(): void {
    const awaiting = this.manager?.activeSession?.state === State.AWAITING_PERMISSION;
    const image = svgDataUri(
      renderStatusCard({ icon: "deny", label: "DENY", subtitle: awaiting ? "reject" : "idle", tone: awaiting ? "danger" : "muted" }),
    );
    for (const act of this.actions) {
      act.setTitle("");
      act.setImage(image);
    }
  }
}
