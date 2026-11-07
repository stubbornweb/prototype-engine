import { defineConfig } from "vite-plus";

const ignorePatterns = ["prototypes/**", "templates/**", "patterns/**", "docs/**", "**/*.md"];

export default defineConfig({
  fmt: { ignorePatterns },
  lint: {
    ignorePatterns,
    options: { typeAware: true, typeCheck: true },
  },
});
