import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "PayPal Sandbox Card Filler",
    description:
      "Tự động điền thông tin thẻ sandbox PayPal vào form thanh toán",
    version: "1.0.0",
    permissions: ["activeTab", "scripting"],
  },
});
