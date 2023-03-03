interface GameData {
  numDragons: number;
  numKingdoms: number;
  startSheep: number;
  numFeast: number;
  numFamine: number;
  rounds: number;
  scores: number[];
  scoreTotal: number;
  dragonGrouping: number[];
  winner: number;
}

interface Kingdom {
  index: number;
  sheep: number;
};

enum Mode {
  hunting = 'HUNTING',
  sneaking = 'SNEAKING',
  warpath = 'WARPATH'
}

interface Dragon {
  index: number;
  sheep: number;
  location: number | null;
  mode: Mode | null;
};


/**
 * create some kingdoms full of sheep
 * @param   numKingdoms the count of kingdoms this game will use
 * @return  Kingdom[]   an array of Kingdom objects
 */
function generateKingdoms (
  numKingdoms:number,
  startSheep: number
) : Kingdom[] {
  let kingdoms : Kingdom[] = [];
  for (let i=0; i<numKingdoms; i++) 
    kingdoms[i] = { 
      index: i,
      sheep: startSheep
    };
  return kingdoms;
}


/**
 * @param   numDragons  the number of dragons to use in this game
 * @return  Dragon[]    an array of dragon objects
 */
function generateDragons (
  numDragons:number
) : Dragon[] {
  let dragons : Dragon[] = [];
  for (let i=0; i<numDragons; i++) 
    dragons[i] = { 
      index: i,
      sheep: 0,
      location: null,
      mode: null
    };
  return dragons;
}


/**
 * Provides either a Feast or Famine cycle to random kingdoms
 * Feast adds sheep and possibly Georges
 * Famine removes sheep
 * @param kingdoms  an array of the kingdoms
 * @param numFeast  the number of kingdoms to pick for Feast
 * @param numFamine the number of kingdoms to pick for Famine
 */
function runFeastAndFamineCycle (
  kingdoms: Kingdom[],
  numFeast: number,
  numFamine: number,
  feastFactor: number,
  famineFactor: number
) : void {
  // validation

  // build arrays to hold the feast and famine selections
  let feastList : number[] = [], famineList: number[] = [];

  // pick some kingdoms to receive a feast
  while (feastList.length < numFeast) {
    let chosen = Math.floor(Math.random()*kingdoms.length);
    if (feastList.indexOf(chosen)===-1) feastList.push(chosen);
  }

  // pick some kingdoms to receive a famine
  while (famineList.length < numFamine) {
    let chosen = Math.floor(Math.random()*kingdoms.length);
    if (famineList.indexOf(chosen)===-1) famineList.push(chosen);
  }

  // check to see if feasts and famines overlap
  // kingdoms chosen for both feast and famine cancel out both effects
  let intersect : number[] = feastList.filter(i => famineList.indexOf(i)>-1);
  intersect.forEach(i => {
    let pos1 = feastList.indexOf(i);
    feastList.splice(pos1,1);
    let pos2 = famineList.indexOf(i);
    famineList.splice(pos2,1);
  });
  
  // provide feasts to the kingdoms that receive them
  feastList.forEach(i => {
    // only kingdoms with at least 2 sheep get the benefits of feast
    if (kingdoms[i].sheep>1) {
      kingdoms[i].sheep += (Math.floor(kingdoms[i].sheep/2) * feastFactor);
    }
  });

  // any kingdom with at least 1 sheep can lose sheep in a famine
  famineList.forEach(i => {
    if (kingdoms[i].sheep>0) {
      kingdoms[i].sheep -= Math.floor((kingdoms[i].sheep+1)/famineFactor);
    }
  });

  // kingdoms that get both feast and famine do not change the number of sheep they have,
  // but secondary feast and famine effects may still be enacted
  // Some Feasts also add Georges
  /*
  intersect.forEach(i => {
    // TODO: add secondary feast and famine effects
  });
  */

  // tell me what just happened
  //console.log(`Kingdom(s) ${JSON.stringify(feastList)} received FEAST, and kingdom(s) ${JSON.stringify(famineList)} endured FAMINE.`);
  //if (intersect.length>0) {
  //  console.log(`Kingdom(s) ${JSON.stringify(intersect)} got FEAST & FAMINE`);
  //}
}

/**
 * runs the kingdom choosing routine, where dragons pick kingdoms to hunt
 * @param kingdoms  an array holding all the kingdoms
 * @param dragon    the dragon doing the hunting
 */
function runChooseKingdomAndHuntMode (
  kingdoms: Kingdom[],
  dragons: Dragon[],
  startDragon
) : void {
  // this helper is how a dragon decides if a kingdom is an acceptable hunting location
  function acceptKingdom (newLocation) : boolean {
    // use the following rubric:
    let isAcceptable = true;

    // dragons prefer not to exterminate all sheep, if possible
    if (threePlusSheep.length>0) {
      // there are kindgoms with at least three sheep      
      if (kingdoms[newLocation].sheep<3) isAcceptable = false;
    } else {
      // oh well, dragons still have to eat
      if (kingdoms[newLocation].sheep===0) isAcceptable = false;
    }

    // TODO: add distance, sheep count, and dragon_count to the rubric

    // return the decision
    return isAcceptable;
  }

  // dragons prefer kingdoms with at least 3 sheep because they don't want to exterminate all life
  let threePlusSheep = kingdoms.filter((kingdom:Kingdom) => kingdom.sheep>2);

  // the probability that a dragon goes to a kingdom is proportional to the number of sheep it has
  // this is done by adding the index for that kingdom a number of times equal to its sheep
  let kingdomProbs : number[] = [];
  kingdoms.forEach((kingdom:Kingdom) => {
    for (let i=0; i<kingdom.sheep; i++) kingdomProbs.push(kingdom.index);
  });
  //console.log(`kingdomProbs: ${JSON.stringify(kingdomProbs)}`);

  // have each dragon choose where it's going to go and what it's going to do
  for (let turn=0; turn<dragons.length; turn++) {
    let dragon = dragons[startDragon];

    // initially, the dragon's location and mode are reset
    dragon.location = null;
    dragon.mode = null;

    // sets the dragon's location to the first acceptable random choice found
    // and it's mode to hunting
    while (dragon.location===null) {
      let newLocation = kingdomProbs[Math.floor(Math.random()*kingdomProbs.length)];
      if (acceptKingdom(newLocation)) {
        dragon.location = newLocation;
        dragon.mode = Mode.hunting;
      }
    }

    startDragon = (startDragon + 1) % dragons.length;
  }
}


/**
 * runs the dragon feeding cycle, where each dragons take sheep based on location and mode
 * @param kingdoms  an array holding all the kingdoms
 * @param dragons   an array holding all the dragons
 */
function runDragonFeedingCycle (
  kingdoms: Kingdom[],
  dragons: Dragon[],
  startDragon: number
) : void {
  // initially, all dragons only hunt, which means they share

  // show me the dragon bellies (initially all zero)
  let bellies = dragons.map(dragon => 0);
  let change = true;
  do {
    let preFeeding = JSON.parse(JSON.stringify(bellies));

    // give each dragon 1 turn
    for (let dragonNumber=0; dragonNumber<dragons.length; dragonNumber++) {
      let currentKingdom = dragons[startDragon].location;

      if (bellies[dragonNumber]===0 && kingdoms[currentKingdom].sheep>0) {
        // this dragon hasn't fed. It must eat.
        bellies[dragonNumber]++;
        kingdoms[currentKingdom].sheep--;
        //console.log(`dragon ${dragonNumber} hunted in kingdom ${currentKingdom}`);
      } else if (bellies[dragonNumber]>0 && kingdoms[currentKingdom].sheep>2) {
        // this dragon would like to eat and there appears to be plenty available
        bellies[dragonNumber]++;
        kingdoms[currentKingdom].sheep--;
        //console.log(`dragon ${dragonNumber} hunted in kingdom ${currentKingdom}`);
      } else if (bellies[dragonNumber]>0 && kingdoms[currentKingdom].sheep===1) {
        // this kingdom is depleted anyway, so might as well take the last sheep
        bellies[dragonNumber]++;
        kingdoms[currentKingdom].sheep--;
        //console.log(`dragon ${dragonNumber} hunted in kingdom ${currentKingdom}`);
      } else if (kingdoms[currentKingdom].sheep===0) {
        //console.log(`dragon ${dragonNumber} could not find food in kingdom ${currentKingdom}`);
      } else {
        // this dragon has already fed and the kingdom barely has any sheep
        //console.log(`dragon ${dragonNumber} with belly ${bellies[dragonNumber]} chose not to feed in Kingdom ${currentKingdom} with ${kingdoms[currentKingdom].sheep} sheep`);
      }

      // go to the next dragon
      startDragon = (startDragon + 1) % dragons.length
    }

    // see if the bellies have changed
    change = bellies.reduce((prev,belly,index) => {
      if (belly!==preFeeding[index]) return true;
      return prev;
    },false);

  } while (change===true);

  // now that the dragons have stopped feeding, update their sheep count
  dragons.forEach((dragon,index) => {
    dragon.sheep += bellies[index];
  });

}

/**
 * this runs a single simulation of the dragon game
 */
function playOneGame (
  gameData: GameData[],
  numDragons: number,
  numKingdoms: number,
  startSheep: number,
  numFeast: number,
  numFamine: number,
  feastFactor: number,
  famineFactor: number
) : void {
  //console.log();
  //console.log(`*** NEW GAME ***`);

  // start with the base kingdoms and dragons
  let kingdoms = generateKingdoms(numKingdoms,startSheep);
  let dragons = generateDragons(numDragons);

  // let the dragons fly around and get sheep
  // dragon 0 is always starts as first player, but each round first player shifts
  let startDragon = 0, winner = -1;
  let dragonGrouping = dragons.map((dragon:Dragon) => 0);
  for (var round=0; round<100 && winner===-1; round++) {
    //console.log(`Round ${round+1} of the game, first dragon: ${startDragon}`);

    // pick a kingdom and a hunt mode for each dragon
    runChooseKingdomAndHuntMode(kingdoms,dragons,startDragon);

    //console.log(`the dragons:`);
    //console.log(dragons);

    // now that all dragons have chosen a location, run a feast and famine cycle
    if (numFeast>kingdoms.length) break;
    runFeastAndFamineCycle(kingdoms,numFeast,numFamine,feastFactor,famineFactor);

    //console.log(`kingdoms before feeding:`);
    //console.log(kingdoms);

    // the dragon feed cycle
    runDragonFeedingCycle(kingdoms,dragons,startDragon);

    //console.log(`kingdoms after feeding:`);
    //console.log(kingdoms);

    // this counts how many dragons are in each kingdom
    let kingdomMap = kingdoms.map((kingdom:Kingdom) => 0);
    dragons.forEach((dragon:Dragon) => {
      kingdomMap[dragon.location]++;
    });

    // this tells us how many times dragons were together
    kingdomMap.forEach((quantity:number) => {
      if (quantity>0) dragonGrouping[quantity-1]++;
    });

    // this checks to see if there is a winner
    winner = dragons.reduce((prev:number,curr:Dragon) => {
      if (curr.sheep>=54) return curr.index;
      return prev;
    },-1);
    if (winner>-1) {
      //console.log(`Dragon ${winner} just won the game`);
      //console.log(dragons);
      //console.log();
      break;
    }

    // this checks to see if all sheep have been eaten
    let totalSheep = kingdoms.reduce((agg,kingdom) => agg+kingdom.sheep,0);
    if (totalSheep===0) break;

    // shift the first player by one each round
    startDragon = (startDragon + 1) % dragons.length;
  }

  //console.log(`game lasted ${round+1} rounds`);

  let game: GameData = {
    numDragons,
    numKingdoms,
    startSheep,
    numFeast,
    numFamine,
    rounds: round+1,
    scores: dragons.map((dragon : Dragon) => dragon.sheep),
    scoreTotal: dragons.reduce((prev:number,curr:Dragon) => prev + curr.sheep,0),
    dragonGrouping,
    winner: (winner > -1) ? 1 : 0
  };

  // show this game's data
  //console.log(game);

  // record this game's data
  gameData.push(game);

};


function playManyGames (
  gameParameterTrials: GameData[],
  games: number,
  numDragons: number,
  numKingdoms: number,
  startSheep: number,
  numFeast: number,
  numFamine: number,
  feastFactor: number,
  famineFactor: number
) : void {
  // this stores statistics from our game
  let gameData : GameData[] = [];

  // this plays the game many times
  for (let game=0; game<games; game++) playOneGame(gameData,numDragons,numKingdoms,startSheep,numFeast,numFamine,feastFactor,famineFactor);

  // creates some calculation helpers
  let arr1 : number[] = [], arr2 : number[] = [];
  for(let i=0;i<numDragons;i++) {
    arr1.push(0);
    arr2.push(0);
  }
  let scores = gameData.reduce((prev,curr:GameData) => {
    return prev.map((qty:number,ind:number) => qty + curr.scores[ind] / games)
  },arr1);
  let grouping = gameData.reduce((prev,curr:GameData) => {
    return prev.map((qty:number,ind:number) => qty + curr.dragonGrouping[ind] / games)
  },arr2);

  // this calculates what the average game looks like with these parameters
  let averageGameData : GameData = {
    numDragons,
    numKingdoms,
    startSheep,
    numFeast,
    numFamine,
    rounds: Math.round(gameData.reduce((prev,curr:GameData) => prev+curr.rounds,0) / games * 10) / 10,
    scores: scores.map((qty:number) => Math.round(qty*10)/10),
    scoreTotal: scores.reduce((prev:number,curr:number) => prev+curr,0),
    dragonGrouping: grouping.map((qty:number) => Math.round(qty*10) / 10),
    winner: Math.round(gameData.reduce((prev,curr:GameData) => prev+curr.winner,0) / games * 10) / 10
  }

  // show the average game
  //console.log(`The average game:`);
  //console.log(averageGameData);

  gameParameterTrials.push(averageGameData);
}

// how we store our game trial data
let gameParameterTrials : GameData[] = [];
let numDragons = 4;

/*
let numKingdoms = 12;
let startSheep = 6;
let numFeast = 6;
let numFamine = 1;
let feastFactor = 2;
let famineFactor = 2;
// when testing a single play-through
//playOneGame(gameParameterTrials,numDragons,numKingdoms,startSheep,numFeast,numFamine,feastFactor,famineFactor);
playManyGames(gameParameterTrials, 10, numDragons,numKingdoms,startSheep,numFeast,numFamine,feastFactor,famineFactor);
//console.log(gameParameterTrials);
*/

let trial = 0;
for (let numKingdoms = 1; numKingdoms <= 8; numKingdoms++) {
  for (let startSheep = 3; startSheep <= 5; startSheep++) {
    for (let feastFactor = 1; feastFactor <= 3; feastFactor++) {
      for (let famineFactor = 2; famineFactor <= 3; famineFactor++) {
        for (let numFeast = 1; numFeast <= numKingdoms; numFeast++) {
          for (let numFamine = 1; numFamine <= numKingdoms; numFamine++) {
            console.log(`Trail ${++trial}`);
            playManyGames(gameParameterTrials, 1000, numDragons,numKingdoms,startSheep,numFeast,numFamine,feastFactor,famineFactor);
          }
        }
      }
    }
  }
}

// filter down to trials with an acceptable win ratio
let final = gameParameterTrials.filter((a:GameData) => (a.winner >= .6 && a.winner < .9));
final.sort((a:GameData,b:GameData) => a.winner - b.winner);

//console.log(final);
final.forEach((trial:GameData,index:number)=>{
  let keys = Object.keys(trial);
  if (index===0) console.log(JSON.stringify(keys));
  else {
    let foo : string[] = [];
    keys.forEach((key:string) => foo.push(trial[key]));
    console.log(JSON.stringify(foo));
  }
});

console.log(`Trials that passed muster: ${final.length} of ${trial}`);

export {};