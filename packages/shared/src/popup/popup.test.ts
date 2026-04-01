import { describe, it, expect, beforeEach } from "vitest";
import { viewForState, _setHeadscaleUrlConfigured } from "./popup";
import { baseState } from "../__test__/fixtures";

describe("viewForState", () => {
  beforeEach(() => {
    _setHeadscaleUrlConfigured(true);
  });

  it("returns 'needs-setup' when headscale URL is not configured", () => {
    _setHeadscaleUrlConfigured(false);
    expect(viewForState(baseState({ backendState: "Running" }))).toBe("needs-setup");
  });

  it("returns 'connected' when backendState is Running", () => {
    expect(viewForState(baseState({ backendState: "Running" }))).toBe("connected");
  });

  it("returns 'needs-login' when backendState is NeedsLogin", () => {
    expect(viewForState(baseState({ backendState: "NeedsLogin" }))).toBe(
      "needs-login"
    );
  });

  it("returns 'disconnected' when backendState is Stopped", () => {
    expect(viewForState(baseState({ backendState: "Stopped" }))).toBe(
      "disconnected"
    );
  });

  it("returns 'disconnected' when backendState is Starting", () => {
    expect(viewForState(baseState({ backendState: "Starting" }))).toBe(
      "disconnected"
    );
  });

  it("returns 'needs-install' when installError is true", () => {
    expect(viewForState(baseState({ installError: true }))).toBe("needs-install");
  });

  it("installError takes precedence over Running backendState", () => {
    expect(
      viewForState(baseState({ installError: true, backendState: "Running" }))
    ).toBe("needs-install");
  });

  it("installError takes precedence over NeedsLogin", () => {
    expect(
      viewForState(baseState({ installError: true, backendState: "NeedsLogin" }))
    ).toBe("needs-install");
  });

  it("returns 'disconnected' for NoState backendState", () => {
    expect(viewForState(baseState({ backendState: "NoState" }))).toBe(
      "disconnected"
    );
  });
});
