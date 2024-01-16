
/**
 * Example entity to help us differentiate if a user wants a delivery or pickup order
 * @returns {IEntityBuildConfig}
 */
export default async function deliveryMethodEntity() {
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
        "text": "I'll have my order %deliveryMethod%",
        "intent": "deliveryMethod"
      },
      {
        "text": "I'll do a %deliveryMethod% order",
        "intent": "deliveryMethod"
      },
      {
        "text": "%deliveryMethod% please",
        "intent": "deliveryMethod"
      }
    ],
    "tests": [
      {
        "text": "drop off order please",
        "expected": {
          "intent": "deliveryMethod",
          "context": [
            {
              "deliveryMethod": "delivery"
            }
          ]
        }
      },
      {
        "text": "I'll pick this one up",
        "expected": {
          "intent": "deliveryMethod",
          "context": [
            {
              "deliveryMethod": "pickup"
            }
          ]
        }
      }
    ]
  };
}
