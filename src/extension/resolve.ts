import { resolve } from 'mlly';

// 📘 resolve a load a module from a given root,
//    falling back to the current root

export async function resolve$(
  name: string,
  cwd: string
): Promise<any> {
  const path =
    (await resolve(name, {
      url: cwd
    }).catch(() => null)) || name;
  return await import(path);
}
