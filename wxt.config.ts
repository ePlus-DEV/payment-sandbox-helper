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
    permissions: [
      "activeTab",
      "scripting",
      "sidePanel",
      "contextMenus",
      "storage",
    ],
    browser_specific_settings: {
      gecko: {
        id: "{6bc5b0a9-991e-4b7b-8ab8-ef204f8c953e}",
      },
    },
    side_panel: {
      default_path: "sidepanel.html",
    },
    action: {},
  },
});
