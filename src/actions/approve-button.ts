import { action, type KeyDownEvent } from "@elgato/streamdeck";
import { ManagedAction } from "./base";
import { State } from "../types";
import { svgDataUri } from "../util/svg";
import { renderStatusCard } from "../renderers/session-slot-renderer";

@action({ UUID: "com.paultyng.agentsd.approve" })
export class ApproveButton extends ManagedAction {
  override onKeyDown(_ev: KeyDownEvent): void {
    const session = this.manager?.activeSession;
    if (!session || session.state !== State.AWAITING_PERMISSION) return;
    this.manager.resolvePermission(session.id, true);
  }

  protected render(): void {
    const awaiting = this.manager?.activeSession?.state === State.AWAITING_PERMISSION;
    const image = svgDataUri(
      renderStatusCard({ icon: "allow", label: "APPROVE", subtitle: awaiting ? "permission" : "idle", tone: awaiting ? "ready" : "muted" }),
    );
    for (const act of this.actions) {
      act.setTitle("");
      act.setImage(image);
    }
  }
}
