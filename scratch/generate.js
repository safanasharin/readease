import fs from 'fs';

const lvl1 = [
  ['cat', '🐱'], ['dog', '🐶'], ['sun', '☀️'], ['moon', '🌙'], ['star', '⭐'],
  ['bird', '🐦'], ['fish', '🐟'], ['frog', '🐸'], ['bear', '🐻'], ['pig', '🐷'],
  ['car', '🚗'], ['bus', '🚌'], ['train', '🚆'], ['boat', '⛵'], ['plane', '✈️'],
  ['apple', '🍎'], ['banana', '🍌'], ['grape', '🍇'], ['milk', '🥛'], ['cake', '🎂']
];

const verbs1 = ['sleeps', 'runs', 'jumps', 'swims', 'flies', 'eats', 'plays', 'sings', 'walks', 'hops'];
const adjs1 = ['big', 'small', 'red', 'blue', 'fast', 'slow', 'happy', 'sad', 'good', 'bad'];

let level1 = [];
for(let i=0; i<55; i++) {
  const subj = lvl1[i % lvl1.length];
  const verb = verbs1[Math.floor(Math.random() * verbs1.length)];
  const isAdj = Math.random() > 0.5;
  if(isAdj) {
    const adj = adjs1[Math.floor(Math.random() * adjs1.length)];
    level1.push({ text: `The ${adj} ${subj[0]}.`, emoji: subj[1] });
  } else {
    level1.push({ text: `The ${subj[0]} ${verb}.`, emoji: subj[1] });
  }
}

let level2 = [];
const places = ['in the park', 'at home', 'in the tree', 'on the bed', 'in the water', 'at school', 'in the sky', 'on the grass'];
for(let i=0; i<55; i++) {
  const subj = lvl1[Math.floor(Math.random() * lvl1.length)];
  const verb = verbs1[Math.floor(Math.random() * verbs1.length)];
  const place = places[Math.floor(Math.random() * places.length)];
  const adj = adjs1[Math.floor(Math.random() * adjs1.length)];
  
  if(Math.random() > 0.5) {
     level2.push({ text: `The ${adj} ${subj[0]} ${verb} ${place}.`, emoji: subj[1] });
  } else {
     level2.push({ text: `My friend likes the ${adj} ${subj[0]}.`, emoji: subj[1] });
  }
}

let level3 = [];
const adverbs = ['quickly', 'slowly', 'happily', 'loudly', 'quietly'];
for(let i=0; i<55; i++) {
  const subj = lvl1[Math.floor(Math.random() * lvl1.length)];
  const verb = verbs1[Math.floor(Math.random() * verbs1.length)];
  const place = places[Math.floor(Math.random() * places.length)];
  const adj = adjs1[Math.floor(Math.random() * adjs1.length)];
  const adv = adverbs[Math.floor(Math.random() * adverbs.length)];
  
  if(Math.random() > 0.5) {
     level3.push({ text: `The ${adj} ${subj[0]} ${verb} ${adv} ${place}.`, emoji: subj[1] });
  } else {
     level3.push({ text: `Today, the ${adj} ${subj[0]} ${verb} ${place} with a friend.`, emoji: subj[1] });
  }
}

const content = `export const sentenceBank = {
  level1: ${JSON.stringify(level1, null, 2)},
  level2: ${JSON.stringify(level2, null, 2)},
  level3: ${JSON.stringify(level3, null, 2)},
  distractorWords: ['apple', 'book', 'chair', 'runs', 'sleeps', 'fast', 'slow', 'red', 'blue', 'happy', 'sad', 'dog', 'cat', 'water', 'sky', 'friend', 'house']
};`;

fs.writeFileSync('c:/project/readease/src/data/sentenceBuilderData.js', content);
console.log('Done!');
