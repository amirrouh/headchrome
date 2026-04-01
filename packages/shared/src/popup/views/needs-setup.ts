import { sendMessage } from "../popup";
import { showToast } from "../utils";

/**
 * Renders the initial setup view when no Headscale URL is configured.
 */
export function renderNeedsSetup(root: HTMLElement): void {
  root.textContent = "";
  const view = document.createElement("div");
  view.className = "view";

  const content = document.createElement("div");
  content.className = "centered-view";

  const icon = document.createElement("div");
  icon.className = "centered-view-icon";
  icon.textContent = "\u2699\uFE0F"; // gear emoji

  const title = document.createElement("h2");
  title.className = "centered-view-title";
  title.textContent = "Welcome to HeadChrome";

  const description = document.createElement("p");
  description.className = "centered-view-text";
  description.textContent = "Enter your Headscale server URL to get started.";

  const form = document.createElement("div");
  form.className = "setup-form";

  const input = document.createElement("input");
  input.type = "url";
  input.className = "setup-input";
  input.placeholder = "https://headscale.example.com";
  input.spellcheck = false;

  const saveBtn = document.createElement("button");
  saveBtn.className = "btn btn-primary btn-lg";
  saveBtn.textContent = "Save & Connect";
  saveBtn.addEventListener("click", () => {
    const url = input.value.trim().replace(/\/+$/, ""); // trim trailing slashes
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
  });

  form.appendChild(input);
  form.appendChild(saveBtn);

  content.appendChild(icon);
  content.appendChild(title);
  content.appendChild(description);
  content.appendChild(form);
  view.appendChild(content);
  root.appendChild(view);
}
