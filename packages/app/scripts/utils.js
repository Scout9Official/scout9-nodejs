
import { exec } from 'node:child_process';

// Execute a series of shell commands
export const executeCommand = (command) => {
  return new Promise((resolve, reject) => {
    console.log(command);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${stderr}`);
        reject(stderr);
      } else {
        console.log(stdout, stderr);
        resolve(stdout);
      }
    });
  });
};
