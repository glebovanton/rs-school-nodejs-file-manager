import * as readline from 'node:readline/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';
import { parseArgs, parseCommandArgs } from './helpers/commandLine.js';
import * as filesHelpers from './helpers/files.js';
import * as outputHelpers from './helpers/output.js';
import * as osHelpers from './helpers/os.js';
import * as hashHelpers from './helpers/hash.js';
import * as transformHelpers from './helpers/transform.js';
import { consoleLog, goodbye, welcome, showCurrentPlace } from './helpers/output.js';

const readlineInterface = readline.createInterface({ input: process.stdin, output: process.stdout });

const args = parseArgs();
let currentDir = homedir();

const resolvePath = pathToResolve => path.resolve(currentDir, pathToResolve);

class InvalidInputError extends Error {
  constructor () {
    super('Invalid input');
  }
}

async function executeCommand (command, commandArgs) {
  switch (command) {
    case 'cd': {
      const newPath = path.resolve(currentDir, commandArgs[0]);
      await fs.access(newPath);
      currentDir = newPath;
      break;
    }

    case 'up': {
      currentDir = path.resolve(currentDir, '..');
      break;
    }

    case 'add': {
      await filesHelpers.add(resolvePath(commandArgs[0]));
      break;
    }

    case 'rn': {
      const [oldName, newName] = commandArgs;
      await filesHelpers.rename(resolvePath(oldName), resolvePath(newName));
      break;
    }

    case 'rm': {
      await filesHelpers.remove(resolvePath(commandArgs[0]));
      break;
    }

    case 'cp': {
      const [sourceFilePath, destinationDirPath] = commandArgs;
      await filesHelpers.copy(resolvePath(sourceFilePath), resolvePath(destinationDirPath));

      break;
    }

    case 'cat': {
      await filesHelpers.read(resolvePath(commandArgs[0]));
      consoleLog('\n');
      break;
    }

    case 'mv': {
      const [sourceFilePath, destinationDirPath] = commandArgs;
      await filesHelpers.move(resolvePath(sourceFilePath), resolvePath(destinationDirPath));

      break;
    }

    case 'ls': {
      await outputHelpers.showDirContent(currentDir);
      break;
    }

    case 'os': {
      const result = osHelpers.osInfo(commandArgs);
      consoleLog(result);
      break;
    }

    case 'hash': {
      const result = await hashHelpers.fileHash(resolvePath(commandArgs[0]));
      consoleLog(result);
      break;
    }

    case 'compress': {
      const [sourceFilePath, destinationDirPath] = commandArgs;
      await transformHelpers.compress(resolvePath(sourceFilePath), resolvePath(destinationDirPath));

      break;
    }

    case 'decompress': {
      const [sourceFilePath, destinationDirPath] = commandArgs;
      await transformHelpers.decompress(resolvePath(sourceFilePath), resolvePath(destinationDirPath));

      break;
    }

    case '.exit': {
      readlineInterface.close();
      break;
    }

    default:
      throw new InvalidInputError();
  }
}

function validateCommandArgs (command, commandArgs) {
  let isValid = true;

  switch (command) {
    case 'up':
    case '.exit':

    case 'ls': {
      if (commandArgs.length !== 0) {
        isValid = false;
      }

      break;
    }

    case 'cd':
    case 'add':
    case 'rm':
    case 'cat':

    case 'hash': {
      if (commandArgs.length !== 1) {
        isValid = false;
      }

      break;
    }

    case 'rn':
    case 'cp':
    case 'mv':
    case 'decompress':

    case 'compress': {
      if (commandArgs.length !== 2) {
        isValid = false;
      }

      break;
    }

    case 'os': {
      if (commandArgs.length !== 1 || !commandArgs[0].startsWith('--')) {
        isValid = false;
      }

      break;
    }
  }

  if (!isValid) {
    throw new InvalidInputError();
  }
}

welcome(args.username);
showCurrentPlace(currentDir);

readlineInterface.prompt();

readlineInterface.on('line', async line => {
  const [command, ...commandArgs] = line.trim().split(' ');

  const parsedCommandArgs = parseCommandArgs(commandArgs);

  try {
    validateCommandArgs(command, parsedCommandArgs);
    await executeCommand(command, parsedCommandArgs);
  } catch (err) {
    if (err instanceof InvalidInputError) {
      consoleLog(err.message);
    } else {
      consoleLog('Operation failed');
    }
  }

  showCurrentPlace(currentDir);
  readlineInterface.prompt();
}).on('close', () => {
  goodbye(args.username);
  process.exit(0);
});
