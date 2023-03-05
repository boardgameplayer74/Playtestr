// the GameTrialStats type provides us with a a framework for storing play data about our game trials
interface GameTrialStats {
  numDragons:     number;
  numKingdoms:    number;
  startSheep:     number;
  numFeast:       number;
  numFamine:      number;
  feastFactor:    number;
  famineFactor:   number;
  rounds:         number;
  scores:         number[];
  scoreHisto :    number[];
  dragonGrouping: number[];
  winner:         number;
}

// a kingdom has a certain set of traits, like the number of sheep and Georges it has in it
interface Kingdom {
  index:    number;
  sheep:    number;
  georges:  number;
};

// huntmode is how the dragon plans to collect sheep
enum HuntMode {
  hunting   = 'HUNTING',
  sneaking  = 'SNEAKING',
  warpath   = 'WARPATH'
}

// dragons have certain traits, like the number of sheep they've collected, level they are, and wounds they have
interface Dragon {
  index:      number;
  level:      number;
  sheep:      number;
  location:   number | null;
  huntmode:   HuntMode | null;
  wounds:     number;
  hunger: number;
};


/**
 * create some kingdoms full of sheep
 * @param   numKingdoms number of kingdoms this game will use
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
      sheep: startSheep,
      georges: 0
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
      level: 1,
      sheep: 0,
      location: null,
      huntmode: null,
      wounds: 0,
      hunger: 0
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
  kingdoms:     Kingdom[],
  numFeast:     number,
  numFamine:    number,
  feastFactor:  number,
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
    let pos1 = feastList.indexOf(i); feastList.splice(pos1,1);
    let pos2 = famineList.indexOf(i); famineList.splice(pos2,1);
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

    // TODO: add georges to the rubric
    // dragons may avoid kingdoms with excessive georges, particularly if they are hurt

    // return the decision
    return isAcceptable;
  }

  // dragons prefer kingdoms with at least 3 sheep because they don't want to exterminate all life
  let threePlusSheep = kingdoms.filter((kingdom:Kingdom) => kingdom.sheep>2);

  // the probability that a dragon chooses a kingdom is proportional to the number of sheep it has
  // this is done by adding the index for that kingdom a number of times equal to its sheep
  let kingdomProbs : number[] = [];
  kingdoms.forEach((kingdom:Kingdom) => {
    for (let i=0; i<kingdom.sheep; i++) kingdomProbs.push(kingdom.index);
  });

  // have each dragon choose where it's going to go and what it's going to do
  for (let turn=0; turn<dragons.length; turn++) {
    let dragon = dragons[startDragon];

    // initially, the dragon's location and huntmode are reset
    dragon.location = null;
    dragon.huntmode = null;

    // sets the dragon's location to the first acceptable random choice found
    // and it's huntmode to hunting
    while (dragon.location===null) {
      let newLocation = kingdomProbs[Math.floor(Math.random()*kingdomProbs.length)];
      if (acceptKingdom(newLocation)) {
        dragon.location = newLocation;
        dragon.huntmode = HuntMode.hunting;
      }
    }

    startDragon = (startDragon + 1) % dragons.length;
  }
}


/**
 * runs the dragon feeding cycle, where each dragons take sheep based on location and huntmode
 * @param kingdoms  an array holding all the kingdoms
 * @param dragons   an array holding all the dragons
 */
function runDragonFeedingCycle (
  kingdoms: Kingdom[],
  dragons: Dragon[],
  startDragon: number
) : void {
  // initially, all dragons only hunt, which means they share
  // TODO: add sneaking

  // show me the dragon bellies (initially all zero)
  let dragonBellies = dragons.map(dragon => 0);

  // perform play loops to get all dragons fed
  let change = true;
  do {
    let preFeeding = JSON.parse(JSON.stringify(dragonBellies));

    // give each dragon 1 turn
    for (let dragonNumber=0; dragonNumber<dragons.length; dragonNumber++) {
      let currentKingdom = dragons[startDragon].location;

      if (dragonBellies[dragonNumber]===0 && kingdoms[currentKingdom].sheep>0) {
        // this dragon hasn't fed. It must eat.
        dragonBellies[dragonNumber]++;
        kingdoms[currentKingdom].sheep--;
      } else if (dragonBellies[dragonNumber]>0 && kingdoms[currentKingdom].sheep>2) {
        // this dragon would like to eat and there appears to be plenty available
        dragonBellies[dragonNumber]++;
        kingdoms[currentKingdom].sheep--;
      } else if (dragonBellies[dragonNumber]>0 && kingdoms[currentKingdom].sheep===1) {
        // this kingdom is depleted anyway, so might as well take the last sheep
        dragonBellies[dragonNumber]++;
        kingdoms[currentKingdom].sheep--;
      } else if (kingdoms[currentKingdom].sheep===0) {
        // this kingdom has no sheep
      } else {
        // this dragon has already fed and the kingdom barely has any sheep
      }

      // go to the next dragon
      startDragon = (startDragon + 1) % dragons.length;
    }

    // see if the dragon bellies have changed
    change = dragonBellies.reduce((prev,belly,index) => {
      if (belly!==preFeeding[index]) return true;
      return prev;
    },false);

    // as long as bellies are changing, keep performing the feeding loop
  } while (change===true);

  // if any dragon did not get sheep, that dragon goes hungry
  dragonBellies.forEach((belly:number, index:number) => {
    if (belly===0) dragons[index].hunger++;
  });

  // now that the dragons have stopped feeding, update their sheep count
  dragons.forEach((dragon,index) => {
    dragon.sheep += dragonBellies[index];
  });

}

/**
 * at the end of the round dragons first heal wounds with their sheep and then gain levels (if they can)
 * @param dragons     
 * @param startDragon 
 */
function runHealingAndLeveling(
  dragons:      Dragon[],
  startDragon:  number
) : void {

  // we run this reward loop as long as dragons can keep gaining levels
  let crazyLoopCatcher = 0;
  do {
    var levelUps = false;
    // each dragon gets a turn, in current turn order
    for (let d=0; d<dragons.length; d++) {
      // first thing is to heal
      if (dragons[startDragon].wounds > dragons[startDragon].sheep) {
        // this dragon has more wounds than sheep - heal as many wounds as possible
        dragons[startDragon].wounds -= dragons[startDragon].sheep;
        dragons[startDragon].sheep = 0;
      } else {
        // this dragon has less wounds than sheep
        dragons[startDragon].sheep -= dragons[startDragon].wounds;
        dragons[startDragon].wounds = 0;
      }

      // dragons with leftover sheep will gain a level if they can
      if (dragons[startDragon].sheep >= dragons[startDragon].level) {
        dragons[startDragon].sheep -= dragons[startDragon].level;
        dragons[startDragon].level++;
        levelUps = true;
        // TODO: dragons who gain a level also gain a Treasure card

        // if a dragon reaches level 10, the game instantly ends
        if (dragons[startDragon].level===10) break;      
      }

      startDragon = (startDragon + 1) % dragons.length;

      if (++crazyLoopCatcher>90) {
        console.log(`Loop:${crazyLoopCatcher} startDragon:${startDragon} levelUps:${levelUps}`);
        console.log(dragons);
        if (crazyLoopCatcher>100) break;
      }
    }
  } while (levelUps===true);

}


/**
 * this runs a single simulation of the dragon game with the chosen parameters
 * @param gameTrialStats  an array of gametrialstats
 * @param numDragons      number of dragons feeding
 * @param numKingdoms     number of kingdoms
 * @param startSheep      sheep each kingdom starts with
 * @param numFeast        feast cards drawn per round
 * @param numFamine       famine cards drawn per round
 * @param feastFactor     sheep gained for every 2 sheep a country has
 * @param famineFactor    group size for losing 1 sheep; IE, lose 1 of every X sheep
 */
function playOneGame (
  gameTrialStats: GameTrialStats[],
  numDragons:   number,
  numKingdoms:  number,
  startSheep:   number,
  numFeast:     number,
  numFamine:    number,
  feastFactor:  number,
  famineFactor: number,
  testing:      boolean
) : void {
  // show me some debugging stuff when receiving the testing flag
  if (testing) {
    console.log();
    console.log(`*** NEW GAME ***`);
  }

  // start with the base kingdoms and dragons
  let kingdoms = generateKingdoms(numKingdoms,startSheep);
  let dragons = generateDragons(numDragons);

  // dragon 0 is always first player, but each round first player shifts
  let startDragon = 0, winner = false, extinction = false;
  let dragonGrouping = dragons.map((dragon:Dragon) => 0);

  // this is the core game cycle
  // the max rounds has a hard stop just for safety - the standard stop is to find a winner or go extinct
  for (var round=0; round<100 && winner===false && extinction===false; round++) {
    console.log(`Round ${round+1} of the game, first dragon: ${startDragon}`);

    // let each dragon pick a kingdom and a huntmode
    //console.log(`choose tactics`);
    runChooseKingdomAndHuntMode(kingdoms,dragons,startDragon);

    if (testing) {
      //console.log(`the dragons:`);
      //console.log(dragons);
    }

    // run a feast and famine cycle to add and remove sheep *after* dragons have chosen actions
    if (numFeast>kingdoms.length) break;
    //console.log(`feast and famine`)
    runFeastAndFamineCycle(kingdoms,numFeast,numFamine,feastFactor,famineFactor);

    // split the food between the dragons
    //console.log(`feeding`)
    runDragonFeedingCycle(kingdoms,dragons,startDragon);

    // allow dragons to heal and level-up
    //console.log(`leveling`)
    runHealingAndLeveling(dragons,startDragon);

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
    winner = dragons.reduce((prev:boolean,curr:Dragon) => {
      if (curr.level===10) return true;
      return prev;
    },false);

    // this checks to see if all sheep have been eaten
    extinction = kingdoms.reduce((prev:boolean,kingdom:Kingdom) => {
      if (kingdom.sheep>0) return false;
      return prev;
    },true);

    // shift the first player by one each round
    startDragon = (startDragon + 1) % dragons.length;
  }

  if (testing) console.log(`game lasted ${round+1} rounds`);

  // record the final scores and the score histogram
  let scores = dragons.map((dragon : Dragon) => dragon.level);
  let scoreHisto = [0,0,0,0,0,0,0,0,0,0,0];
  scores.forEach((score:number) => scoreHisto[score]++);

  let gameTrial: GameTrialStats = {
    numDragons,
    numKingdoms,
    startSheep,
    numFeast,
    numFamine,
    feastFactor,
    famineFactor,
    rounds: round+1,
    scores,
    scoreHisto,
    dragonGrouping,
    winner: (winner===true) ? 1 : 0
  };

  // show this game's data
  if (testing) {
    console.log(kingdoms);
    console.log(dragons);
    console.log(gameTrial);
  }

  // record this game's data
  gameTrialStats.push(gameTrial);

};


function playManyGames (
  gameParameterTrials: GameTrialStats[],
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
  let gameTrialStats : GameTrialStats[] = [];

  // this plays the game many times
  let testing = (games===1) ? true : false;
  for (let game=0; game<games; game++) playOneGame(gameTrialStats,numDragons,numKingdoms,startSheep,numFeast,numFamine,feastFactor,famineFactor,testing);

  // creates some calculation helpers
  let arr1 : number[] = [], arr2 : number[] = [];
  for(let i=0;i<numDragons;i++) {
    arr1.push(0);
    arr2.push(0);
  }
  let scores = gameTrialStats.reduce((prev,curr:GameTrialStats) => {
    return prev.map((qty:number,ind:number) => qty + curr.scores[ind] / games)
  },arr1);
  let scoreHisto = gameTrialStats.reduce((prev,curr:GameTrialStats) => {
    return prev.map((qty:number,ind:number) => qty + curr.scoreHisto[ind] / games)
  },[0,0,0,0,0,0,0,0,0,0,0]);
  let grouping = gameTrialStats.reduce((prev,curr:GameTrialStats) => {
    return prev.map((qty:number,ind:number) => qty + curr.dragonGrouping[ind] / games)
  },arr2);

  // this calculates what the average game looks like with these parameters
  let averageGameTrialStats : GameTrialStats = {
    numDragons,
    numKingdoms,
    startSheep,
    numFeast,
    numFamine,
    feastFactor,
    famineFactor,
    rounds: Math.round(gameTrialStats.reduce((prev,curr:GameTrialStats) => prev+curr.rounds,0) / games * 10) / 10,
    scores: scores.map((qty:number) => Math.round(qty*10)/10),
    scoreHisto: scoreHisto.map((qty:number) => Math.round(qty*10)/10),
    dragonGrouping: grouping.map((qty:number) => Math.round(qty*10) / 10),
    winner: Math.round(gameTrialStats.reduce((prev,curr:GameTrialStats) => prev+curr.winner,0) / games * 100) / 100
  }

  // show the average game
  console.log(`The average game:`);
  console.log(averageGameTrialStats);

  gameParameterTrials.push(averageGameTrialStats);
}

// how we store our game trial data
let gameParameterTrials : GameTrialStats[] = [];


let trial = 0;
for (let numDragons = 4; numDragons <= 4; numDragons++) {
  for (let numKingdoms = 9; numKingdoms <= 9; numKingdoms++) {
    for (let startSheep = 3; startSheep <= 3; startSheep++) {
      for (let feastFactor = 4; feastFactor <= 4; feastFactor++) {
        for (let famineFactor = 4; famineFactor <= 4; famineFactor++) {
          for (let numFeast = 4; numFeast <= 4; numFeast++) {
            for (let numFamine = 1; numFamine <= 1; numFamine++) {
              console.log(`Trail ${++trial}`);
              playManyGames(gameParameterTrials, 1000, numDragons,numKingdoms,startSheep,numFeast,numFamine,feastFactor,famineFactor);
            }
          }
        }
      }
    }
  }
}

// filter down to trials with an acceptable win ratio
let final = gameParameterTrials.filter((a:GameTrialStats) => (a.winner >= .7 && a.winner <= .9));
final.sort((a:GameTrialStats,b:GameTrialStats) => a.winner - b.winner);

//console.log(final);
final.forEach((trial:GameTrialStats,index:number)=>{
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