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
  .description('Obfuscates your JavaScript file into an unreadable ASCII art skull that actually executes.')
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

const skullTemplate = [
  "        XXXXXXX        ",
  "      XXXXXXXXXXX      ",
  "     XXXXXXXXXXXXX     ",
  "    XXXX  XXX  XXXX    ",
  "    XXXX  XXX  XXXX    ",
  "     XXXXXXXXXXXXX     ",
  "      XXXXXXXXXXX      ",
  "        XXXXXXX        ",
  "         X X X         "
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

  const content = fs.readFileSync(fullPath, 'utf8');
  
  // Convert the actual code into a base64 payload
  const b64 = Buffer.from(content, 'utf8').toString('base64');
  let codeIndex = 0;

  // We will build a template literal that contains the base64 string shaped as a skull
  let art = "const _ = `\n";

  for (let line of skullTemplate) {
    let outputLine = "";
    for (let char of line) {
      if (char === 'X') {
        if (codeIndex < b64.length) {
          outputLine += b64[codeIndex];
          codeIndex++;
        } else {
          // Pad with safe base64 characters (like 'A' which is 0) to maintain the skull shape
          outputLine += "A";
        }
      } else {
        outputLine += " ";
      }
    }
    art += outputLine + "\n";
  }

  art += "`;\n";

  // If there's leftover base64 payload, just dump it in a blob at the bottom
  if (codeIndex < b64.length) {
    art += "const __ = `" + b64.substring(codeIndex) + "`;\n";
    art += "eval(Buffer.from(_.replace(/\\s/g, '') + __, 'base64').toString('utf8'));\n";
  } else {
    art += "eval(Buffer.from(_.replace(/\\s/g, ''), 'base64').toString('utf8'));\n";
  }

  fs.writeFileSync(fullPath, art, 'utf8');

  console.log(pc.green(`\n✔ Masterpiece created!`));
  console.log(pc.white(`Open ${targetFile} in your editor. It is a work of art and 100% executable.`));
  console.log(pc.cyan('\nArchitected by @lakshanmuruganandam\n'));
};

run().catch(err => {
  console.error(pc.red('\nAn unexpected error occurred:'), err.message);
  process.exit(1);
});
