import { action } from "@elgato/streamdeck";
import { ManagedAction } from "./base";
import { svgDataUri } from "../util/svg";
import { renderStatusCard, aliasModelName } from "../renderers/session-slot-renderer";

const MODE_LABELS: Record<string, string> = {
  default: "DEFAULT",
  acceptEdits: "ACCEPT EDITS",
  plan: "PLAN",
  auto: "AUTO",
  dontAsk: "DON'T ASK",
  bypassPermissions: "BYPASS",
};

@action({ UUID: "com.paultyng.agentsd.mode" })
export class ModeButton extends ManagedAction {
  protected render(): void {
    const session = this.manager?.activeSession;
    const modeLabel = MODE_LABELS[session?.permissionMode ?? ""] ?? session?.permissionMode?.toUpperCase() ?? "MODE";
    const modelLabel = session?.model ? aliasModelName(session.model) : "";
    const image = svgDataUri(
      renderStatusCard({ icon: "mode", label: modeLabel, subtitle: modelLabel, tone: "purple" }),
    );
    for (const act of this.actions) {
      act.setTitle("");
      act.setImage(image);
    }
  }
}
