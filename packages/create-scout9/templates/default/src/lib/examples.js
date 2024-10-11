export const addressExamples = [{"address": "1223 main st, Seattle WA 98177"}, {"address": "9182 birchin street Tacoma WA, 98271"}];

export const pizzaExamples =   [
  {
    input: "Could I get 2 cheese large pizzas, one medium garlic and steak pizza, and three pepperoni and black olive?",
    output: {
      "pizzas": [
        {size: "large", quantity: 2, toppings: ["cheese"]},
        {size: "medium", quantity: 1, toppings: ["garlic", "steak"]},
        {size: null, quantity: 3, toppings: ["pepperoni", "black olive"]}
      ],
    }
  },
  {
    input: "Could I get 2 cheese large pizzas, one medium garlic and steak pizza, four pepperoni and black olive, and 1 diet coke, and 1 mountain dew",
    output: {
      "pizzas": [
        {size: "large", quantity: 2, toppings: ["cheese"]},
        {size: "medium", quantity: 1, toppings: ["garlic", "steak"]},
        {size: null, quantity: 4, toppings: ["pepperoni", "black olive"]}
      ],
      "drinks": [
        {size: null, quantity: 1, name: "diet coke"},
        {size: null, quantity: 1, name: "mountain dew"},
      ]
    }
  }
];
