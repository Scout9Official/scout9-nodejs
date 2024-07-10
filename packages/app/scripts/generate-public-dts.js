import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join, dirname, basename } from 'node:path';
import ts from 'typescript';
import { fileURLToPath } from 'node:url';
import { globSync } from 'glob';
import { writeFile } from 'node:fs/promises';
import zodToTypedefs from './zod-to-typedefs.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Generates TypeScript declaration files from a JavaScript file with JSDoc comments.
 * @param {string} inputFilePath - The path to the input JavaScript file.
 * @param {string} outputDir - The directory where the output .d.ts file should be saved.
 */
function generateDts(inputFilePath, outputDir = resolve(__dirname, './bin')) {
  return new Promise((resolve, reject) => {

    // Read the JavaScript file content
    const fileContent = readFileSync(inputFilePath, 'utf-8');

    // Create a TypeScript SourceFile object
    const sourceFile = ts.createSourceFile(basename(inputFilePath), fileContent, ts.ScriptTarget.Latest, true);

    // Compiler options
    const compilerOptions = {
      declaration: true,
      emitDeclarationOnly: true,
      allowJs: true,
      outDir: outputDir,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      types: ['node']  // Include node types
    };


    // Create a CompilerHost to manage the in-memory file system
    const host = ts.createCompilerHost(compilerOptions);

    // Override the getSourceFile function to use the SourceFile object we created
    host.getSourceFile = (fileName, languageVersion) => {
      return fileName === basename(inputFilePath) ? sourceFile : undefined;
    };

    // Override the writeFile function to output the declaration file
    host.writeFile = (filePath, contents) => {
      // mkdirSync(dirname(filePath), { recursive: true });
      resolve(contents);
      // writeFileSync(filePath, contents);
    };

    // Create a Program and emit the declaration file
    const program = ts.createProgram([basename(inputFilePath)], compilerOptions, host);
    const emitResult = program.emit();

    const diagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
    if (diagnostics.length) {
      diagnostics.forEach(diagnostic => {
        if (diagnostic.file) {
          const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
          const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
          console.error(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
        } else {
          console.error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
        }
      });
      reject(new Error('TypeScript compilation errors'));
    }
  });
}


export default async function generatePublicDts(outputFilePath) {

  const typeDefs = [];
  const ignoreFileNames = ['index.js', 'utils.js', 'globals.js'];
  const filesToExport = [
    resolve(__dirname, '../src/exports.js'),
    ...globSync(resolve(__dirname, '../src/runtime/client/**.js')),
    ...globSync(resolve(__dirname, '../src/runtime/macros/**.js'))
  ].filter((fileName) => !ignoreFileNames.includes(basename(fileName)));


  for (const inputFilePath of filesToExport) {
    try {
      typeDefs.push(await generateDts(inputFilePath));
    } catch (e) {
      e.message = `Failed to convert zod schema on file: ${inputFilePath}\n${e.message}`;
      throw e;
    }
  }

  typeDefs.push(...(await zodToTypedefs()));

  const header = `
/**
 * Scout9 App
 * Application platform for managing auto reply workflows from personal communication methods
 *
 *
 * NOTE: This file was auto generated ${new Date().toLocaleString()}
 * Do not edit the file manually.
 */
`;
  mkdirSync(dirname(outputFilePath), { recursive: true });

  await writeFile(outputFilePath, `${header}\n\n${typeDefs.join('\n\n')}`);
  console.log(`${typeDefs.length} type definitions saved to ${outputFilePath}`);

}

const outputFilePath = resolve(__dirname, '../src/public.d.ts');
await generatePublicDts(outputFilePath);
