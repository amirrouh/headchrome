import * as esbuild from "esbuild";
import { copyFileSync, mkdirSync, cpSync, existsSync } from "fs";

const isWatch = process.argv.includes("--watch");

const buildOptions = {
  entryPoints: [
    "src/background/index.ts",
    "src/popup/popup.ts",
  ],
  bundle: true,
  outdir: "dist",
  outbase: "src",
  format: "esm",
  target: "chrome120",
  sourcemap: isWatch ? "inline" : false,
  minify: !isWatch,
};

function copyStaticFiles() {
  mkdirSync("dist/icons", { recursive: true });
  mkdirSync("dist/popup", { recursive: true });

  if (existsSync("src/assets/icons")) {
    cpSync("src/assets/icons", "dist/icons", { recursive: true });
  }

  copyFileSync("manifest.json", "dist/manifest.json");
  copyFileSync("src/popup/popup.html", "dist/popup/popup.html");

  for (const css of ["popup.css", "variables.css", "components.css"]) {
    const src = `src/popup/styles/${css}`;
    if (existsSync(src)) {
      copyFileSync(src, `dist/popup/${css}`);
    }
  }
}

copyStaticFiles();

if (isWatch) {
  const ctx = await esbuild.context({
    ...buildOptions,
    plugins: [{
      name: "copy-static",
      setup(build) {
        build.onEnd(() => {
          copyStaticFiles();
          console.log("[watch] rebuilt");
        });
      },
    }],
  });
  await ctx.watch();
  console.log("Watching for changes...");
} else {
  await esbuild.build(buildOptions);
  console.log("Build complete.");
}
