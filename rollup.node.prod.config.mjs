import { merge } from "webpack-merge"
import commonMod from "./rollup.node.common.config.mjs"


export default merge(commonMod, {
  input: 'app/src/transferTagsMacOs.ts',
  output: {
    file: 'app/dist/cjs/transferTagsMacOs.js',
    format: 'cjs'
  },
})