import { action, type KeyDownEvent } from "@elgato/streamdeck";
import { ManagedAction } from "./base";
import { State } from "../types";
import { svgDataUri } from "../util/svg";
import { renderStatusCard } from "../renderers/session-slot-renderer";

@action({ UUID: "com.paultyng.agentsd.always-allow" })
export class AlwaysAllowButton extends ManagedAction {
  override onKeyDown(_ev: KeyDownEvent): void {
    const session = this.manager?.activeSession;
    if (!session || session.state !== State.AWAITING_PERMISSION) return;
    this.manager.resolvePermissionAlwaysAllow(session.id);
  }

  protected render(): void {
    const awaiting = this.manager?.activeSession?.state === State.AWAITING_PERMISSION;
    const image = svgDataUri(
      renderStatusCard({ icon: "allow", label: "ALWAYS", subtitle: awaiting ? "allow tool" : "idle", tone: awaiting ? "warning" : "muted" }),
    );
    for (const act of this.actions) {
      act.setTitle("");
      act.setImage(image);
    }
  }
}
