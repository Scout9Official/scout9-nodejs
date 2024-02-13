import { red, cyan, green, dim, white, grey, bold, italic, magenta, yellow } from 'kleur/colors';
import { ProgressLogger } from './utils/index.js';

/**
 *
 * @param {import('zod').ZodError} zodError
 * @param {string} source
 */
export function logUserValidationError(
  zodError,
  source,
) {
  const issues = zodError.issues || [];

  console.log(red(`Scout9 Schema Validation Error at ${bold(source)}, fix these issues and rerun`));
  for (const {code, expected, received, path, message} of issues) {
    const pathStr = path.join('.');
    let text = '';
    const objectPath = red(`${italic('.' + pathStr)}`) + grey(':');
    switch (code) {
      case 'invalid_type':
        text = `Expected type ${cyan(expected)} but received ${yellow(received)}.`;
        break;
      case 'invalid_enum':
        text = `Expected one of ${expected.map(e => cyan(e)).join(', ')} but received ${yellow(received)}.`;
        break;
      default:
        text = yellow(`(${code}) ${message} .${pathStr}`);
    }
    console.log('\t', objectPath, grey(`${text}`));
  }
}


/**
 * @param {Scout9ProjectBuildConfig} config
 * @param {ProgressLogger} logger
 */
export function report(config, logger) {
  logger.primary(`${white('Scout9 App For:')} ${cyan(config.organization.name)} ${magenta(config.tag)}`);
  if (config.organization?.dashboard) {
    logger.info(`Dashboard: ${cyan(config.organization.dashboard)}`);
  }
  logger.info(`LLM Engine: ${cyan(config.llm.engine)} ${magenta(config.llm.model)}`);
  logger.info(`PMT Engine: ${cyan(config.pmt.engine)} ${magenta(config.pmt.model)}`);
  logger.info(`Max Lock Attempts: ${cyan(config?.maxLockAttempts || 3)}`);
  logger.info(`Initial Context:\n\t\t${(config?.initialContext || []).map(i => `${white('-')} ${magenta('"')}${italic(i)}${magenta('"')}`).join('\n\t\t')}`);
  // logger.primary(`${config.agents.length} Persona${config.agents.length > 1 ? 's' : ''}\n\n`);
  for (const agent of config.agents) {
    logger.primary(`${grey('Persona: ')}${agent.firstName}${agent.lastName ? ' ' + agent.lastName : ''}`);
    logger.info(`Context: ${magenta('"')}${italic(agent.context)}${magenta('"')}`);
    let phone = agent.deployed?.phone || agent?.programmablePhoneNumber || '';
    phone = phone ? cyan(phone) : '';
    const phoneForward = agent.forwardPhone ? magenta(agent.forwardPhone) : red('Not Configured');

    const web = agent?.deployed?.web ? cyan(agent.deployed.web) : red('Not Configured');
    let email = agent.deployed?.email || agent?.programmableEmail || '';
    email = email ? cyan(email) : red('None Configured');
    const emailForward = agent.forwardEmail ? magenta(agent.forwardEmail) : red('Not Configured');
    logger.info(`Web: ${web}`);
    if (phone) {
      logger.info(`Phone: ${phone} --> ${italic('forwards to')} ${dim(phoneForward)}`);
    }
    if (email) {
      logger.info(`Email: ${email} --> ${italic('forwards to')} ${emailForward}`);
    }
  }
  // logger.primary(`\n\n${config.entities.length} ${config.entities.length > 1 ? 'Entities' : 'Entity'}\n\n`);

  for (const entityConfig of config.entities) {
    const {entity, api, entities, training, tests, definitions} = entityConfig;
    const parents = entities.slice(0, -1).join('/')
    logger.primary(`${grey('Entity: ')}${parents}${magenta(entity)}`);
    if (definitions && definitions.length > 0) {
      logger.info(`${cyan(definitions.length)} definition${definitions.length > 1 ? 's' : ''}`);
    }
    if (training && training.length > 0) {
      logger.info(`${cyan(training.length)} training phrase${training.length > 1 ? 's' : ''}`);
    }
    if (tests && tests.length > 0) {
      logger.info(`${cyan(tests.length)} test${tests.length > 1 ? 's' : ''}`);
    }
    if (!api) {
      logger.info(`${cyan('0')} api's exported`);
    }
    if (api?.QUERY) {
      logger.info(`${cyan('QUERY')}: ${api.QUERY ? green('on') : red('off')}`);
    }
    if (api?.GET) {
      logger.info(`${cyan('GET')}: ${api.GET ? green('on') : red('off')}`);
    }
    if (api?.POST) {
      logger.info(`${cyan('POST')}: ${api.POST ? green('on') : red('off')}`);
    }
    if (api?.PUT) {
      logger.info(`${cyan('PUT')}: ${api.PUT ? green('on') : red('off')}`);
    }
    if (api?.PATCH) {
      logger.info(`${cyan('PATCH')}: ${api.PATCH ? green('on') : red('off')}`);
    }
    if (api?.DELETE) {
      logger.info(`${cyan('DELETE')}: ${api.DELETE ? green('on') : red('off')}`);
    }
  }

  for (const workflowConfig of config.workflows) {
    const {entity, api, entities } = workflowConfig;
    const parents = entities.slice(0, -1).join('/')
    logger.primary(`${grey('Workflow: ')}${parents}${magenta(entity)}`);
    if (!api) {
      logger.info(`${cyan('0')} api's exported`);
    }
  }

}
