import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: ({ browser }) => ({
    name: "__MSG_extName__",
    description: "__MSG_extDescription__",
    default_locale: "en",
    permissions: [
      "activeTab",
      "scripting",
      ...(browser === "chrome" ? ["sidePanel" as const] : []),
      "contextMenus",
      "storage",
    ],
    browser_specific_settings: {
      gecko: {
        id: "{6bc5b0a9-991e-4b7b-8ab8-ef204f8c953e}",
        // @ts-ignore - WXT doesn't support this field yet
        data_collection_permissions: {
          required: ["none"],
        },
      },
    },
    ...(browser === "chrome"
      ? { side_panel: { default_path: "sidepanel.html" } }
      : {
          sidebar_action: {
            default_panel: "sidepanel.html",
            default_width: 400,
          },
        }),
    action: {},
  }),
});
