const WebSocket = require('ws');

const port = process.env.PORT || 8080;

const wss = new WebSocket.Server({ port: port });

// Define the card sets 
const cards = [
  {"A_Set": ['card0', 'card0', 'card0'], "B_Set": ['card0', 'card0', 'card0']},
  {"A_Set": ['card1', 'card1', 'card1'], "B_Set": ['card1', 'card1', 'card1']},
  {"A_Set": ['card2', 'card2', 'card2'], "B_Set": ['card2', 'card2', 'card2']},
];

const awinning = [
  {"A_Set": ['card1', 'card2', 'card3'], "B_Set": ['card3', 'card2', 'card1']},
  {"A_Set": ['card4', 'card5', 'card6'], "B_Set": ['card6', 'card5', 'card4']},
  {"A_Set": ['card7', 'card8', 'card9'], "B_Set": ['card9', 'card8', 'card7']},
];

const bwinning = [
  {"A_Set": ['card10', 'card11', 'card12'], "B_Set": ['card12', 'card11', 'card10']},
  {"A_Set": ['card13', 'card14', 'card15'], "B_Set": ['card15', 'card14', 'card13']},
  {"A_Set": ['card16', 'card17', 'card18'], "B_Set": ['card18', 'card17', 'card16']},
];

let number1 = 0;
let number2 = 0;
let forceValue = null;

function getRandomIndex(list) {
  return Math.floor(Math.random() * list.length);
}

function sendRandomCardSets() {
  let selectedCards = [];

  if (forceValue === 'a') {
    selectedCards = awinning[getRandomIndex(awinning)];
  } else if (forceValue === 'b') {
    selectedCards = bwinning[getRandomIndex(bwinning)];
  } else if (number1 > number2) {
    selectedCards = awinning[getRandomIndex(awinning)];
  } else if (number2 > number1) {
    selectedCards = bwinning[getRandomIndex(bwinning)];
  } else {
    selectedCards = cards[getRandomIndex(cards)];
  }

  const response = {
    cards: selectedCards,
  };

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(response));
    }
  });

  // Reset forceValue
  forceValue = null;
}

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    console.log('Received:', message);
    try {
      const data = JSON.parse(message);
      const { key, value, force } = data;
      console.log(key);
      console.log(value);
      console.log(force);

      if (force === 'a' || force === 'b') {
        forceValue = force;
      } else if (key === 'a') {
        number1 += value;
      } else if (key === 'b') {
        number2 += value;
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  // Start sending random card sets every 1 minute
  const timerId = setInterval(() => {
    sendRandomCardSets();

    number1 = 0;
    number2 = 0;
  }, 60000); // 1 minute in milliseconds

  ws.on('close', () => {
    clearInterval(timerId);
    console.log('Client disconnected');
  });
});
