
/**
 * Example entity to help us differentiate if a user wants a delivery or pickup order
 * @returns {IEntityBuildConfig}
 */
export default async function delivery_methodEntity() {
  return {
    "definitions": [
      {
        "value": "delivery",
        "text": [
          "delivery",
          "deliver",
          "delivered",
          "dropped off",
          "drop off"
        ]
      },
      {
        "value": "pickup",
        "text": [
          "pickup",
          "pick this one up",
          "pick up"
        ]
      }
    ],
    "training": [
      {
        "text": "I'll have my order %delivery_method%",
        "intent": "delivery_method"
      },
      {
        "text": "I'll do a %delivery_method% order",
        "intent": "delivery_method"
      },
      {
        "text": "%delivery_method% please",
        "intent": "delivery_method"
      }
    ],
    "tests": [
      {
        "text": "drop off order please",
        "expected": {
          "intent": "delivery_method",
          "context": [
            {
              "delivery_method": "delivery"
            }
          ]
        }
      },
      {
        "text": "I'll pick this one up",
        "expected": {
          "intent": "delivery_method",
          "context": [
            {
              "delivery_method": "pickup"
            }
          ]
        }
      }
    ]
  };
}
