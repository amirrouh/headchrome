import { sendMessage } from "../popup";
import { showToast } from "../utils";
import { HEADSCALE_URL_STORAGE_KEY } from "../../constants";

/**
 * Renders the settings panel as a sub-view.
 */
export function renderSettings(
  root: HTMLElement,
  _state: unknown,
  onBack: () => void,
): void {
  root.textContent = "";
  const view = document.createElement("div");
  view.className = "view";

  // Back header
  const header = document.createElement("div");
  header.className = "sub-view-header";

  const backBtn = document.createElement("button");
  backBtn.className = "sub-view-back";
  backBtn.textContent = "\u2039 Back";
  backBtn.addEventListener("click", onBack);

  const headerTitle = document.createElement("span");
  headerTitle.className = "sub-view-title";
  headerTitle.textContent = "Settings";

  header.appendChild(backBtn);
  header.appendChild(headerTitle);
  view.appendChild(header);

  // Settings content
  const content = document.createElement("div");
  content.className = "settings-content";

  const label = document.createElement("label");
  label.className = "settings-label";
  label.textContent = "Headscale Server URL";

  const input = document.createElement("input");
  input.type = "url";
  input.className = "setup-input";
  input.placeholder = "https://headscale.example.com";
  input.spellcheck = false;

  // Load current value
  chrome.storage.local.get(HEADSCALE_URL_STORAGE_KEY).then((result) => {
    const current = result[HEADSCALE_URL_STORAGE_KEY] as string;
    if (current) input.value = current;
  });

  const saveBtn = document.createElement("button");
  saveBtn.className = "btn btn-primary";
  saveBtn.textContent = "Save";
  saveBtn.addEventListener("click", () => {
    const url = input.value.trim().replace(/\/+$/, "");
    if (!url) {
      showToast("Please enter a URL", "error");
      return;
    }
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        showToast("URL must start with https:// or http://", "error");
        return;
      }
    } catch {
      showToast("Invalid URL format", "error");
      return;
    }
    sendMessage({ type: "save-headscale-url", url });
    showToast("Saved! Reconnecting...");
    // Go back after a short delay to let the reconnect start
    setTimeout(onBack, 500);
  });

  content.appendChild(label);
  content.appendChild(input);
  content.appendChild(saveBtn);
  view.appendChild(content);
  root.appendChild(view);
}
