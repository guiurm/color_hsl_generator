import { defineConfig } from "rollup";
// import alias from "@rollup/plugin-alias";
// import { nodeResolve } from "@rollup/plugin-node-resolve";
// import { dts } from "rollup-plugin-dts";

export default defineConfig([
    {
        input: "dist/index.js",
        output: [
            {
                dir: "build",
                format: "esm",
                entryFileNames: "index.mjs",
            },
            /*{
                dir: "build",
                format: "cjs",
                entryFileNames: "index.cjs",
            },*/
        ],
        // plugins: [nodeResolve({ resolveOnly: ["rbl-three"] })],
    },
    
    /*{
        input: "dist/index.d.ts",
        output: [
            //{ file: "../../dist/index.d.ts", format: "es" },
            { file: "build/index.d.ts", format: "es" },
        ],
        plugins: [dts()],
    },*/
]);
