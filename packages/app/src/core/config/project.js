import path from 'node:path';
import { requireProjectFile } from '../../utils/index.js';
import { globSync } from 'glob';
import { pathToFileURL } from 'node:url';
import fss from 'node:fs';
import fs from 'node:fs/promises';
import { writeFileToLocal } from '../../utils/file.js';
import { Configuration, Scout9Api } from '@scout9/admin';
import { projectTemplates } from '../../utils/project-templates.js';
import imageBuffer from '../../utils/image-buffer.js';


/**
 * @param {Object} input
 * @param {string | Buffer} input.img
 * @param {'icon' | 'logo'} [input.type]
 * @returns {Promise<string>}
 */
async function writeImageToServer({img, type = 'icon', source}) {
  const buffer = await imageBuffer(img, type === 'icon', source).then((res => res.buffer));
  const scout9 = new Scout9Api(new Configuration({apiKey: process.env.SCOUT9_API_KEY}));
  let url;
  if (type === 'icon') {
    const result = await scout9.organizationIcon(buffer).then(res => res.data);
    url = result.url;
  } else {
    const result = await scout9.organizationLogo(buffer).then(res => res.data);
    url = result.url;
  }
  if (!url) {
    throw new Error(`Failed to upload agent image or no data returned: ${url}`);
  }
  return url;
}


/**
 * Loads the users local package.json, if they provide a package-s9-test.json,
 * it will load that instead (used for scout9 internal testing)
 * @param {cwd?: string}
 * @returns {Promise<{isTest: boolean, pkg: {name: string; version: string; dependencies: Record<string, string>}}>}
 */
export async function loadUserPackageJson({cwd = process.cwd()}) {
  const packageJsonPath = path.resolve(cwd, './package.json');
  const packageTestJsonPath = path.resolve(cwd, './package-s9-test.json');
  const packageJsonUrl = pathToFileURL(packageJsonPath);
  const packageTestJsonUrl = pathToFileURL(packageTestJsonPath);
  const isTest = fss.existsSync(packageTestJsonUrl);
  const targetPkgUrl = isTest ? packageTestJsonUrl : packageJsonUrl;
  const pkg = JSON.parse(await fs.readFile(new URL(targetPkgUrl, import.meta.url), 'utf-8'));
  return {
    pkg,
    isTest
  }
}

/**
 * @returns {Promise<import('../../runtime/client/config.js').IScout9ProjectConfig>}
 */
export default async function loadProjectConfig({cwd = process.cwd(), deploying = false, src = 'src', cb = (message) => {}} = {}) {
  // Grab the project tag name (from their package.json)
  const {pkg} = await loadUserPackageJson({cwd});
  const tag = `${pkg.name || 'scout9-app'}-v${pkg.version || '0.0.1'}`;

  // Grab the project config file (from src/index.{ts,js})
  const paths = globSync(`${src}/index.{ts,cjs,mjs,js}`, {cwd, absolute: true});
  if (paths.length === 0) {
    throw new Error(`Missing main project entry file ${src}/index.{js|ts|cjs|mjs}`);
  } else if (paths.length > 1) {
    throw new Error(`Multiple main project entry files found ${src}/index.{js|ts|cjs|mjs}`);
  }
  const [filePath] = paths;
  const project = await requireProjectFile(filePath).then(mod => mod.default);

  let serverDeployed = false;

  if (project.organization.logo) {
    if (typeof project.organization.logo === 'string') {
      if (!project.organization.logo.startsWith('https://storage.googleapis.com')) {
        if (deploying) {
          project.organization.logo = await writeImageToServer({img: project.organization.logo, type: 'logo', source: filePath});
          cb(`✅ Uploaded logo to server: ${project.organization.logo}`);
          serverDeployed = true;
        } else {
          project.organization.logo = await writeFileToLocal({file: project.organization.logo, fileName: 'logo', source: filePath})
            .then(({uri, isImage}) => {
              if (!isImage) {
                throw new Error(`Invalid image type: ${uri}`);
              }
              return uri;
            });
          cb(`✅ Wrote logo to local: ${project.organization.logo}`);
        }
      }
    } else if (Buffer.isBuffer(project.organization.logo)) {
      if (deploying) {
        project.organization.logo = await writeImageToServer({img: project.organization.logo, type: 'logo', source: filePath});
        cb(`✅ Uploaded logo to server: ${project.organization.logo}`);
        serverDeployed = true;
      } else {
        project.organization.logo = await writeFileToLocal({file: project.organization.logo, fileName: 'logo', source: filePath})
          .then(({uri, isImage}) => {
            if (!isImage) {
              throw new Error(`Invalid image type: ${uri}`);
            }
            return uri;
          });
        cb(`✅ Wrote logo to local: ${project.organization.logo}`);
      }
    } else {
      throw new Error(`Invalid logo type: ${typeof project.organization.logo}`);
    }
  }

  if (project.organization.icon) {
    if (typeof project.organization.icon === 'string') {
      if (!project.organization.icon.startsWith('https://storage.googleapis.com')) {
        if (deploying) {
          project.organization.icon = await writeImageToServer({img: project.organization.icon, type: 'icon', source: filePath});
          cb(`✅ Uploaded icon to server: ${project.organization.icon}`);
          serverDeployed = true;
        } else {
          project.organization.icon = await writeFileToLocal({file: project.organization.icon, fileName: 'icon', source: filePath})
            .then(({uri, isImage}) => {
              if (!isImage) {
                throw new Error(`Invalid image type: ${uri}`);
              }
              return uri;
            });
          cb(`✅ Wrote icon to local: ${project.organization.icon}`);
        }
      }
    } else if (Buffer.isBuffer(project.organization.icon)) {
      if (deploying) {
        project.organization.icon = await writeImageToServer({img: project.organization.icon, type: 'icon', source: filePath});
        cb(`✅ Uploaded icon to server: ${project.organization.icon}`);
        serverDeployed = true;
      } else {
        project.organization.icon = await writeFileToLocal({file: project.organization.icon, fileName: 'icon', source: filePath})
          .then(({uri, isImage}) => {
            if (!isImage) {
              throw new Error(`Invalid image type: ${uri}`);
            }
            return uri;
          });
        cb(`✅ Wrote icon to local: ${project.organization.icon}`);
      }
    } else {
      throw new Error(`Invalid icon type: ${typeof project.organization.icon}`);
    }
  }

  // @TODO validation type check with zod


  if (serverDeployed) {
    cb(`Syncing ${filePath} with latest server changes`);
    await fs.writeFile(filePath, projectTemplates.root({tag, ...project}, path.extname(filePath)));
    // const update = await p.confirm({
    //   message: `Changes uploaded, sync local entities/agents file?`,
    //   initialValue: true
    // });
    // if (update) {
    // }
  }

  return {
    tag,
    ...project,
  };
}
