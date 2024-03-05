import path from 'node:path';
import fs from 'node:fs/promises';
import colors from 'kleur';
import { globSync } from 'glob';
import { Configuration, Scout9Api } from '@scout9/admin';
import { checkVariableType, requireProjectFile } from '../../utils/index.js';
import { agentsBaseConfigurationSchema, agentsConfigurationSchema } from '../../runtime/index.js';
import { audioExtensions } from '../../utils/audio-type.js';
import { fileTypeFromBuffer } from '../../utils/file-type.js';
import { videoExtensions } from '../../utils/video-type.js';
import { projectTemplates } from '../../utils/project-templates.js';
import { toBuffer, writeFileToLocal } from '../../utils/file.js';
import imageBuffer from '../../utils/image-buffer.js';
import audioBuffer from '../../utils/audio-buffer.js';
import { yellow } from 'kleur/colors';


async function registerAgent({agent}) {
  if (agent.id) {
    console.log(`Agent already registered: ${agent.id}`);
    return agent.id;
  }
  const {id} = (await (new Scout9Api(new Configuration({apiKey: process.env.SCOUT9_API_KEY}))).agentRegister(
    agent
  ).then(res => res.data));
  if (!id) {
    throw new Error(`Failed to register agent`);
  }
  return id;
}

/**
 * @param {string | Buffer} img
 * @param agentId
 * @returns {Promise<string>}
 */
async function writeImgToServer({img, agentId}) {
  const {url} = (await (new Scout9Api(new Configuration({apiKey: process.env.SCOUT9_API_KEY}))).agentProfileUpload(
    agentId,
    await imageBuffer(img).then(r => r.buffer)
  ).then(res => res.data));
  if (!url) {
    throw new Error(`Failed to upload agent image`);
  }
  return url;
}

async function writeTranscriptsToServer({transcripts, agentId}) {
  for (let i = 0; i < transcripts.length; i++) {
    const result = await fileTypeFromBuffer(transcripts[i]);
    if (!result || result.ext !== 'txt' || result.mime !== 'text/plain') {
      throw new Error(`Invalid transcript type: ${result?.mime || 'N/A'}, expected text/plain (.txt file, got ${result?.ext || 'Missing ext'})`);
    }
  }
  const {urls} = (await (new Scout9Api(new Configuration({apiKey: process.env.SCOUT9_API_KEY}))).agentTranscriptUpload(
    agentId,
    transcripts
  ).then(res => res.data));
  if (!urls) {
    throw new Error(`Failed to upload agent image`);
  }
  return urls;
}

async function writeAudiosToServer({audios, agentId}) {
  const buffers = [];
  for (let i = 0; i < audios.length; i++) {
    const {buffer} = await audioBuffer(audios[i], true);
    buffers.push(buffer);
  }
  const {urls} = (await (new Scout9Api(new Configuration({apiKey: process.env.SCOUT9_API_KEY}))).agentTranscriptUpload(
    agentId,
    buffers
  ).then(res => res.data));
  if (!urls) {
    throw new Error(`Failed to upload agent image`);
  }
  return urls;
}

export default async function loadAgentConfig({
  cwd = process.cwd(),
  dest = '/tmp/project',
  deploying = false,
  src = 'src',
  cb = (message) => {
  }
} = {}) {
  const paths = globSync(`${src}/entities/agents/{index,config}.{ts,js}`, {cwd, absolute: true});
  if (paths.length === 0) {
    throw new Error(`Missing required agents entity file, rerun "scout9 sync" to fix`);
  }
  if (paths.length > 1) {
    throw new Error(`Multiple agents entity files found, rerun "scout9 sync" to fix`);
  }

  const sourceFile = paths[0];

  /**
   * @type {Array<Agent> | function(): Array<Agent> | function(): Promise<Array<Agent>>}
   */
  const mod = await requireProjectFile(sourceFile).then(mod => mod.default);

  // @type {Array<Agent>}
  let agents = [];
  const entityType = checkVariableType(mod);
  switch (entityType) {
    case 'async function':
    case 'function':
      agents = await mod();
      break;
    case 'array':
      agents = mod;
      break;
    default:
      throw new Error(`Invalid entity type (${entityType}) returned at "${path}"`);
  }

  let serverDeployed = false; // Track whether we deployed to server, so that we can sync code base

  // Send warnings if not properly registered
  for (const agent of agents) {

    if (!agent.id && deploying) {
      agent.id = await registerAgent({agent});
      cb(`✅ Registered ${agent.firstName || 'agent'} with id: ${agent.id}`);
      serverDeployed = true;
    }

    if (!agent.forwardPhone && !agent.forwardEmail) {
      cb(yellow(`⚠️src/entities/agents.js|ts: neither a ".forwardPhone" or ".forwardEmail" to ${agent.firstName || JSON.stringify(agent)} - messages cannot be forward to you.`));
    }
    if (!agent.programmablePhoneNumber) {
      const userName = agent.firstName ? `${agent.firstName}${agent.lastName ? ' ' + agent.lastName : ''}` : agent.forwardPhone;
      cb(`⚠️${colors.yellow('Warning')}: ${userName} does not have a masked phone number to do auto replies. You can register one at ${colors.cyan(
        'https://scout9.com/b')} under ${colors.green('users')} > ${colors.green(userName)}. Then run ${colors.cyan(
        'scout9 sync')} to update.`);
    }
    if (agent.forwardPhone && agents.filter(a => a.forwardPhone && (a.forwardPhone === agent.forwardPhone)).length > 1) {
      cb(yellow(`⚠️ src/entities/agents.js|ts: ".forwardPhone: ${agent.forwardPhone}" should only be associated to one agent within your project`));
    }
    if (agent.forwardEmail && agents.filter(a => a.forwardEmail && (a.forwardEmail === agent.forwardEmail)).length > 1) {
      cb(yellow(`⚠️ src/entities/agents.js|ts: ".forwardEmail: ${agent.forwardEmail}" can only be associated to one agent within your project`));
    }

    // Handle agent image changes
    if (agent.img) {
      if (typeof agent.img === 'string') {
        if (!agent.img.startsWith('https://storage.googleapis.com')) {
          // Got string file, must either be a URL or a local file path
          if (deploying) {
            agent.img = await writeImgToServer({
              img: agent.img,
              agentId: agent.id
            });
            cb(`✅ Uploaded ${agent.firstName || 'agent'}'s profile image to ${agent.img}`);
            serverDeployed = true;
          } else {
            agent.img = await writeFileToLocal({
              file: agent.img,
              fileName: `${agent.firstName || 'agent'}.png`
            }).then(({uri, isImage}) => {
              if (!isImage) {
                throw new Error(`Invalid image type: ${typeof agent.img}`);
              }
              return uri;
            });
            cb(`✅ Copied ${agent.firstName || 'agent'}'s profile image to ${agent.img}`);
          }
        }
      } else if (Buffer.isBuffer(agent.img)) {
        if (deploying) {
          agent.img = await writeImgToServer({
            img: agent.img,
            fileName: `${agent.firstName || 'agent'}.png`,
            agentId: agent.id
          });
          cb(`✅ Uploaded ${agent.firstName || 'agent'}'s profile image to ${agent.img}`);
          serverDeployed = true;
        } else {
          agent.img = await writeFileToLocal({
            file: agent.img,
            fileName: `${agent.firstName || 'agent'}.png`
          }).then(({uri, isImage}) => {
            if (!isImage) {
              throw new Error(`Invalid image type: ${typeof agent.img}`);
            }
            return uri;
          });
          cb(`✅ Copied ${agent.firstName || 'agent'}'s profile image to ${agent.img}`);
        }
      } else {
        throw new Error(`Invalid img type: ${typeof agent.img}`);
      }
    }


    // Handle transcripts
    if ((agent?.transcripts || []).length > 0) {
      const deployedTranscripts = [];
      const pendingTranscripts = [];
      for (const transcript of agent.transcripts) {
        if (typeof transcript === 'string') {
          if (!transcript.startsWith('https://storage.googleapis.com')) {
            pendingTranscripts.push(await fs.readFile(transcript));
          } else {
            deployedTranscripts.push(transcript);
          }
        } else if (Buffer.isBuffer(transcript)) {
          const txtResult = await fileTypeFromBuffer(transcript);
          if (txtResult?.ext !== 'txt' || txtResult?.mime !== 'text/plain') {
            throw new Error(`Invalid transcript type: ${txtResult?.mime || 'N/A'}, expected text/plain (.txt file, got ${txtResult?.ext || 'Missing ext'})`);
          }
          pendingTranscripts.push(transcript);
        } else {
          throw new Error(`Invalid transcript type: ${typeof transcript}`);
        }
      }

      let urls = [];
      if (deploying) {
        urls = await writeTranscriptsToServer({transcripts: pendingTranscripts, agentId: agent.id});
        cb(`✅ Uploaded ${agent.firstName || 'agent'}'s transcripts to ${urls}`);
        serverDeployed = true;
      } else {
        for (let i = 0; i < pendingTranscripts.length; i++) {
          const transcript = pendingTranscripts[i];
          urls.push(await writeFileToLocal({
              file: transcript,
              fileName: `transcript_${i + deployedTranscripts.length}.txt`
            }).then(({uri, mime, ext}) => {
              if (mime !== 'text/plain') {
                throw new Error(`Invalid transcript type: ${mime}, expected text/plain (.txt file, got ${ext})`);
              }
              return uri;
            })
          );
        }
        cb(`✅ Copied ${agent.firstName || 'agent'}'s transcripts to ${urls}`);
      }

      agent.transcripts = [
        ...deployedTranscripts,
        ...urls
      ];
    }

    if ((agent?.audios || []).length > 0) {
      const deployedAudios = [];
      const pendingAudios = [];
      for (const audio of agent.audios) {
        if (typeof audio === 'string') {
          if (!audio.startsWith('https://storage.googleapis.com')) {
            // If not on GCS, then it must be a local file path or remote URL
            pendingAudios.push(await toBuffer(audio).then(({buffer, ext, mime, isAudio, isVideo}) => {
              if (!isAudio && !isVideo) {
                throw new Error(`Invalid audio/video type: ${mime}, expected audio/* or video/* got ${ext}`);
              }
              return buffer;
            }));
          } else {
            // Already deployed, append string URL
            deployedAudios.push(audio);
          }
        } else if (Buffer.isBuffer(audio)) {
          const fileType = await fileTypeFromBuffer(audio);
          if (!fileType) {
            throw new Error(`Invalid audio type: ${typeof audio}`);
          }
          if (videoExtensions.has(fileType.ext) || audioExtensions.has(fileType.ext)) {
            pendingAudios.push(audio);
          } else {
            throw new Error(`Invalid audio/video type: ${fileType.mime}, expected audio/* or video/*, got ${fileType.ext}`);
          }
        } else {
          throw new Error(`Invalid audio type: ${typeof audio}`);
        }
      }

      let urls = [];
      if (deploying) {
        urls = await writeAudiosToServer({audios: pendingAudios, agentId: agent.id});
        cb(`✅ Uploaded ${agent.firstName || 'agent'}'s audios to ${urls}`);
        serverDeployed = true;
      } else {
        for (let i = 0; i < pendingAudios.length; i++) {
          const audio = pendingAudios[i];
          urls.push(await writeFileToLocal({
            file: audio,
            fileName: `audio_${i + deployedAudios.length}`
          }).then(({uri, mime, ext, isAudio, isVideo}) => {
            if (!isAudio && !isVideo) {
              throw new Error(`Invalid audio/video type: ${mime}, expected audio/* or video/* got ${ext}`);
            }
            return uri;
          }));
        }
      }

      agent.audios = [
        ...deployedAudios,
        ...urls
      ];
    }
  }

  const result = (deploying ? agentsConfigurationSchema : agentsBaseConfigurationSchema).safeParse(agents);
  if (!result.success) {
    result.error.source = paths[0];
    throw result.error;
  }

  if (serverDeployed) {
    cb(`Syncing ${sourceFile} with latest server changes`);
    await fs.writeFile(sourceFile, projectTemplates.entities.agents({agents, ext: path.extname(sourceFile)}));
    // const update = await p.confirm({
    //   message: `Changes uploaded, sync local entities/agents file?`,
    //   initialValue: true
    // });
    // if (update) {
    // }
  }

  return agents;
}
