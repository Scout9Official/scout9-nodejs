/**
 * @param {Scout9ProjectBuildConfig['agents']} config
 * @param {string} exe - file extension
 * @returns {string}
 */
function agentsTemplate({agents, exe = 'js'}) {
  return `
/**
 * Required core entity type: Agents represents you and your team
 * @returns {Array<import('@scout9/app')Agent>}
 */
export default function Agents() {
  return ${JSON.stringify(agents, null, 2)};
}
`;
}

function rootTemplate({config, exe = 'js'}) {
  return `
/**
 * Configuration for the Scout9 project.
 * @type {import('@scout9/app').Scout9ProjectConfig}
 */
export default {

  /**
   * Configure large language model (LLM) settings to generate auto replies
   */
  llm: {
    engine: ${config?.llm?.engine ? `'${config.llm.engine}'` : `'openai'`},
    model: ${config?.llm?.model ? `'${config.llm.model}'` : `'gpt-3.5-turbo'`},
  },
  /**
   * Configure personal model transformer (PMT) settings to align auto replies the agent's tone
   */
  pmt: {
    engine: ${config?.pmt?.engine ? `'${config.pmt.engine}'` : `'scout9'`},
    model: ${config?.pmt?.model ? `'${config.pmt.model}'` : `'orin-2.2'`},
  },
  organization: {
    name: ${config?.organization?.name ? `'${config.organization.name}'` : `'Organization Name'`},
    description: ${config?.organization?.description ? `'${config.organization.description}'` : `'Organization Description'`},
  },
  initialContext: ${config?.initialContext ? JSON.stringify(config.initialContext, null, 2) : `[]`}
}
  `;
}

function appTemplate() {
  return `
/**
 * @param {import('@scout9/app').WorkflowEvent} event - every workflow receives an event object
 * @returns {Promise<import('@scout9/app').WorkflowResponse>} - every workflow must return a WorkflowResponse
 */
export default async function Scout9App(event) {
  return {
    forward: true,
  };
}
  `;
}

/**
 * @param {ExportedEntityBuildConfig} entity
 */
function entityTemplate({entity}) {
  let {entity: _entity, entities, api, id, ...rest} = entity;
  if (!_entity.endsWith('Entity')) {
    _entity = `${_entity}Entity`;
  }
  return `
/**
 * ${rest.description || 'Example entity to help us differentiate if a user wants a delivery or pickup order'}
 * @returns {IEntityBuildConfig}
 */
export default async function ${_entity}() {
  return ${JSON.stringify(rest, null, 2)};
}
  `;
}

function customersTemplate() {
  return `
import Scout9CRM from '@scout9/crm';
import { EventResponse } from '@scout9/app';

const crm = new Scout9CRM({apiKey: process.env.SCOUT9_API_KEY});


/**
 * Required entity - use this to sync with your CRM
 *
 * Query customer info from your CRM
 * @returns {Promise<import('@scout9/app').EventResponse<Array<import('@scout9/app').Customer>>>}
 */
export const QUERY = async ({searchParams}) => {
  const {page, q, orderBy, endAt, startAt, limit} = searchParams;
  const customers = await crm.query(
    q,
    page ? parseInt(page) : undefined,
    limit ? parseInt(limit) : undefined,
    orderBy ? parseInt(orderBy) : undefined,
    endAt ? parseInt(endAt) : undefined,
    startAt ? parseInt(startAt) : undefined,
  );
  return EventResponse.json(customers, {status: 200});
}  
  `;
}

function customerTemplate() {
  return `
import Scout9CRM from '@scout9/crm';
import { json } from '@scout9/app';

const crm = new Scout9CRM({apiKey: process.env.SCOUT9_API_KEY});

/**
 * Get customer info from your CRM
 * @returns {Promise<import('@scout9/app').EventResponse<import('@scout9/app').Customer>>}
 */
export const GET = async ({params}) => {
  return json(await crm.get(params.customer));
};

/**
 * When a customer is created on scout9's side
 *
 * Example:
 *    A new or unrecognized customer has contacted an agent. Scout9 has captured some preliminary information
 *    about them and sent this POST request. Take the information to either add a new customer record to your CRM
 *    or return an existing customer id to map the correct customer document.
 *
 * @returns {Promise<import('@scout9/app').EventResponse>}
 */
export const POST = async ({params, body: newCustomer}) => {
  // Scout9 will generate random id for new customers, but whatever id you return back will be used for the new customer
  const {id: crmId} = await crm.add({$id: params.customer, newCustomer});
  return json({success: true, id: crmId}, {status: 200});
};

/**
 * New customer info revealed, use this to save the customer info to your CRM
 *
 * Example:
 *    In a conversation, if any new data is found, Scout9 will send a PUT or PATCH request to allow for you to update
 *    your CRM accordingly.
 *
 * @returns {Promise<import('@scout9/app').EventResponse>}
 */
export const PUT = async ({params, body: updatedCustomer}) => {
  // const id = params.customer;

  console.log('updatedCustomer', updatedCustomer);
  // @TODO REST call  to api to save customer info

  // @TODO REST call to api to save customer info
  return json({success: true}, {status: 200});
};


/**
 * Customer request to be removed from platform, use this to remove/update the customer info from your CRM
 *
 * Example:
 *    A customer has opt-out of text messaging, Scout9 will send a DELETE message for you to remove any data, returning
 *    back success: true will then have Scout9 delete any data on their end as well.
 *
 * @returns {Promise<import('@scout9/app').EventResponse>}
 */
export const DELETE = async ({params, request}) => {
  await crm.remove(params.customer);
  return json({success: true}, {status: 200});
}; 
`
}

export const projectTemplates = {
  entities: {
    agents: agentsTemplate,
    entity: entityTemplate,
    customers: customersTemplate,
    customer: customerTemplate,
  },
  root: rootTemplate,
  app: appTemplate
}
