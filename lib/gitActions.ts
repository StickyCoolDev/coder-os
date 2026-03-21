import * as git from 'isomorphic-git';
import { Paths, Directory } from 'expo-file-system'; // Added Directory
import { gitHTTP } from '@/lib/gitHTTP';
import { expoFsAdapter } from '@/lib/expoFsAdapter';

export async function performClone(remoteUrl: string, dirName?: string) {
  const folder = dirName ?? remoteUrl.split('/').pop()?.replace('.git', '') ?? 'new-project';
  
  const repoDirObj = new Directory(Paths.document, folder);
  
  const repoDirUri = repoDirObj.uri;

  try {
    console.log(`Cloning ${remoteUrl} into ${repoDirUri}...`);

    await git.clone({
      fs: expoFsAdapter,
      http: gitHTTP,
      dir: repoDirUri, // Use the string URI here
      url: remoteUrl,
      singleBranch: true,
      onProgress: (progress) => {
        console.log(`Phase: ${progress.phase} | ${progress.loaded}/${progress.total}`);
      }
    });

    console.log('Clone successful!');
    
    return { success: true, dir: repoDirUri, directoryObject: repoDirObj }; 
  } catch (err) {
    console.error('Clone failed:', err);
    return { success: false, error: err };
  }
}

