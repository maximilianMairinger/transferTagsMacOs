import transferTagsMacOs from "../transferTagsMacOs"
import { program } from "commander"
import reqPackageJson, { reqPackagePath } from "req-package-json"
import {promises as fs} from "fs"
import * as path from "path"
const config = reqPackageJson()
import * as console from "colorful-cli-logger"
import sani, { AND } from "sanitize-against"

const saniOptions = sani({
  "originTags?": new AND(String, (a) => a.split(",")),
  addTag: String,
  folderName: String,
  transferToExt: String,
  removePrevTagsOfTarget: Boolean
})

program
  .version(config.version)
  .description(config.description + `\n\nExample usage:\n ${config.name} --originTags "Green" --addTag "Blue" --folderName "/Users/[userName]/Desktop/img" --transferToExt "ARW" --removePrevTagsOfTarget`)
  .name(config.name)
  .option('-s, --silent', 'silence stdout')
  .option("--originTags <originTags> ", "Optional: Origin tags to filter for, multiple may be given by comma separation. They will be considered as logical OR. If this is omitted, any tag will be matched.")
  .requiredOption("--addTag <addTag>", "Tag to add to the files")
  .requiredOption("--folderName <folderName>", "Folder to search for files")
  .requiredOption("--transferToExt <transferToExt>", "Extension to transfer to")
  .option("--removePrevTagsOfTarget", "Remove all instances of the addTag before adding it again")
  .action(async (options) => {
    console.setVerbose(!options.silent)

    const ops = saniOptions(options)
    const res = await transferTagsMacOs(ops)

    
    console.log(`Done. Effected ${res.length} Files.`)
  })

.parse(process.argv)

