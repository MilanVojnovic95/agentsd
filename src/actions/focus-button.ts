import streamDeck, { action, type KeyDownEvent, type WillAppearEvent, SingletonAction } from "@elgato/streamdeck";
import { focusClaudeDesktop, focusGhostty } from "../util/applescript";
import { svgDataUri } from "../util/svg";
import { renderStatusCard } from "../renderers/session-slot-renderer";

@action({ UUID: "com.paultyng.agentsd.focus" })
export class FocusButton extends SingletonAction {
  override onWillAppear(ev: WillAppearEvent): void {
    if (ev.action.isKey()) {
      ev.action.setTitle("");
      ev.action.setImage(svgDataUri(renderStatusCard({ icon: "open-app", label: "FOCUS", subtitle: "terminal", tone: "info" })));
    }
  }

  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
    try {
      await focusGhostty();
    } catch {
      try {
        await focusClaudeDesktop();
      } catch (err) {
        streamDeck.logger.warn(`Failed to focus any application: ${err}`);
      }
    }
  }
}
