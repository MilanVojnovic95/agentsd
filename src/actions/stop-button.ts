import streamDeck, { action, type KeyDownEvent } from "@elgato/streamdeck";
import { ManagedAction } from "./base";
import { State } from "../types";
import { svgDataUri } from "../util/svg";
import { renderStopButton } from "../renderers/session-slot-renderer";

@action({ UUID: "com.paultyng.agentsd.stop" })
export class StopButton extends ManagedAction {
  override async onKeyDown(_ev: KeyDownEvent): Promise<void> {
    const sent = this.manager?.interruptActiveSession() ?? false;
    if (!sent) {
      streamDeck.logger.warn("Stop: no active session or PID not resolved");
    }
  }

  protected render(): void {
    const session = this.manager?.activeSession;
    const active = !!session && session.state !== State.DISCONNECTED && session.state !== State.IDLE;
    const image = svgDataUri(renderStopButton(active));
    for (const act of this.actions) {
      act.setTitle("");
      act.setImage(image);
    }
  }
}
