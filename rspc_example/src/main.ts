import { createClient } from "@rspc/client";
import { TauriTransport } from "@rspc/tauri";
import type { Procedures } from "./bindings";

const client = createClient<Procedures>({
  transport: new TauriTransport(),
});

let greetInputEl: HTMLInputElement | null;
let greetMsgEl: HTMLElement | null;

async function greet() {
  if (greetMsgEl && greetInputEl) {
    // Learn more about rspc at https://rspc.dev
    greetMsgEl.textContent = await client.query(["greet", greetInputEl.value]);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  greetInputEl = document.querySelector("#greet-input");
  greetMsgEl = document.querySelector("#greet-msg");
  document.querySelector("#greet-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    greet();
  });
});
