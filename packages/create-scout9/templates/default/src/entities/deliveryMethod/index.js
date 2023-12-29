// import { EntityRootConfiguration } from '../../../platform/src/runtime/client/entity';

// export type DeliveryMethod = {
//   deliveryMethod: 'pickup' | 'delivery';
// }

/**
 * Example entity to help us differentiate if a user wants a delivery or pickup order
 * @returns {IEntityBuildConfig}
 */
export default function () {
  return {
    definitions: [
      {
        value: 'delivery',
        text: [
          'delivery',
          'deliver',
          'delivered',
          'dropped off',
          'drop off',
        ]
      },
      {
        value: 'pickup',
        text: [
          'pickup',
          'pick this one up',
          'pick up',
        ]
      },
    ],
    training:
      [
        ...[
          'I\'ll have my order %delivery_method%',
          'I\'ll do a %delivery_method% order',
          '%delivery_method% please',
        ].map((text) => ({text, intent: 'delivery_method'})),
      ],
    tests: [
        {
          text: 'drop off order please',
          expected: {
            intent: 'deliveryMethod',
            context: {
              'deliveryMethod': 'delivery'
            }
          },
        },
        {
          text: 'I\'ll pick this one up',
          expected: {
            intent: 'deliveryMethod',
            context: {
              'deliveryMethod': 'pickup'
            }
          },
        }
      ],
  }
}
