import { defineConfig } from "astro/config";

const site = process.env.SITE_URL;
if (
  site &&
  (!/^https?:$/.test(new URL(site).protocol) ||
    new URL(site).username ||
    new URL(site).password)
) {
  throw new Error(
    "SITE_URL must be an absolute HTTP(S) URL without credentials",
  );
}

export default defineConfig({
  output: "static",
  trailingSlash: "always",
  ...(site ? { site } : {}),
  markdown: {
    shikiConfig: {
      themes: { light: "vitesse-light", dark: "vitesse-dark" },
      defaultColor: false,
    },
  },
  image: { service: { entrypoint: "astro/assets/services/noop" } },
});
