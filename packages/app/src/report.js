import { red, cyan, green, grey, bold, italic, yellow } from 'kleur/colors';
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
  logger.primary(`Scout9 App For: ${config.organization.name} ${config.tag}`);
  logger.log(`LLM Engine: ${config.llm.engine} - ${config.llm.model}`);
  logger.log(`PMT Engine: ${config.pmt.engine} - ${config.pmt.model}`);
  logger.log(`Max Lock Attempts: ${config?.maxLockAttempts || 3}`);
  logger.log(`Initial Context:\n\t${(config?.initialContext || []).join('\n\t')}`);
  logger.primary(`${config.agents.length} Persona${config.agents.length > 1 ? 's' : ''}\n\n`);
  for (const agent of config.agents) {
    logger.primary(`${agent.firstName} ${agent.lastName} - ${agent.context}`);
    let phone = agent.deployed?.phone || agent?.programmablePhoneNumber || '';
    phone = phone ? green(phone) : '';
    const phoneForward = agent.forwardPhone ? cyan(agent.forwardPhone) + ' (forward)' : red('No Forward Configured');

    const web = agent?.deployed?.web ? cyan(agent.deployed.web) : red('None Configured');
    let email = agent.deployed?.email || agent?.programmableEmail || '';
    email = email ? green(email) : red('None Configured');
    const emailForward = agent.forwardEmail ? cyan(agent.forwardEmail) + ' (forward)' : red('No Forward Configured');
    logger.info(`Web: ${web}`);
    if (phone) {
      logger.info(`${phone} --> ${phoneForward}`);
    }
    if (email) {
      logger.info(`${email} --> ${emailForward}`);
    }
    logger.info('\n\n');
  }
  logger.primary(`\n\n${config.entities.length} ${config.entities.length > 1 ? 'Entities' : 'Entity'}\n\n`);

  for (const entityConfig of config.entities) {
    const {entity, api, entities, training, tests, definitions} = entityConfig;
    logger.primary(`${entity}`);
    if (definitions && definitions.length > 0) {
      logger.info(`Definitions: ${definitions.length}`);
    }
    if (training && training.length > 0) {
      logger.info(`Training: ${training.length}`);
    }
    if (tests && tests.length > 0) {
      logger.info(`Tests: ${tests.length}`);
    }
    if (api?.QUERY) {
      logger.info(`QUERY: ${api.QUERY ? green('on') : red('off')}`);
    }
    if (api?.GET) {
      logger.info(`GET: ${api.GET ? green('on') : red('off')}`);
    }
    if (api?.POST) {
      logger.info(`POST: ${api.POST ? green('on') : red('off')}`);
    }
    if (api?.PUT) {
      logger.info(`PUT: ${api.PUT ? green('on') : red('off')}`);
    }
    if (api?.PATCH) {
      logger.info(`PATCH: ${api.PATCH ? green('on') : red('off')}`);
    }
    if (api?.DELETE) {
      logger.info(`DELETE: ${api.DELETE ? green('on') : red('off')}`);
    }
  }

}
