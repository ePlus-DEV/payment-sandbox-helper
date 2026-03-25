import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    name: "Sandbox Pay",
    description:
      "Fill PayPal & Stripe test cards instantly for sandbox testing",
    version: "1.0.0",
    permissions: [
      "activeTab",
      "scripting",
      "sidePanel",
      "contextMenus",
      "storage",
    ],
    side_panel: {
      default_path: "sidepanel.html",
    },
    action: {
      // không set default_popup để onClicked có thể trigger
    },
  },
});
