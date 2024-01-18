import moment from 'moment';

/**
 * An example service of retrieving an available driver
 */
export async function getAvailableDriver(address: string) {
  // @TODO call driver service to get available driver
  return {
    driver: {
      name: 'Alex'
    },
    deliveryEstimate: moment().add(30, 'minutes')
  }
}
