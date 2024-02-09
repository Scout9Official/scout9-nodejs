/**
 * Required core entity type: Agents represents you and your team
 * @returns {Array<import('@scout9/app').Agent>}
 */
export default function Agents() {
  return [
    {
      id: 'persona-1',
      firstName: 'Agent',
      lastName: 'Smith',
      forwardPhone: '+15555555555',
      forwardEmail: '',
    }
  ];
}
