#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import pc from 'picocolors';
import { Command } from 'commander';
import boxen from 'boxen';

const program = new Command();

program
  .name('code-picasso')
  .description('Obfuscates your JavaScript file into an unreadable ASCII art skull.')
  .argument('<file>', 'The JS file to ruin')
  .version('1.0.0')
  .parse(process.argv);

console.log(
  boxen(
    pc.magenta(pc.bold('🎨 CODE PICASSO')) + '\n' + pc.gray('Turn your logic into an unreadable masterpiece.'),
    { padding: 1, margin: 1, borderStyle: 'double', borderColor: 'magenta' }
  )
);

const targetFile = program.args[0];

if (!targetFile) {
  console.log(pc.red('❌ You must specify a target file. Example: npx code-picasso src/index.js'));
  process.exit(1);
}

const fullPath = path.resolve(process.cwd(), targetFile);

if (!fs.existsSync(fullPath)) {
  console.log(pc.red(`❌ File not found: ${fullPath}`));
  process.exit(1);
}

// A simple ASCII skull template where 'X' will be replaced by code blocks
const skullTemplate = [
  "      XXXXXXX      ",
  "    XXXXXXXXXXX    ",
  "   XXXXXXXXXXXXX   ",
  "  XXX  XXXXX  XXX  ",
  "  XXX  XXXXX  XXX  ",
  "   XXXXXXXXXXXXX   ",
  "    XXXXXXXXXXX    ",
  "      XXXXXXX      ",
  "       X X X       "
];

const run = async () => {
  const { confirm } = await inquirer.prompt([{
    type: 'confirm',
    name: 'confirm',
    message: pc.yellow(`WARNING: This will obliterate the formatting of ${targetFile} and turn it into a skull. Proceed?`),
    default: false
  }]);

  if (!confirm) {
    console.log(pc.gray('\nAborted. Keep your boring, readable code.'));
    process.exit(0);
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Strip newlines and spaces to pack the code
  let packedCode = content.replace(/\\s+/g, ' ');
  let codeIndex = 0;

  let art = "";
  
  // Prepend a block comment to make it valid JS if we need to pad
  art += "/* Art by @lakshanmuruganandam */\n";

  for (let line of skullTemplate) {
    let outputLine = "";
    for (let char of line) {
      if (char === 'X') {
        if (codeIndex < packedCode.length) {
          outputLine += packedCode[codeIndex];
          codeIndex++;
        } else {
          // Pad with safe comments if we run out of code
          outputLine += "/*X*/";
        }
      } else {
        outputLine += " ";
      }
    }
    art += outputLine + "\n";
  }

  // If there's leftover code, just dump it at the bottom
  if (codeIndex < packedCode.length) {
    art += "\n" + packedCode.substring(codeIndex);
  }

  fs.writeFileSync(fullPath, art, 'utf8');

  console.log(pc.green(`\n✔ Masterpiece created!`));
  console.log(pc.white(`Open ${targetFile} in your editor. It is a work of art.`));
  console.log(pc.cyan('\nArchitected by @lakshanmuruganandam\n'));
};

run().catch(err => {
  console.error(pc.red('\nAn unexpected error occurred:'), err.message);
  process.exit(1);
});
