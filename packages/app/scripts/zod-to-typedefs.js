import { zodToTs, printNode, createTypeAlias } from 'zod-to-ts';
import { writeFile, mkdir } from 'node:fs/promises';

import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';


// Convert import.meta.url to __dirname equivalent
const __dirname = dirname(fileURLToPath(import.meta.url));

// for logging purposes
const filePathShorten = (filePath) => {
  return `${basename(dirname(filePath))}/${basename(filePath)}`;
};

// Helper function to resolve the order of dependencies
function resolveDependencies(schemas) {
  const dependencies = new Map();

  schemas.forEach(([name, schema]) => {
    const typeName = name.replace('Schema', '');
    const { node } = zodToTs(schema, typeName);
    const members = node.members || [];
    const refs = members.map(member => {
      if (member.type.typeName) {
        return member.type.typeName.text;
      }
      return null;
    }).filter(Boolean);
    dependencies.set(typeName, refs);
  });

  const resolved = [];
  const seen = new Set();

  function resolve(name) {
    if (!seen.has(name)) {
      seen.add(name);
      const deps = dependencies.get(name) || [];
      deps.forEach(resolve);
      resolved.push(name);
    }
  }

  dependencies.forEach((_, name) => resolve(name));

  return resolved;
}

async function convertZodToTypeDef(inputFilePath) {
  const module = await import(resolve(inputFilePath));

  // Filter out non-Zod schemas
  const schemas = Object.entries(module).filter(([name, schema]) => {
    return typeof schema === 'object' && 'safeParse' in schema && typeof schema?.safeParse === 'function';
  });

  if (schemas.length === 0) {
    console.warn(`${inputFilePath} had no zod schemas`);
    return [];
  }

  // Create a map of schema names to TypeScript nodes
  const schemaMap = new Map();

  // Generate all type aliases and store their nodes
  schemas.forEach(([name, schema]) => {
    const typeName = name.replace('Schema', '');
    const { node } = zodToTs(schema, typeName);
    schemaMap.set(typeName, { node, typeAlias: createTypeAlias(node, typeName) });
  });

  // Resolve the order of dependencies
  const resolvedOrder = resolveDependencies(schemas);

  // Print the nodes in the correct order
  const types = [];
  resolvedOrder.forEach(typeName => {
    const { typeAlias } = schemaMap.get(typeName);
    types.push('export ' + printNode(typeAlias));
  });

  console.log(`\t${basename(inputFilePath)}: ${types.length} zod schemas converted`);
  return types;
}

const inputFilePaths = [
  resolve(__dirname, '../src/runtime/schemas/index.js')
];


export default async function zodToTypedefs() {
  const typeDefs = [];
  for (const inputFilePath of inputFilePaths) {
    try {
      typeDefs.push(...(await convertZodToTypeDef(inputFilePath)));
    } catch (e) {
      e.message = `Failed to convert zod schema on file: ${inputFilePath}\n${e.message}`;
      throw e;
    }
  }
  return typeDefs;
}

