import * as osxTag from "./osxTagProm"
import { promises as fs } from "fs"
import path from "path"

type TaggedFile = { filePath: string, tags: string[] }

export async function getTagsOfFilesInFolder(folderName: string, tagsOfInterest?: string[] | string) {
  tagsOfInterest = tagsOfInterest === undefined ? undefined : tagsOfInterest instanceof Array ? tagsOfInterest : [tagsOfInterest]
  return Promise.all((await fs.readdir(folderName)).map(async (fileOnlyName) => {
    const filePath = path.join(folderName, fileOnlyName)
    const tags = await osxTag.getTags(filePath)
    return { filePath, tags }
  })) as Promise<TaggedFile[]>
}

export function filterTagsOfInterest(allFiles: TaggedFile[], tagsOfInterest?: string[] | string | undefined) {
  tagsOfInterest = tagsOfInterest === undefined ? undefined : tagsOfInterest instanceof Array ? tagsOfInterest : [tagsOfInterest]
  return allFiles.filter(({ tags }) => tags.some(tag => tagsOfInterest.includes(tag)))
}

export function transferToDifferentExtension(res: TaggedFile[], ext: string, ignoreMissingSamples = false): Promise<{ filePath: string, tags: string[] }[]> {
  if (!ext.startsWith(".")) ext = "." + ext

  return Promise.all(res.map(async ({ filePath, tags }) => {
    const newFilePath = filePath.replace(/\.[^.]+$/, ext)
    if (await fileExists(newFilePath)) {
      return { filePath: newFilePath, tags }
    }
    else {
      if (ignoreMissingSamples) return undefined
      else throw new Error(`File not found at ${newFilePath}`)
    }
  })).then((res) => res.filter(x => !!x))
}

export function copySelectedToDir(res: TaggedFile[], copyToDir: string, handleExistingFileAtTarget: "error" | "skip" | "overwrite" = "error") {
  return Promise.all(res.map(async ({ filePath, tags }) => {
    const newFilePath = path.join(copyToDir, path.basename(filePath))
    if (handleExistingFileAtTarget === "skip") {
      const exists = await fileExists(newFilePath)
      if (exists) return
    }
    else if (handleExistingFileAtTarget === "error") {
      const exists = await fileExists(newFilePath)
      if (exists) throw new Error(`File already exists at ${newFilePath}`)
    }
    await fs.copyFile(filePath, newFilePath)
  }))
}

export function addTagToSelected(res: TaggedFile[], tag: string) {
  return Promise.all(res.map(async (res) => {
    await osxTag.addTags(res.filePath, [tag])
    return res
  }))
}

export function removeAllTagInstances(allFiles: TaggedFile[], tag: string) {
  return Promise.all(allFiles.filter(({ tags }) => tags.includes(tag)).map(({ filePath }) => osxTag.removeTags(filePath, [tag])))
}

function fileExists(filePath: string) {
  return fs.stat(filePath)
    .then(() => true)
    .catch(() => false)
}

export async function transferTagsMacOs({folderName, transferToExt, addTag, originTags, removePrevTagsOfTarget = false }: { folderName: string, transferToExt: string, addTag: string, originTags?: string[] | string, removePrevTagsOfTarget?: boolean }) {
  const allFiles = getTagsOfFilesInFolder(folderName)

  if (removePrevTagsOfTarget) {
    await allFiles
      .then(res => removeAllTagInstances(res, addTag))
  }

  return await allFiles
    .then(res => filterTagsOfInterest(res, originTags))
    .then(res => transferToDifferentExtension(res, transferToExt))
    .then(res => addTagToSelected(res, addTag))
}

export default transferTagsMacOs