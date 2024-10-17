import polka from 'polka';
import sirv from 'sirv';
import compression from 'compression';
import bodyParser from 'body-parser';
import { config as dotenv } from 'dotenv';
import { Configuration, Scout9Api } from '@scout9/admin';
import { EventResponse, ProgressLogger } from '@scout9/app';
import { WorkflowEventSchema, WorkflowResponseSchema } from '@scout9/app/schemas';
import { Spirits } from '@scout9/app/spirits';
import path, { resolve } from 'node:path';
import fs from 'node:fs';
import https from 'node:https';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readdir } from 'fs/promises';
import { ZodError } from 'zod';
import { fromError } from 'zod-validation-error';
import { bgBlack, blue, bold, cyan, green, grey, magenta, red, white } from 'kleur/colors';
import projectApp from './src/app.js';
import config from './config.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dev = process.env.DEV_MODE === 'true' || process.env.TEST_MODE === 'true';

class ServerCache {
  constructor(filePath = path.resolve(__dirname, './server.cache.json')) {
    this.filePath = filePath;
    this._load();
  }

  isTested() {
    return this._cache.tested === true;
  }

  setTested(value = true) {
    this._cache.tested = value;
    this._save();
  }

  reset(override = {tested: false}) {
    this._save(override);
    this._cache = override;
  }

  _load() {
    try {
      this._cache = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
      return this._cache;
    } catch (e) {
      if (e.code === 'ENOENT') {
        this._save();
      } else {
        throw e;
      }
    }
  }

  _save(override) {
    fs.writeFileSync(this.filePath, JSON.stringify(override || this._cache || {tested: false}));
  }
}


// Ensure .env config is set (specifically SCOUT9_API_KEY)
const configFilePath = path.resolve(process.cwd(), './.env');
dotenv({path: configFilePath});

const configuration = new Configuration({
  apiKey: process.env.SCOUT9_API_KEY || ''
});
const scout9 = new Scout9Api(configuration);
const cache = new ServerCache();
cache.reset();

const simplifyZodError = (error, tag = undefined) => {
  const validationError = fromError(error);
  if (tag) {
    validationError.message = validationError.message.replace('Validation error', tag);
  }
  return validationError;
};

const handleError = (e, res = undefined, tag = undefined, body = undefined) => {
  let name = e?.name || 'Runtime Error';
  let message = e?.message || 'Unknown error';
  let code = typeof e?.code === 'number'
    ? e.code
    : typeof e?.status === 'number'
      ? e.status
      : 500;
  if ('response' in e) {
    const response = e.response;
    if (response?.status) {
      code = response.status;
    }
    if (response?.statusText) {
      name = response.statusText;
    }
    if (response?.data) {
      message = response.data;
    } else if (response?.body) {
      message = response.body;
    }
  }
  if (body) {
    console.log(grey(JSON.stringify(body, null, dev ? 2 : undefined)));
  }
  if (tag && typeof tag === 'string') {
    message = `${tag}: ${message}`;
  }
  if (typeof e?.constructor?.name === 'string') {
    message = `(${e?.constructor?.name}) ${message}`;
  }
  console.log(red(`${bold(`${code} Error`)}: ${message}`));
  if ('stack' in e) {
    console.log('STACK:', grey(e.stack));
  }
  if (body) {
    console.log('INPUT:', grey(JSON.stringify(body, null, dev ? 2 : undefined)));
  }
  if (res) {
    res.writeHead(code, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({
      name,
      error: message,
      code
    }));
  }
};

const handleZodError = ({
  error,
  res = undefined,
  code = 500,
  status,
  name,
  bodyLabel = 'Provided Input',
  body = undefined,
  action = ''
}) => {
  res?.writeHead?.(code, {'Content-Type': 'application/json'});
  if (error instanceof ZodError) {
    const formattedError = simplifyZodError(error);
    res?.end?.(JSON.stringify({
      status,
      error: formattedError.message,
      errors: [formattedError.message]
    }));
    console.log(red(`${bold(`${name}`)}:`));
    if (body) {
      console.log(grey(`${bodyLabel}:`));
      console.log(grey(JSON.stringify(body, null, dev ? 2 : undefined)));
    }
    console.log(red(`${action}${formattedError}`));
  } else {
    console.error(error);
    error.message = `${name}: ` + error.message;
    res?.end?.(JSON.stringify({
      status,
      error: error.message,
      errors: [error.message]
    }));
    throw new Error(`${name}: Provided error was not a ZodError`);
  }
};

const makeRequest = async (options, maxRedirects = 10) => {
  return new Promise((resolve, reject) => {

    if (maxRedirects < 0) {
      reject(new Error('Too many redirects'));
      return;
    }

    const req = https.request(options, (res) => {
      console.log(`STATUS: ${res.statusCode}`);
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Handle redirect
        console.log(`Redirecting to ${res.headers.location}`);
        const newUrl = new URL(res.headers.location);
        const newOptions = {
          hostname: newUrl.hostname,
          port: newUrl.port || 443,
          path: newUrl.pathname,
          method: 'GET', // Usually redirects are GET, adjust if necessary
          headers: options.headers // Reuse original headers
          // Add any other necessary options here
        };
        // Recursive call to handle redirect
        resolve(makeRequest(newOptions, maxRedirects - 1));
      } else {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      }
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();

  });
};


const app = polka();

app.use(bodyParser.json());

if (dev) {
  app.use(compression());
  app.use(sirv(path.resolve(__dirname, 'public'), {dev: true}));
}

// Root application POST endpoint will run the scout9 app
app.post(dev ? '/dev/workflow' : '/', async (req, res) => {
  let workflowEvent;

  try {
    workflowEvent = WorkflowEventSchema.parse(req.body.event);
    globalThis.SCOUT9 = {
      ...workflowEvent,
      $convo: req.body.$convo
    };
  } catch (error) {
    if (error instanceof ZodError) {
      handleZodError({
        error,
        name: 'Workflow Template Event Request Parse Error',
        body: req.body.event,
        bodyLabel: 'Provided WorkflowEvent',
        code: 400,
        res,
        status: 'Invalid WorkflowEvent Input'
      });
    } else {
      handleError(error, res, 'Workflow Template Event Parse Error', req.body.event);
    }
    return;
  }

  if (!workflowEvent) {
    handleError(new Error('No workflowEvent defined'), res, req.body.event, 'Workflow Template Event No Event');
  }
  let response;
  try {
    response = await projectApp(workflowEvent)
      .then((response) => {
        if ('toJSON' in response) {
          return response.toJSON();
        } else {
          return response;
        }
      });
  } catch (error) {
    if (error instanceof ZodError) {
      handleZodError({
        error,
        name: 'Workflow Template Event Request Parse Error',
        body: req.body.event,
        bodyLabel: 'Provided WorkflowEvent',
        code: 400,
        res,
        status: 'Invalid WorkflowEvent Input'
      });
    } else {
      handleError(error, res, 'Workflow Template Runtime Error', workflowEvent);
    }
    return;
  }

  if (!response) {
    throw new Error('No response');
  }

  try {
    const formattedResponse = WorkflowResponseSchema.parse(response);
    if (dev) {
      console.log(green(`Workflow Sending Response:`));
      console.log(grey(JSON.stringify(formattedResponse, null, 2)));
    }
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(formattedResponse));
  } catch (error) {
    if (error instanceof ZodError) {
      handleZodError({
        error,
        name: 'Workflow Template Event Response Parse Error',
        body: response,
        bodyLabel: 'Provided WorkflowResponse',
        code: 500,
        res,
        status: 'Invalid WorkflowResponse Output'
      });
    } else {
      handleError(error, res, 'Workflow Template Runtime Parse Error', response);
    }
  }
});

function isSurroundedByBrackets(str) {
  return /^\[.*\]$/.test(str);
}

function resolveEntity(entity, method) {
  const entityField = config.entities.find(e => e.entity === entity);
  if (!entityField) {
    console.error(`Invalid entity: "${entity}" not found within [${config.entities.map(e => e.entity).join(', ')}]`);
    throw new Error(`Invalid entity: not found`);
  }
  const {api, entities} = entityField;
  if (!api && !api[method]) {
    throw new Error(`Invalid entity: no API`);
  }
  if (!entities) {
    throw new Error(`Invalid entity: no path`);
  }
  return entityField;
}

async function resolveEntityApi(entity, method) {
  const paramEntity = isSurroundedByBrackets(entity);
  if (method === 'GET' && !paramEntity) {
    method = 'QUERY';
  }
  const methods = ['GET', 'UPDATE', 'QUERY', 'PUT', 'PATCH', 'DELETE'];
  if (!methods.includes(method)) {
    throw new Error(`Invalid method: ${method}`);
  }
  const {api, entities} = resolveEntity(entity, method);
  const mod = await import(pathToFileURL(path.resolve(__dirname, `./src/entities/${entities.join('/')}/api.js`)).href)
    .catch((e) => {
      switch (e.code) {
        case 'ERR_MODULE_NOT_FOUND':
        case 'MODULE_NOT_FOUND':
          console.error(e);
          throw new Error(`Invalid entity: no API method`);
        default:
          console.error(e);
          throw new Error(`Invalid entity: Internal system error`);
      }
    });
  if (mod[method]) {
    return mod[method];
  }

  if (method === 'QUERY' && mod['GET']) {
    return mod['GET'];
  }

  throw new Error(`Invalid entity: no API method`);

}


function extractParamsFromPath(path) {
  const segments = path.split('/').filter(Boolean); // Split and remove empty segments
  let params = {};
  const dataStructure = config.entities;

  // Assuming the structure starts with "/entity/"
  segments.shift(); // remove the "entity" segment

  let lastEntity;
  let lastSegment;
  segments.forEach(segment => {
    const isEntity = dataStructure.some(d => d.entity === segment || d.entity === `[${segment}]`);
    if (isEntity) {
      lastEntity = segment;
      lastSegment = segment;
    } else if (lastEntity) {
      const entityDefinition = dataStructure.find(d => {
        const index = d.entities.indexOf(lastEntity);
        return index > -1 && index === (d.entities.length - 2);
      });
      if (entityDefinition) {
        const paramName = entityDefinition.entity.replace(/[\[\]]/g, ''); // Remove brackets to get the param name
        params[paramName] = segment;
        lastSegment = entityDefinition.entity;
      }
      lastEntity = null; // Reset for next potential entity-instance pair
    }
  });

  return {params, lastEntity, lastSegment};
}

async function runEntityApi(req, res) {
  try {
    // polka doesn't support wildcards
    const {params, lastSegment} = extractParamsFromPath(req.url);
    const api = await resolveEntityApi(lastSegment, req.method.toUpperCase());
    const response = await api({
      params,
      searchParams: req?.query || {}, body: req?.body || undefined,
      id: params?.id
    });
    if (response instanceof EventResponse || !!response.body) {
      const data = response.body ?? response.data();
      res.writeHead(response.status || 200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(data));
      console.log(`${req.method} EntityApi.${lastSegment}:`);
      console.log(grey(JSON.stringify(data)));
    } else {
      throw new Error(`Invalid response: not an EventResponse`);
    }
  } catch (e) {
    console.error(`${req.method} EntityApi Runtime Error`, e.message);
    res.writeHead(500, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({error: e.message}));
  }
}

async function getFilesRecursive(dir) {
  let results = [];
  const list = await readdir(dir, {withFileTypes: true});

  for (const dirent of list) {
    const res = resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      results = results.concat(await getFilesRecursive(res)); // Recursively get files from subdirectories
    } else {
      results.push(res); // Add file to results
    }
  }

  return results;
}


const commandsDir = resolve(__dirname, `./src/commands`);

async function runCommandApi(req, res) {
  let file;
  const {body, url} = req;
  const params = url.split('/').slice(2).filter(Boolean);
  try {
    const files = await getFilesRecursive(commandsDir).then(files => files.map(file => file.replace(commandsDir, '.'))
      .filter(file => params.every(p => file.includes(p))));
    file = files?.[0];
  } catch (e) {
    console.log('No commands found', e.message);
    res.writeHead(404, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({error: `No commands found`}));
    return;
  }

  if (!file) {
    res.writeHead(404, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({error: `Unable to find command for ${url}`}));
    return;
  }

  let mod;
  try {
    mod = await import(pathToFileURL(path.resolve(commandsDir, file)).href);
  } catch (e) {
    if ('code' in e) {
      switch (e.code) {
        case 'ERR_MODULE_NOT_FOUND':
        case 'MODULE_NOT_FOUND':
          console.error(e);
          res.writeHead(404, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({error: `Invalid command: no API method found`}));
          return;
      }
    }
    console.error(e);
    res.writeHead(500, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({error: `Invalid command: Internal system error: ${e?.message ?? ''}`}));
    return;
  }

  if (!mod || !mod.default) {
    res.writeHead(500, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({error: `Command file "${file}" does not export a default command function`}));
    return;
  }

  let result;

  try {
    result = await mod.default(body)
      .then((response) => {
        if ('toJSON' in response) {
          return response.toJSON();
        } else {
          return response;
        }
      });
  } catch (e) {
    console.error('Failed to run command', e);
    res.writeHead(500, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({error: `Failed to run command: ${e.message}`}));
    return;
  }

  let responseBody = {};
  let code = 500;
  if (result) {
    if (typeof result === 'string') {
      responseBody = {message: result};
      code = 200;
    } else if (typeof result === 'object' && 'message' in result) {
      responseBody = result;
      code = 200;
    } else {
      responseBody.error = `Invalid Command Response, must either return a string or {"message": "<your message>"}`;
    }
  } else {
    responseBody.error = `No command response provided`;
  }

  res.writeHead(code, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(responseBody));
}

app.post('/commands/:command', runCommandApi);
app.post('/commands/:command/*', runCommandApi);
app.get('/entity/:entity', runEntityApi);
app.put('/entity/:entity', runEntityApi);
app.patch('/entity/:entity', runEntityApi);
app.post('/entity/:entity', runEntityApi);
app.delete('/entity/:entity', runEntityApi);
app.get('/entity/:entity/*', runEntityApi);
app.put('/entity/:entity/*', runEntityApi);
app.patch('/entity/:entity/*', runEntityApi);
app.post('/entity/:entity/*', runEntityApi);
app.delete('/entity/:entity/*', runEntityApi);

// For local development: parse a message
let devProgram;
if (dev) {

  app.get('/dev/config', async (req, res, next) => {

    // Retrieve auth token
    const {token, id} = await makeRequest({
      hostname: 'us-central1-jumpstart.cloudfunctions.net',
      port: 443,
      path: '/v1-utils-platform-token',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + process.env.SCOUT9_API_KEY
      }
    });
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({token, id, ...config}));
    try {
      if (!cache.isTested()) {
        const testableEntities = config.entities.filter(e => e?.definitions?.length > 0 || e?.training?.length > 0);
        if (dev && testableEntities.length > 0) {
          console.log(`${grey(`${cyan('>')} Testing ${bold(white(testableEntities.length))} Entities...`)}`);
          const _res = await scout9.parse({
            message: 'Dummy message to parse',
            language: 'en',
            entities: testableEntities
          });
          cache.setTested();
          console.log(`\t${green(`+ ${testableEntities.length} Entities passed`)}`);
        }
      }
    } catch (e) {
      handleError(e);
    }
  });

  const devParse = async (message, language = 'en') => {
    if (typeof message !== 'string') {
      throw new Error('Invalid message - expected to be a string');
    }
    console.log(`${grey(`${cyan('>')} Parsing "${bold(white(message))}`)}"`);
    const payload = await scout9.parse({
      message,
      language,
      entities: config.entities
    }).then((_res => _res.data));
    let fields = '';
    for (const [key, value] of Object.entries(payload.context)) {
      fields += `\n\t\t${bold(white(key))}: ${grey(JSON.stringify(value))}`;
    }
    console.log(`\tParsed in ${payload.ms}ms:${grey(`${fields}`)}:`);
    console.log(grey(JSON.stringify(payload)));
    return payload;
  };

  app.post('/dev/parse', async (req, res, next) => {
    try {
      // req.body: {message: string}
      const {message, language = 'en'} = req.body;
      const payload = await devParse(message, language);
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(payload));
    } catch (e) {
      handleError(e, res);
    }
  });

  const devForward = async (convo) => {
    console.log(`${grey(`${cyan('>')} Forwarding...`)}`);
    const payload = await scout9.forward({convo}).then((_res => _res.data));
    console.log(`\tForwarded in ${payload?.ms}ms`);
    return payload;
  };

  app.post('/dev/forward', async (req, res, next) => {
    try {
      // req.body: {message: string}
      const {convo} = req.body;
      const payload = await devForward(convo);
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(payload));
    } catch (e) {
      handleError(e, res);
    }
  });

  const devGenerate = async (messages, personaId) => {
    if (typeof messages !== 'object' || !Array.isArray(messages)) {
      throw new Error('Invalid messages array - expected to be an array of objects');
    }
    if (typeof personaId !== 'string') {
      throw new Error('Invalid persona - expected to be a string');
    }
    const persona = (config.persona || config.agents).find(p => p.id === personaId);
    if (!persona) {
      throw new Error(`Could not find persona with id: ${personaId}, ensure your project is sync'd by running "scout9 sync"`);
    }
    console.log(`${grey(`${cyan('>')} Determining ${bold(white(persona.firstName))}'s`)} response`);
    const payload = await scout9.generate({
      messages,
      persona,
      llm: config.llm,
      pmt: config.pmt
    }).then((_res => _res.data));
    console.log(`\t${grey(`Response: ${green('"')}${bold(white(payload.message))}`)}${green(
      '"')} (elapsed ${payload.ms}ms)`);

    return payload;
  };

  app.post('/dev/generate', async (req, res, next) => {
    try {
      // req.body: {conversation: {}, messages: []}
      const {messages, persona: personaId} = req.body;
      const payload = await devGenerate(messages, personaId);
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(payload));
    } catch (e) {
      handleError(e, res);
    }
  });


  // NOTE: This does not sync with localhost app, that uses its own state
  devProgram = async () => {
    // Start program where use can test via command console
    const {createInterface} = await import('node:readline');
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const persona = (config.persona || config.agents)?.[0];
    if (!persona) {
      throw new Error(`A persona is required before processing`);
    }

    /**
     * @returns {Omit<WorkflowEvent, 'message'> & {command?: CommandConfiguration}}
     */
    const createState = () => ({
      messages: [],
      conversation: {
        $id: 'dev_console_input',
        $agent: persona.id,
        $customer: 'temp',
        environment: 'web'
      },
      context: {},
      agent: persona,
      customer: {
        firstName: 'test',
        name: 'test'
      },
      intent: {current: null, flow: [], initial: null},
      stagnationCount: 0
    });

    /** @type {Omit<WorkflowEvent, 'message'> & {command?: CommandConfiguration}} */
    let state = createState();


    async function processCustomerMessage(message, callback) {
      const messagePayload = {
        id: `user_test_${Date.now()}`,
        role: 'customer',
        content: message,
        time: new Date().toISOString()
      };
      const logger = new ProgressLogger('Processing...');
      if (state.conversation.locked) {
        logger.error(`Conversation locked - ${state.conversation.lockedReason ?? 'Unknown reason'}`);
        return;
      }
      const addMessage = (payload) => {
        state.messages.push(payload);
        switch (payload.role) {
          case 'system':
            logger.write(magenta('system: ' + payload.content));
            break;
          case 'user':
          case 'customer':
            logger.write(green(`> ${state.agent.firstName ? state.agent.firstName + ': ' : ''}` + payload.content));
            break;
          case 'agent':
          case 'assistant':
            logger.write(blue(`> ${state.customer.name ? state.customer.name + ': ' : ''}` + payload.content));
            break;
          default:
            logger.write(red(`UNKNOWN (${payload.role}) + ${payload.content}`));
        }
      };

      const updateMessage = (payload) => {
        const index = state.messages.findIndex(m => m.id === payload.id);
        if (index < 0) {
          throw new Error(`Cannot find message ${payload.id}`);
        }
        state.messages[index] = payload;
      };

      const removeMessage = (payload) => {
        if (typeof payload !== 'string') {
          throw new Error(`Invalid payload`);
        }
        const index = state.messages.findIndex(m => m.id === payload.id);
        if (index < 0) {
          throw new Error(`Cannot find message ${payload.id}`);
        }
        state.messages.splice(index, 1);
      };

      const updateConversation = (payload) => {
        Object.assign(state.conversation, payload);
      };

      const updateContext = (payload) => {
        Object.assign(state.context, payload);
      };

      addMessage(messagePayload);
      const result = await Spirits.customer({
        customer: state.customer,
        config,
        parser: async (_msg, _lng) => {
          logger.log(`Parsing...`);
          return devParse(_msg, _lng);
        },
        workflow: async (workflowEvent) => {
          // Set the global variables for the workflows/commands to run Scout9 Macros
          globalThis.SCOUT9 = {
            ...workflowEvent,
            $convo: state.conversation.$id ?? state.conversation.id
          };

          logger.log(`Gathering ${state.command ? 'Command ' + state.command.entity + ' ' : ''}instructions...`);
          if (state.command) {
            const commandFilePath = resolve(commandsDir, state.command.path);
            let mod;
            try {
              mod = await import(commandFilePath);
            } catch (e) {
              logger.error(`Unable to resolve command ${state.command.entity} at ${commandFilePath}`);
              throw new Error('Failed to gather command instructions');
            }

            if (!mod || !mod.default) {
              logger.error(`Unable to run command ${state.command.entity} at ${commandFilePath} - must return a default function that returns a WorkflowEvent payload`);
              throw new Error('Failed to run command instructions');
            }

            try {

              return mod.default(workflowEvent)
                .then((response) => {
                  if ('toJSON' in response) {
                    return response.toJSON();
                  } else {
                    return response;
                  }
                })
                .then(WorkflowResponseSchema.parse);
            } catch (e) {
              logger.error(`Failed to run command - ${e.message}`);
              throw e;
            }

          } else {
            return projectApp(workflowEvent)
              .then((response) => {
                if ('toJSON' in response) {
                  return response.toJSON();
                } else {
                  return response;
                }
              })
              .then(WorkflowResponseSchema.parse);
          }
        },
        generator: async (request) => {
          logger.log(`Determining response...`);
          const personaId = typeof request.persona === 'string' ? request.persona : request.persona.id;
          return devGenerate(request.messages, personaId);
        },
        idGenerator: (prefix) => `${prefix}_test_${Date.now()}`,
        progress: (
          message,
          level,
          type,
          payload
        ) => {
          callback(message, level);
          if (type) {
            switch (type) {
              case 'ADD_MESSAGE':
                addMessage(payload);
                break;
              case 'UPDATE_MESSAGE':
                updateMessage(payload);
                break;
              case 'REMOVE_MESSAGE':
                removeMessage(payload);
                break;
              case 'UPDATE_CONVERSATION':
                updateConversation(payload);
                break;
              case 'UPDATE_CONTEXT':
                updateContext(payload);
                break;
              case 'SET_PROCESSING':
                break;
              default:
                throw new Error(`Unknown progress type: ${type}`);
            }
          }
        },
        message: messagePayload,
        context: state.context,
        messages: state.messages,
        conversation: state.conversation
      });

      // If a forward happens (due to a lock or other reason)
      if (!!result.conversation.forward) {
        if (!state.conversation.locked) {
          // Only forward if conversation is not already locked
          await devForward(state.conversation.$id);
        }
        updateConversation({locked: true});
        logger.error(`Conversation locked`);
        return;
      }

      // Process changes as a success

      // Update conversation (assuming it's changed)
      if (result.conversation.after) {
        updateConversation(result.conversation.after);
      }

      // Update conversation context (assuming it's changed)
      if (result.context) {
        updateContext(result.context.after);
      }

      if (!result.messages.after.find(m => m.id === result.message.after.id)) {
        console.error(`Message not found in result.messages.after`, result.message.after.id);
        result.messages.after.push(result.message.after);
      }

      // Sync messages state update/add/delete
      for (const message of result.messages.after) {
        // Did this exist?
        const existed = !!result.messages.before.find(m => m.id === message.id);
        if (existed) {
          updateMessage(message);
        } else {
          addMessage(message);
        }
      }
      for (const message of result.messages.before) {
        const exists = !!result.messages.after.find(m => m.id === message.id);
        if (!exists) {
          removeMessage(message.id);
        }
      }

      logger.done();
    }

    /**
     * @param {CommandConfiguration} command
     * @param {string} message
     * @param callback
     * @returns {Promise<void>}
     */
    async function processCommand(command, message, callback) {
      console.log(magenta(`> command <${command.entity}>`));
      state = createState();
      state.command = command;
      return processCustomerMessage(`Assist me in this ${command.entity} flow`, callback);
    }

    async function devProgramProcessInput(message, callback) {
      // Check if internal command
      switch (message.toLowerCase().trim()) {
        case 'context':
          console.log(white('> Current Conversation Context:'));
          console.log(grey(JSON.stringify(state.context)));
          return;
        case 'conversation':
        case 'convo':
          console.log(white('> Current Conversation State:'));
          console.log(grey(JSON.stringify(state.conversation)));
          return;
        case 'messages':
          state.messages.forEach((msg) => {
            switch (msg.role) {
              case 'system':
                console.log(magenta('\t - ' + msg.content));
                break;
              case 'user':
              case 'customer':
                console.log(green('> ' + msg.content));
                break;
              case 'agent':
              case 'assistant':
                console.log(blue('> ' + msg.content));
                break;
              default:
                console.log(red(`UNKNOWN (${msg.role}) + ${msg.content}`));
            }
          });
          return;
      }

      // Check if it's a command
      const target = message.toLowerCase().trim();
      const command = config.commands.find(command => {
        return command.entity === target;
      });
      // Run the command
      if (command) {
        return processCommand(command, message, callback);
      }

      // Otherwise default to processing customer message
      return processCustomerMessage(message, callback);
    }

    // Function to ask for input, perform the task, and then ask again
    function promptUser() {
      rl.question('> ', async (input) => {
        if (input.toLowerCase() === 'exit') {
          rl.close();
        } else {
          if (input) {
            await devProgramProcessInput(input, () => {
              //
            });
          }
          promptUser();
        }
      });
    }



    console.log(grey(`\nThe following ${bold('commands')} are available...`));
    [['context', 'logs the state context inserted into the conversation'], ['conversation', 'logs conversation details'], ['messages', 'logs all message history']].forEach(([command, description]) => {
      console.log(`\t - ${magenta(command)} ${grey(description)}`);
    });

    if (config.commands.length) {
      console.log(grey(`\nThe following ${bold('custom commands')} are available...`));
    }
    config.commands.forEach((command) => {
      console.log(magenta(`\t - ${command.entity}`));
    });

    // Start the first prompt

    console.log(white(`\nType and hit enter to test your PMT responses...\n`));
    promptUser();

    // Handle Ctrl+C (SIGINT) signal to exit gracefully
    rl.on('SIGINT', () => {
      rl.close();
      process.exit(0);
    });


  };


}


app.listen(process.env.PORT || 8080, async (err) => {
  if (err) throw err;

  const art_scout9 = `


 ________  ________  ________  ___  ___  _________  ________     
|\\   ____\\|\\   ____\\|\\   __  \\|\\  \\|\\  \\|\\___   ___\\\\  ___  \\    
\\ \\  \\___|\\ \\  \\___|\\ \\  \\|\\  \\ \\  \\\\\\  \\|___ \\  \\_\\ \\____   \\   
 \\ \\_____  \\ \\  \\    \\ \\  \\\\\\  \\ \\  \\\\\\  \\   \\ \\  \\ \\|____|\\  \\  
  \\|____|\\  \\ \\  \\____\\ \\  \\\\\\  \\ \\  \\\\\\  \\   \\ \\  \\    __\\_\\  \\ 
    ____\\_\\  \\ \\_______\\ \\_______\\ \\_______\\   \\ \\__\\  |\\_______\\
   |\\_________\\|_______|\\|_______|\\|_______|    \\|__|  \\|_______|
   \\|_________|                                                  
`;
  const art_pmt = `

  
 _______   __       __  ________ 
|       \ |  \     /  \|        \
| $$$$$$$\| $$\   /  $$ \$$$$$$$$
| $$__/ $$| $$$\ /  $$$   | $$   
| $$    $$| $$$$\  $$$$   | $$   
| $$$$$$$ | $$\$$ $$ $$   | $$   
| $$      | $$ \$$$| $$   | $$   
| $$      | $$  \$ | $$   | $$   
 \$$       \$$      \$$    \$$   
                                 
`;
  const protocol = process.env.PROTOCOL || 'http';
  const host = process.env.HOST || 'localhost';
  const port = process.env.PORT || 8080;
  const fullUrl = `${protocol}://${host}:${port}`;
  if (dev) {
    console.log(bold(green(art_scout9)));
    console.log(bold(cyan(art_pmt)));
    console.log(`${grey(`${cyan('>')} Running ${bold(white('Scout9'))}`)} ${grey('dev environment on')} ${fullUrl}`);
  } else {
    console.log(`Running Scout9 app on ${fullUrl}`);
  }
  // Run checks
  if (!fs.existsSync(configFilePath)) {
    console.log(red('Missing .env file, your PMT application may not work without it.'));
  }

  if (dev && !process.env.SCOUT9_API_KEY) {
    console.log(red(
      'Missing SCOUT9_API_KEY environment variable, your PMT application may not work without it.'));
  }

  if (process.env.SCOUT9_API_KEY === '<insert-scout9-api-key>') {
    console.log(`${red('SCOUT9_API_KEY has not been set in your .env file.')} ${grey(
      'You can find your API key in the Scout9 dashboard.')} ${bold(cyan('https://scout9.com'))}`);
  }

  if (dev) {
    devProgram();
  }

});
