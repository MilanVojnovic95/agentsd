/**
 * State + agent brand colors, ported from AgentDeck
 * (github.com/puritysb/AgentDeck, MIT © 2025 SerendipityBound).
 * State keys use AgentDeck's lowercase string form (idle/processing/awaiting_*).
 */

export type AgentType = "claude-code" | "openclaw" | "codex-cli" | "codex-app" | "opencode" | "monitor";

const STATE_COLORS: Record<string, string> = {
  idle: "#22c55e", // green
  processing: "#3b82f6", // blue
  awaiting_permission: "#f59e0b", // amber
  awaiting_option: "#f59e0b", // amber
  awaiting_diff: "#f59e0b", // amber
  disconnected: "#6b7280", // gray
};

/** Look up state color by string key. */
export function stateColor(state: string | undefined): string {
  if (!state) return STATE_COLORS.disconnected;
  return STATE_COLORS[state] ?? STATE_COLORS.idle;
}

export const AGENT_BRAND_COLORS: Record<string, string> = {
  "claude-code": "#C07058", // terracotta
  openclaw: "#ff4d4d", // red
  "codex-cli": "#6366f1", // indigo
  "codex-app": "#6366f1", // indigo
  opencode: "#F1ECEC", // cream
  monitor: "#94a3b8", // slate
};

/** Get agent brand color. Falls back to slate for unknown types. */
export function agentBrandColor(agentType: string | undefined): string {
  return AGENT_BRAND_COLORS[agentType ?? ""] ?? "#94a3b8";
}

/** Mix a hex color toward white by ratio (0=original, 1=white). */
export function lightenColor(hex: string, ratio: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lr = Math.round(r + (255 - r) * ratio);
  const lg = Math.round(g + (255 - g) * ratio);
  const lb = Math.round(b + (255 - b) * ratio);
  return `#${lr.toString(16).padStart(2, "0")}${lg.toString(16).padStart(2, "0")}${lb.toString(16).padStart(2, "0")}`;
}

/** Mix a hex color toward black by ratio (0=original, 1=black). */
export function dimColor(hex: string, ratio: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const dr = Math.round(r * (1 - ratio));
  const dg = Math.round(g * (1 - ratio));
  const db = Math.round(b * (1 - ratio));
  return `#${dr.toString(16).padStart(2, "0")}${dg.toString(16).padStart(2, "0")}${db.toString(16).padStart(2, "0")}`;
}
