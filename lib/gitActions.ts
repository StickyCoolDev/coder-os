import * as git from 'isomorphic-git';
import { Paths, Directory } from 'expo-file-system'; // Added Directory
import { gitHTTP } from '@/lib/gitHTTP';
import { expoFsAdapter } from '@/lib/expoFsAdapter';

/**
 * Performes a git clone , similar to the command `git clone <url> <dir>`
 * NOTE: does not do/allow for a shallow clone, could lead to OOM or OOS
 */
export async function performClone(remoteUrl: string, dirName?: string) {
  const folder = dirName ?? remoteUrl.split('/').pop()?.replace('.git', '') ?? 'new-project';
  
  const repoDirObj = new Directory(Paths.document, folder);
  
  const repoDirUri = repoDirObj.uri;

  try {
    console.log(`Cloning ${remoteUrl} into ${repoDirUri}...`);

    await git.clone({
      fs: expoFsAdapter,
      http: gitHTTP,
      dir: repoDirUri, 
      url: remoteUrl,
      singleBranch: true,
      onProgress: (progress) => {
        console.log(`Phase: ${progress.phase} | ${progress.loaded}/${progress.total}`);
      }
    });

    console.log('Clone successful');
    
    return { success: true, dir: repoDirUri, directoryObject: repoDirObj }; 
  } catch (err) {
    console.error('Clone failed:', err);
    return { success: false, error: err };
  }
}
/**
 * Performes a git add, similar to the command `git add <>`
 * Takes in a single path or a list of paths
 */
export async function performAdd(dir: string, filepath: string | string[]) {
  try {
    const filepaths = Array.isArray(filepath) ? filepath : [filepath];

    for (const file of filepaths) {
      await git.add({
        fs: expoFsAdapter,
        dir,
        filepath: file,
      });
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err };
  }
}

