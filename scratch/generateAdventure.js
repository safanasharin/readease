import fs from 'fs';

const categories = {
  Animals: {
    pictureStories: [
      { emojis: ["🐶", "⚽"], target: "The dog plays with a ball.", distractors: ["The fish swims.", "The bird flies."] },
      { emojis: ["🐱", "🧶"], target: "The cat plays with yarn.", distractors: ["The dog barks loud.", "The frog jumps high."] },
      { emojis: ["🐰", "🥕"], target: "The rabbit eats a carrot.", distractors: ["The bear sleeps.", "The pig runs."] },
      { emojis: ["🐻", "🍯"], target: "The bear eats honey.", distractors: ["The bird sings.", "The cat sleeps."] },
      { emojis: ["🐒", "🍌"], target: "The monkey eats a banana.", distractors: ["The fish swims.", "The dog runs."] },
      { emojis: ["🐸", "🪷"], target: "The frog sits on a lily pad.", distractors: ["The bird flies fast.", "The cat plays."] },
      { emojis: ["🐘", "🥜"], target: "The elephant eats peanuts.", distractors: ["The monkey jumps.", "The dog sleeps."] }
    ],
    finishStories: [
      { story: "Tom found a puppy.", target: "Tom helped the puppy.", distractors: ["Tom flew to the moon.", "Tom became a fish."] },
      { story: "The cat saw a mouse.", target: "The cat chased the mouse.", distractors: ["The cat read a book.", "The cat drove a car."] },
      { story: "The bird built a nest.", target: "The bird laid eggs.", distractors: ["The bird swam in the sea.", "The bird ate a pizza."] },
      { story: "The dog was hungry.", target: "The dog ate some food.", distractors: ["The dog flew away.", "The dog painted a picture."] },
      { story: "The bear was tired.", target: "The bear went to sleep.", distractors: ["The bear drove a bus.", "The bear played tennis."] },
      { story: "The frog saw a fly.", target: "The frog ate the fly.", distractors: ["The frog read a story.", "The frog rode a bike."] }
    ],
    talking: [
      { target: "The dog is running fast." },
      { target: "The cat sleeps on the bed." },
      { target: "The bird sings a sweet song." },
      { target: "The fish swims in the blue water." },
      { target: "The bear is very big and brown." },
      { target: "The frog jumps really high." },
      { target: "The rabbit hops in the garden." },
      { target: "The elephant is very strong." }
    ],
    chooseBest: [
      { emoji: "🍎", target: "I eat an apple.", distractors: ["Apple eats me.", "Run apple tree."] },
      { emoji: "🐱", target: "I have a pet cat.", distractors: ["Cat drive the car.", "The cat read book."] },
      { emoji: "🐶", target: "The dog is my friend.", distractors: ["Dog fly in sky.", "The dog is blue bird."] },
      { emoji: "🐰", target: "The rabbit is fast.", distractors: ["Rabbit swim sea.", "The rabbit eat moon."] },
      { emoji: "🐴", target: "I ride the horse.", distractors: ["Horse ride me.", "The horse sing song."] }
    ],
    emojiStories: [
      { emojis: ["🌞", "🏖️", "👧"], target: "The girl plays at the beach.", distractors: ["The tiger drives a bus.", "The fish climbs a tree."] },
      { emojis: ["👦", "🐶", "🥎"], target: "The boy plays fetch with the dog.", distractors: ["The cat reads a book.", "The bird swims in the sea."] },
      { emojis: ["🐱", "🥛", "😋"], target: "The cat drinks milk happily.", distractors: ["The dog drives a car.", "The frog flies high."] },
      { emojis: ["🐻", "🌲", "😴"], target: "The bear sleeps under the tree.", distractors: ["The fish runs fast.", "The bird plays tennis."] },
      { emojis: ["🐒", "🍌", "😄"], target: "The monkey is happy with a banana.", distractors: ["The dog is sad.", "The cat is angry."] }
    ]
  },
  School: {
    pictureStories: [
      { emojis: ["🏫", "🚌"], target: "The school bus is here.", distractors: ["The car is red.", "The boat is fast."] },
      { emojis: ["📚", "✏️"], target: "I read a book and write.", distractors: ["I play with a ball.", "I eat an apple."] },
      { emojis: ["👩‍🏫", "📖"], target: "The teacher reads a story.", distractors: ["The dog barks loud.", "The cat sleeps."] },
      { emojis: ["🎒", "🍎"], target: "I have an apple in my bag.", distractors: ["I have a dog.", "I have a cat."] },
      { emojis: ["🎨", "🖌️"], target: "I paint a picture.", distractors: ["I play music.", "I run fast."] },
      { emojis: ["🎵", "🎹"], target: "I play the piano.", distractors: ["I paint a picture.", "I read a book."] },
      { emojis: ["🏃", "⚽"], target: "I play football at school.", distractors: ["I sleep at school.", "I fly at school."] }
    ],
    finishStories: [
      { story: "The bell rang.", target: "It was time for school.", distractors: ["It was time to sleep.", "The moon came out."] },
      { story: "I opened my book.", target: "I started to read.", distractors: ["I ate my book.", "I threw the book away."] },
      { story: "The teacher asked a question.", target: "I raised my hand.", distractors: ["I went to sleep.", "I ran away."] },
      { story: "It was time for recess.", target: "We went outside to play.", distractors: ["We went to sleep.", "We stayed inside."] },
      { story: "I finished my homework.", target: "I packed my bag.", distractors: ["I threw my bag.", "I ate my homework."] },
      { story: "We had a math test.", target: "I did my best.", distractors: ["I flew to the moon.", "I ate a pizza."] }
    ],
    talking: [
      { target: "I like to read books." },
      { target: "My teacher is very nice." },
      { target: "I play with my friends at school." },
      { target: "I write with a pencil." },
      { target: "I draw a beautiful picture." },
      { target: "I sing a happy song." },
      { target: "I learn new things every day." },
      { target: "I love going to school." }
    ],
    chooseBest: [
      { emoji: "🎒", target: "I pack my bag.", distractors: ["Bag pack me.", "The bag run fast."] },
      { emoji: "📚", target: "I read a book.", distractors: ["Book read me.", "The book fly sky."] },
      { emoji: "✏️", target: "I write with a pencil.", distractors: ["Pencil write me.", "The pencil eat apple."] },
      { emoji: "🏫", target: "I go to school.", distractors: ["School go me.", "The school sleep."] },
      { emoji: "👩‍🏫", target: "The teacher helps me.", distractors: ["Teacher eat me.", "The teacher fly sky."] }
    ],
    emojiStories: [
      { emojis: ["👦", "🎒", "🏫"], target: "The boy goes to school.", distractors: ["The dog goes to space.", "The cat goes to sleep."] },
      { emojis: ["👧", "📚", "🤓"], target: "The girl likes to read.", distractors: ["The bird likes to swim.", "The fish likes to fly."] },
      { emojis: ["🧑‍🏫", "➕", "🧠"], target: "The teacher teaches math.", distractors: ["The dog teaches art.", "The cat teaches music."] },
      { emojis: ["👦", "⚽", "🏃"], target: "The boy plays soccer.", distractors: ["The dog plays chess.", "The cat plays piano."] },
      { emojis: ["👧", "🎨", "🖼️"], target: "The girl paints a picture.", distractors: ["The bird paints a car.", "The fish paints a house."] }
    ]
  },
  Family: {
    pictureStories: [
      { emojis: ["👨‍👩‍👦", "🏠"], target: "My family is at home.", distractors: ["My dog is at home.", "My cat is at home."] },
      { emojis: ["👨", "🚗"], target: "Dad drives the car.", distractors: ["Mom cooks dinner.", "The dog barks."] },
      { emojis: ["👩", "🍳"], target: "Mom cooks dinner.", distractors: ["Dad drives the car.", "The cat sleeps."] },
      { emojis: ["👦", "🧸"], target: "The boy plays with a toy.", distractors: ["The girl reads a book.", "The dog runs."] },
      { emojis: ["👧", "📖"], target: "The girl reads a book.", distractors: ["The boy plays with a toy.", "The cat sleeps."] },
      { emojis: ["👶", "🍼"], target: "The baby drinks milk.", distractors: ["The dog drinks water.", "The cat eats fish."] },
      { emojis: ["👴", "🗞️"], target: "Grandpa reads the news.", distractors: ["Grandma knits a scarf.", "The dog barks."] }
    ],
    finishStories: [
      { story: "We went to the park.", target: "We had a picnic.", distractors: ["We went to sleep.", "We flew to the moon."] },
      { story: "It was my birthday.", target: "We had a party.", distractors: ["We went to sleep.", "We ate a shoe."] },
      { story: "Mom made dinner.", target: "We ate together.", distractors: ["We threw the food.", "We ran away."] },
      { story: "Dad read a story.", target: "We went to sleep.", distractors: ["We went to the park.", "We flew a kite."] },
      { story: "We went to the beach.", target: "We built a sandcastle.", distractors: ["We built a snowman.", "We rode a bike."] },
      { story: "We watched a movie.", target: "We ate popcorn.", distractors: ["We ate an apple.", "We ate a banana."] }
    ],
    talking: [
      { target: "I love my family." },
      { target: "My dad is very tall." },
      { target: "My mom is very kind." },
      { target: "My brother plays with me." },
      { target: "My sister reads a book." },
      { target: "We eat dinner together." },
      { target: "We go to the park." },
      { target: "We have a lot of fun." }
    ],
    chooseBest: [
      { emoji: "👨‍👩‍👧", target: "I love my family.", distractors: ["Family love me.", "The family fly sky."] },
      { emoji: "🏠", target: "We live in a house.", distractors: ["House live in we.", "The house sleep."] },
      { emoji: "🍳", target: "Mom cooks dinner.", distractors: ["Dinner cook mom.", "The dinner fly sky."] },
      { emoji: "🧸", target: "I play with my toy.", distractors: ["Toy play with me.", "The toy eat apple."] },
      { emoji: "👶", target: "The baby is cute.", distractors: ["Baby cute is.", "The baby fly sky."] }
    ],
    emojiStories: [
      { emojis: ["👨‍👩‍👦", "🚗", "🏞️"], target: "The family drives to the park.", distractors: ["The dog drives to the moon.", "The cat drives to the beach."] },
      { emojis: ["👩", "🎂", "🥳"], target: "Mom bakes a birthday cake.", distractors: ["Dad bakes a shoe.", "The dog bakes a pizza."] },
      { emojis: ["👨", "📖", "👦"], target: "Dad reads a story to the boy.", distractors: ["Mom reads a story to the dog.", "The cat reads a story to the fish."] },
      { emojis: ["👧", "🤝", "👦"], target: "The girl and boy are friends.", distractors: ["The dog and cat are enemies.", "The bird and fish are playing."] },
      { emojis: ["👶", "🍼", "😴"], target: "The baby drinks milk and sleeps.", distractors: ["The dog drinks water and runs.", "The cat eats fish and jumps."] }
    ]
  },
  Nature: {
    pictureStories: [
      { emojis: ["🌳", "🐦"], target: "The bird is in the tree.", distractors: ["The fish is in the tree.", "The dog is in the tree."] },
      { emojis: ["🌻", "🐝"], target: "The bee is on the flower.", distractors: ["The cat is on the flower.", "The dog is on the flower."] },
      { emojis: ["🌧️", "☔"], target: "It is raining outside.", distractors: ["It is snowing outside.", "It is sunny outside."] },
      { emojis: ["☀️", "🕶️"], target: "The sun is very bright.", distractors: ["The moon is very bright.", "The star is very bright."] },
      { emojis: ["🌈", "🦄"], target: "I see a rainbow.", distractors: ["I see a star.", "I see a moon."] },
      { emojis: ["❄️", "⛄"], target: "We built a snowman.", distractors: ["We built a sandcastle.", "We built a house."] },
      { emojis: ["🍂", "🍁"], target: "The leaves are falling.", distractors: ["The snow is falling.", "The rain is falling."] }
    ],
    finishStories: [
      { story: "It started to rain.", target: "I opened my umbrella.", distractors: ["I wore my sunglasses.", "I went swimming."] },
      { story: "The sun came out.", target: "We went to play.", distractors: ["We went to sleep.", "We put on a coat."] },
      { story: "We went to the forest.", target: "We saw a bear.", distractors: ["We saw a shark.", "We saw a whale."] },
      { story: "We went to the beach.", target: "We collected shells.", distractors: ["We collected snow.", "We collected leaves."] },
      { story: "We climbed a mountain.", target: "We reached the top.", distractors: ["We reached the bottom.", "We reached the middle."] },
      { story: "We planted a seed.", target: "A flower grew.", distractors: ["A tree grew.", "A bush grew."] }
    ],
    talking: [
      { target: "The tree is very tall." },
      { target: "The flower is very beautiful." },
      { target: "The sun is very hot." },
      { target: "The moon is very bright." },
      { target: "The star is very shiny." },
      { target: "The rain is very wet." },
      { target: "The snow is very cold." },
      { target: "The wind is very strong." }
    ],
    chooseBest: [
      { emoji: "🌳", target: "The tree has green leaves.", distractors: ["Tree green leaves has.", "The tree fly sky."] },
      { emoji: "🌻", target: "The flower is yellow.", distractors: ["Flower yellow is.", "The flower eat apple."] },
      { emoji: "☀️", target: "The sun is hot.", distractors: ["Sun hot is.", "The sun sleep."] },
      { emoji: "🌧️", target: "The rain makes me wet.", distractors: ["Rain wet me makes.", "The rain eat apple."] },
      { emoji: "🌈", target: "The rainbow has many colors.", distractors: ["Rainbow colors many has.", "The rainbow fly sky."] }
    ],
    emojiStories: [
      { emojis: ["🌱", "💧", "🌻"], target: "The seed grows into a flower.", distractors: ["The seed grows into a tree.", "The seed grows into a bush."] },
      { emojis: ["🐛", "🦋", "🌸"], target: "The caterpillar becomes a butterfly.", distractors: ["The caterpillar becomes a moth.", "The caterpillar becomes a beetle."] },
      { emojis: ["🌧️", "☀️", "🌈"], target: "The rain and sun make a rainbow.", distractors: ["The rain and moon make a rainbow.", "The rain and star make a rainbow."] },
      { emojis: ["❄️", "⛄", "🧣"], target: "We build a snowman in the winter.", distractors: ["We build a sandcastle in the summer.", "We build a house in the spring."] },
      { emojis: ["🌳", "🍎", "😋"], target: "I eat an apple from the tree.", distractors: ["I eat a banana from the tree.", "I eat a pear from the tree."] }
    ]
  },
  Adventure: {
    pictureStories: [
      { emojis: ["🚀", "🌙"], target: "The rocket flies to the moon.", distractors: ["The car drives to the moon.", "The boat sails to the moon."] },
      { emojis: ["🗺️", "❌"], target: "The map shows the treasure.", distractors: ["The book shows the treasure.", "The phone shows the treasure."] },
      { emojis: ["⚔️", "🐉"], target: "The knight fights the dragon.", distractors: ["The dog fights the dragon.", "The cat fights the dragon."] },
      { emojis: ["⛺", "🔥"], target: "We camp in the forest.", distractors: ["We sleep in the house.", "We swim in the sea."] },
      { emojis: ["⛵", "🌊"], target: "The boat sails on the sea.", distractors: ["The car drives on the sea.", "The plane flies on the sea."] },
      { emojis: ["🧗", "⛰️"], target: "I climb the mountain.", distractors: ["I climb the tree.", "I climb the stairs."] },
      { emojis: ["🔍", "🕵️"], target: "The detective looks for clues.", distractors: ["The dog looks for clues.", "The cat looks for clues."] }
    ],
    finishStories: [
      { story: "We found a treasure map.", target: "We went on an adventure.", distractors: ["We went to sleep.", "We threw it away."] },
      { story: "We got in the rocket.", target: "We flew to space.", distractors: ["We drove to the store.", "We sailed to the island."] },
      { story: "We saw a dragon.", target: "We ran away fast.", distractors: ["We asked it for a ride.", "We gave it a hug."] },
      { story: "We set up the tent.", target: "We slept outside.", distractors: ["We slept inside.", "We went to the hotel."] },
      { story: "We sailed the boat.", target: "We reached the island.", distractors: ["We reached the moon.", "We reached the city."] },
      { story: "We climbed the mountain.", target: "We saw the whole world.", distractors: ["We saw the moon.", "We saw the stars."] }
    ],
    talking: [
      { target: "I want to be an explorer." },
      { target: "We will find the hidden treasure." },
      { target: "The dragon is very scary." },
      { target: "We will fly to the moon." },
      { target: "The mountain is very high." },
      { target: "The sea is very deep." },
      { target: "The forest is very dark." },
      { target: "We will have a great adventure." }
    ],
    chooseBest: [
      { emoji: "🚀", target: "The rocket is fast.", distractors: ["Rocket fast is.", "The rocket eat apple."] },
      { emoji: "🗺️", target: "I have a map.", distractors: ["Map have I.", "The map fly sky."] },
      { emoji: "🐉", target: "The dragon breathes fire.", distractors: ["Dragon fire breathes.", "The dragon eat apple."] },
      { emoji: "⛺", target: "We sleep in a tent.", distractors: ["Tent sleep we in.", "The tent fly sky."] },
      { emoji: "⛵", target: "The boat sails away.", distractors: ["Boat away sails.", "The boat eat apple."] }
    ],
    emojiStories: [
      { emojis: ["👦", "🗺️", "💎"], target: "The boy finds the hidden treasure.", distractors: ["The dog finds the hidden treasure.", "The cat finds the hidden treasure."] },
      { emojis: ["👧", "🚀", "👽"], target: "The girl meets an alien in space.", distractors: ["The boy meets an alien in space.", "The dog meets an alien in space."] },
      { emojis: ["🧑", "⛵", "🏝️"], target: "The person sails to an island.", distractors: ["The person drives to an island.", "The person flies to an island."] },
      { emojis: ["🧗", "⛰️", "🚩"], target: "The climber reaches the top.", distractors: ["The swimmer reaches the top.", "The runner reaches the top."] },
      { emojis: ["🕵️", "🔍", "🐾"], target: "The detective finds a clue.", distractors: ["The doctor finds a clue.", "The teacher finds a clue."] }
    ]
  },
  Friends: {
    pictureStories: [
      { emojis: ["👦", "🤝", "👧"], target: "The boy and girl are friends.", distractors: ["The boy and dog are friends.", "The girl and cat are friends."] },
      { emojis: ["👭", "🍦"], target: "The friends eat ice cream.", distractors: ["The enemies eat ice cream.", "The dogs eat ice cream."] },
      { emojis: ["👬", "⚽"], target: "The friends play football.", distractors: ["The friends play tennis.", "The friends play basketball."] },
      { emojis: ["👫", "🎁"], target: "The friends give presents.", distractors: ["The friends give hugs.", "The friends give high fives."] },
      { emojis: ["👯", "🎶"], target: "The friends dance to music.", distractors: ["The friends listen to music.", "The friends sing to music."] },
      { emojis: ["🗣️", "👂"], target: "The friends talk and listen.", distractors: ["The friends shout and cry.", "The friends laugh and smile."] },
      { emojis: ["🫂", "❤️"], target: "The friends hug each other.", distractors: ["The friends hit each other.", "The friends push each other."] }
    ],
    finishStories: [
      { story: "My friend was sad.", target: "I gave them a hug.", distractors: ["I laughed at them.", "I ran away."] },
      { story: "We wanted to play.", target: "We shared our toys.", distractors: ["We fought over toys.", "We broke our toys."] },
      { story: "It was my friend's birthday.", target: "I gave them a gift.", distractors: ["I gave them a rock.", "I gave them a stick."] },
      { story: "We went to the park.", target: "We played on the swings.", distractors: ["We played in the mud.", "We played in the street."] },
      { story: "We were hungry.", target: "We shared a snack.", distractors: ["We ate all the food.", "We threw the food."] },
      { story: "We had a disagreement.", target: "We talked it out.", distractors: ["We stopped being friends.", "We yelled at each other."] }
    ],
    talking: [
      { target: "I like to play with my friends." },
      { target: "My friend is very kind." },
      { target: "We share our toys." },
      { target: "We always help each other." },
      { target: "We have fun together." },
      { target: "We are best friends." },
      { target: "I trust my friend." },
      { target: "We like to laugh together." }
    ],
    chooseBest: [
      { emoji: "🤝", target: "We shake hands.", distractors: ["Hands shake we.", "The hands eat apple."] },
      { emoji: "🎁", target: "I give a present.", distractors: ["Present give I.", "The present fly sky."] },
      { emoji: "🫂", target: "We hug each other.", distractors: ["Hug we each other.", "The hug eat apple."] },
      { emoji: "😊", target: "We are happy.", distractors: ["Happy are we.", "The happy fly sky."] },
      { emoji: "🗣️", target: "We talk together.", distractors: ["Talk we together.", "The talk eat apple."] }
    ],
    emojiStories: [
      { emojis: ["👦", "🎁", "👧"], target: "The boy gives a gift to the girl.", distractors: ["The boy takes a gift from the girl.", "The boy breaks a gift."] },
      { emojis: ["👧", "🍰", "👦"], target: "The girl shares cake with the boy.", distractors: ["The girl eats all the cake.", "The girl throws the cake."] },
      { emojis: ["👬", "🚲", "🏞️"], target: "The friends ride bikes in the park.", distractors: ["The friends drive cars in the park.", "The friends fly planes in the park."] },
      { emojis: ["👭", "🤫", "🤭"], target: "The friends share a secret.", distractors: ["The friends shout a secret.", "The friends forget a secret."] },
      { emojis: ["👫", "☔", "🌧️"], target: "The friends share an umbrella.", distractors: ["The friends share a coat.", "The friends share a hat."] }
    ]
  }
};

const storyCreatorWords = {
  subjects: [
    { word: "The boy", icon: "👦" }, { word: "The girl", icon: "👧" }, { word: "The dog", icon: "🐶" }, 
    { word: "The cat", icon: "🐱" }, { word: "The bird", icon: "🐦" }, { word: "The rabbit", icon: "🐰" },
    { word: "The robot", icon: "🤖" }, { word: "The alien", icon: "👽" }, { word: "The ghost", icon: "👻" },
    { word: "The dinosaur", icon: "🦖" }
  ],
  verbs: [
    { word: "plays", icon: "⚽" }, { word: "jumps", icon: "⬆️" }, { word: "runs", icon: "🏃" }, 
    { word: "sleeps", icon: "😴" }, { word: "eats", icon: "😋" }, { word: "dances", icon: "💃" },
    { word: "flies", icon: "🚀" }, { word: "swims", icon: "🏊" }, { word: "reads", icon: "📖" },
    { word: "sings", icon: "🎤" }
  ],
  objects: [
    { word: "with a ball.", icon: "🎾" }, { word: "in the park.", icon: "🏞️" }, { word: "at home.", icon: "🏠" }, 
    { word: "in space.", icon: "🌌" }, { word: "with a friend.", icon: "🤝" }, { word: "on the bed.", icon: "🛏️" },
    { word: "under a tree.", icon: "🌳" }, { word: "in the water.", icon: "💧" }, { word: "at school.", icon: "🏫" },
    { word: "on the moon.", icon: "🌕" }
  ]
};

const content = `export const sentenceBank = ${JSON.stringify(categories, null, 2)};
export const storyCreatorWords = ${JSON.stringify(storyCreatorWords, null, 2)};`;

fs.writeFileSync('c:/project/readease/src/data/sentenceBuilderData.js', content);
console.log('Successfully generated sentenceBuilderData.js');
