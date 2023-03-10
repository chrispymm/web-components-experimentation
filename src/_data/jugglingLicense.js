module.exports = [
  [
    {
      "id": "A",
      "next": "B",
      "title": "Apply for a juggling license",
      "type": "Start",
      "component": "flow-item"
    },
  ],
  [
    {
      "id": "B",
      "next": "G",
      "prev": "A",
      "title": "What are you juggling with?",
      "type": "Single question",
      "variant": "checkboxes",
      "component": "flow-item"
    },
  ],
  [
    {
      "id": "G",
      "next": "D",
      "prev": "B",
      "title": "Branching point 1",
      "type": "Branching point",
      "component": "flow-branch",
      "conditions": [
        {
          "question": "What are you juggling with?",
          "operator": "contains",
          "value": "axes",
          "target_id": "E"
        },
        {
          "target_id": "H"
        }
      ]
    },
  ],
  [
    {
      "id": "D",
      "next": "E",
      "prev": "G",
      "title": "Your details",
      "type": "multiple question",
      "component": "flow-item"
    },
    {
      "id": "H",
      "prev": "G",
      "title": "You're safe",
      "col": 4,
      "type": "Exit",
      "component": "flow-item"
    },
  ],
  [
    {
      "id": "E",
      "next": "F",
      "prev": "D",
      "title": "Check your answers",
      "type": "checkanswers",
      "component": "flow-item"
    },
  ],
  [
    {
      "id": "F",
      "prev": "E",
      "title": "Application complete",
      "type": "Confirmation",
      "component": "flow-item"
    },
  ]
]
