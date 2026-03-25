import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    name: "__MSG_extName__",
    description: "__MSG_extDescription__",
    default_locale: "en",
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
    action: {},
  },
});
