/**
 * Required core entity type: Agents represents you and your team
 * @returns {Array<import('@scout9/app').Agent>}
 */
export default function Agents() {
  return [
    {
      id: 'agent-1',
      firstName: 'Patrick',
      lastName: 'Opie',
      forwardPhone: '+15555555555',
      context: 'helps customers with placing their pizza orders',
      forwardEmail: '',
      programmablePhoneNumber: '+15555555555',
    }
  ];
}
