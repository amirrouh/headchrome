import { createToggle } from "./toggle-switch";
import { sendMessage } from "../popup";

/**
 * Creates the HeadChrome hexagonal "H" logo icon as DOM elements.
 */
function createLogoIcon(): HTMLElement {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 20 20");
  svg.setAttribute("fill", "none");
  svg.setAttribute("width", "20");
  svg.setAttribute("height", "20");

  // Hexagonal background
  const hex = document.createElementNS(ns, "path");
  hex.setAttribute("d", "M10 1L18.66 5.5V14.5L10 19L1.34 14.5V5.5L10 1Z");
  hex.setAttribute("fill", "currentColor");
  hex.setAttribute("opacity", "0.15");
  svg.appendChild(hex);

  // Letter H
  const h = document.createElementNS(ns, "text");
  h.setAttribute("x", "10");
  h.setAttribute("y", "14.5");
  h.setAttribute("text-anchor", "middle");
  h.setAttribute("font-size", "12");
  h.setAttribute("font-weight", "700");
  h.setAttribute("font-family", "-apple-system, sans-serif");
  h.setAttribute("fill", "currentColor");
  h.textContent = "H";
  svg.appendChild(h);

  const wrapper = document.createElement("span");
  wrapper.appendChild(svg);
  return wrapper;
}

/**
 * Renders the popup header with Tailscale logo and toggle switch.
 */
export function renderHeader(
  container: HTMLElement,
  connected: boolean,
  disabled = false,
): void {
  const header = document.createElement("div");
  header.className = "header";

  const logo = document.createElement("div");
  logo.className = "header-logo";
  logo.appendChild(createLogoIcon());

  const wordmark = document.createElement("span");
  wordmark.className = "header-wordmark";
  wordmark.textContent = "HeadChrome";
  logo.appendChild(wordmark);

  const toggle = createToggle(connected, () => {
    sendMessage({ type: "toggle" });
  }, disabled);

  header.appendChild(logo);
  header.appendChild(toggle);
  container.appendChild(header);
}
