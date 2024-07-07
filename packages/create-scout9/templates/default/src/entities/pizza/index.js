/**
 * Example entity that breaks down the pizza the user wants to order
 * @returns {IEntityBuildConfig}
 */
export default async function () {

  return {
    definitions: [
      {
        utterance: 'size',
        value: 'small',
        text: ['small', 'sm', '6 inch', '6-inch', '6in', '6 in', '6"']
      },
      {
        utterance: 'size',
        value: 'medium',
        text: ['medium', 'med', 'md', '8 inch', '8-inch', '8in', '8 in', '8"']
      },
      {
        utterance: 'size',
        value: 'large',
        text: ['large', 'lg', '12 inch', '12-inch', '12in', '12 in', '12"']
      },
      {
        utterance: 'size',
        value: 'x-large',
        text: ['extra large', 'x-large', 'xlarge', 'xl', '16 inch', '16-inch', '16in', '16 in', '16"']
      },
      {
        utterance: 'topping',
        value: 'pepperoni',
        text: ['pepperoni']
      },
      {
        utterance: 'topping',
        value: 'sausage',
        text: ['sausage', 'italian sausage']
      },
      {
        utterance: 'topping',
        value: 'mushroom',
        text: ['mushroom', 'mushrooms', 'mush']
      },
      {
        utterance: 'topping',
        value: 'cheese',
        text: ['cheese', 'cheesy', 'cheez', 'mozarella', 'mozzarella', 'mozz']
      }
    ],
    training: [
      ...[
        'get a few pizzas',
        '%number% %topping% %size%',
        '%number% %topping% %size%, %number% %topping% %size%, and %number% %topping% %size% and that should be all',
        'Hey I would like %number% %topping% %size%',
        'Hey I would like %number% %topping% and %topping%',
        'Hey I would like %number% %topping%, %topping%, and extra %topping%', // @TODO extra would need to be a separate topping
        'Hey I would like %number% %size% %topping%, %topping%, and %topping%',
        'Could I get a %topping% pizza please?',
        'Could I get %number% %size% %topping%, %topping%, and %topping%?',
        'Can I order a %number% %size% %topping%, %topping%, and %topping%',
      ].map((text) => ({text, intent: 'pizza'})),
      ...[
        'Can you remove that %size% %topping% pizza',
        'Can you remove that %topping% %size% pizza',
        'Can you cancel that %size% %topping%',
        'Let\'s remove that %size% %topping% pizza',
        'Let\'s get rid of that %size% %topping%',
        'Let\'s remove the %size% %topping% pizza',
      ].map((text) => ({text, intent: 'remove_pizza'})),
      ...[
        'Can you remove those %topping%?',
        'Can you remove that %topping%?',
        'Actually, no  %topping%?',
        'Sorry, I don\'t want  %topping%?',
      ].map((text) => ({text, intent: 'remove_topping'})),
      ...[
        'Do you have %topping%?',
      ].map((text) => ({text, intent: 'pizza_question'})),
    ],
    tests: [
      {
        text: 'I would like 3 pepperoni medium, 2 cheese medium, and 3 sausage mushroom',
        expected: {
          intent: 'pizza',
          context: {
            pizza: [
              {
                quantity: 3,
                topping: 'pepperoni',
                size: 'medium'
              },
              {
                quantity: 2,
                topping: 'cheese',
                size: 'medium'
              },
              {
                quantity: 3,
                topping: ['sausage', 'mushroom'],
              }
            ]
          },
        },
      },
      {
        text: 'Hey I would like 3 medium pepperoni, sausage, and extra cheese',
        expected: {
          intent: 'pizza',
          context: {
            pizza: [
              {
                quantity: 3,
                topping: ['pepperoni', 'sausage', 'cheese'],
                size: 'medium'
              }
            ]
          }
        }
      }
    ]
  };
}

