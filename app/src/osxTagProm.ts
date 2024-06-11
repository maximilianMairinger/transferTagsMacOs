const osxTag = require("osx-tag");

function promisify<F extends (...a: any[]) => any>(f: F): ((...a: Parameters<F>) => ReturnType<F>) {
  return (...a) => new Promise<any>((resolve, reject) => {
    f(...a, (err: any, res: any) => {
      if (err) reject(err);
      else resolve(res);
    });
  }) as any
}

export const getTags = promisify(osxTag.getTags) as (file: string) => Promise<string[]>;
export const setTags = promisify(osxTag.setTags) as (file: string, tags: string[]) => Promise<void>;
export const addTags = promisify(osxTag.addTags) as (file: string, tags: string[]) => Promise<void>;
export const removeTags = promisify(osxTag.removeTags) as (file: string, tags: string[]) => Promise<void>;