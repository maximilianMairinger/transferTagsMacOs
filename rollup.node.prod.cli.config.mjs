import { merge } from "webpack-merge"
import commonMod from "./rollup.node.common.config.mjs"


export default merge(commonMod, {
  input: 'app/src/cli/transferTagsMacOs-cli.ts',
  output: {
    banner: "#!/usr/bin/env node",
    file: 'app/dist/cjs/cli/transferTagsMacOs-cli.js',
    format: 'cjs'
  },
})