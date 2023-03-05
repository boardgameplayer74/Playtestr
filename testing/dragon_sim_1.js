"use strict";
exports.__esModule = true;
;
// huntmode is how the dragon plans to collect sheep
var HuntMode;
(function (HuntMode) {
    HuntMode["hunting"] = "HUNTING";
    HuntMode["sneaking"] = "SNEAKING";
    HuntMode["warpath"] = "WARPATH";
})(HuntMode || (HuntMode = {}));
;
/**
 * create some kingdoms full of sheep
 * @param   numKingdoms number of kingdoms this game will use
 * @return  Kingdom[]   an array of Kingdom objects
 */
function generateKingdoms(numKingdoms, startSheep) {
    var kingdoms = [];
    for (var i = 0; i < numKingdoms; i++)
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
function generateDragons(numDragons) {
    var dragons = [];
    for (var i = 0; i < numDragons; i++)
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
function runFeastAndFamineCycle(kingdoms, numFeast, numFamine, feastFactor, famineFactor) {
    // validation
    // build arrays to hold the feast and famine selections
    var feastList = [], famineList = [];
    // pick some kingdoms to receive a feast
    while (feastList.length < numFeast) {
        var chosen = Math.floor(Math.random() * kingdoms.length);
        if (feastList.indexOf(chosen) === -1)
            feastList.push(chosen);
    }
    // pick some kingdoms to receive a famine
    while (famineList.length < numFamine) {
        var chosen = Math.floor(Math.random() * kingdoms.length);
        if (famineList.indexOf(chosen) === -1)
            famineList.push(chosen);
    }
    // check to see if feasts and famines overlap
    // kingdoms chosen for both feast and famine cancel out both effects
    var intersect = feastList.filter(function (i) { return famineList.indexOf(i) > -1; });
    intersect.forEach(function (i) {
        var pos1 = feastList.indexOf(i);
        feastList.splice(pos1, 1);
        var pos2 = famineList.indexOf(i);
        famineList.splice(pos2, 1);
    });
    // provide feasts to the kingdoms that receive them
    feastList.forEach(function (i) {
        // only kingdoms with at least 2 sheep get the benefits of feast
        if (kingdoms[i].sheep > 1) {
            kingdoms[i].sheep += (Math.floor(kingdoms[i].sheep / 2) * feastFactor);
        }
    });
    // any kingdom with at least 1 sheep can lose sheep in a famine
    famineList.forEach(function (i) {
        if (kingdoms[i].sheep > 0) {
            kingdoms[i].sheep -= Math.floor((kingdoms[i].sheep + 1) / famineFactor);
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
function runChooseKingdomAndHuntMode(kingdoms, dragons, startDragon) {
    // this helper is how a dragon decides if a kingdom is an acceptable hunting location
    function acceptKingdom(newLocation) {
        // use the following rubric:
        var isAcceptable = true;
        // dragons prefer not to exterminate all sheep, if possible
        if (threePlusSheep.length > 0) {
            // there are kindgoms with at least three sheep      
            if (kingdoms[newLocation].sheep < 3)
                isAcceptable = false;
        }
        else {
            // oh well, dragons still have to eat
            if (kingdoms[newLocation].sheep === 0)
                isAcceptable = false;
        }
        // TODO: add georges to the rubric
        // dragons may avoid kingdoms with excessive georges, particularly if they are hurt
        // return the decision
        return isAcceptable;
    }
    // dragons prefer kingdoms with at least 3 sheep because they don't want to exterminate all life
    var threePlusSheep = kingdoms.filter(function (kingdom) { return kingdom.sheep > 2; });
    // the probability that a dragon chooses a kingdom is proportional to the number of sheep it has
    // this is done by adding the index for that kingdom a number of times equal to its sheep
    var kingdomProbs = [];
    kingdoms.forEach(function (kingdom) {
        for (var i = 0; i < kingdom.sheep; i++)
            kingdomProbs.push(kingdom.index);
    });
    // have each dragon choose where it's going to go and what it's going to do
    for (var turn = 0; turn < dragons.length; turn++) {
        var dragon = dragons[startDragon];
        // initially, the dragon's location and huntmode are reset
        dragon.location = null;
        dragon.huntmode = null;
        // sets the dragon's location to the first acceptable random choice found
        // and it's huntmode to hunting
        while (dragon.location === null) {
            var newLocation = kingdomProbs[Math.floor(Math.random() * kingdomProbs.length)];
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
function runDragonFeedingCycle(kingdoms, dragons, startDragon) {
    // initially, all dragons only hunt, which means they share
    // TODO: add sneaking
    // show me the dragon bellies (initially all zero)
    var dragonBellies = dragons.map(function (dragon) { return 0; });
    // perform play loops to get all dragons fed
    var change = true;
    var _loop_1 = function () {
        var preFeeding = JSON.parse(JSON.stringify(dragonBellies));
        // give each dragon 1 turn
        for (var dragonNumber = 0; dragonNumber < dragons.length; dragonNumber++) {
            var currentKingdom = dragons[startDragon].location;
            if (dragonBellies[dragonNumber] === 0 && kingdoms[currentKingdom].sheep > 0) {
                // this dragon hasn't fed. It must eat.
                dragonBellies[dragonNumber]++;
                kingdoms[currentKingdom].sheep--;
            }
            else if (dragonBellies[dragonNumber] > 0 && kingdoms[currentKingdom].sheep > 2) {
                // this dragon would like to eat and there appears to be plenty available
                dragonBellies[dragonNumber]++;
                kingdoms[currentKingdom].sheep--;
            }
            else if (dragonBellies[dragonNumber] > 0 && kingdoms[currentKingdom].sheep === 1) {
                // this kingdom is depleted anyway, so might as well take the last sheep
                dragonBellies[dragonNumber]++;
                kingdoms[currentKingdom].sheep--;
            }
            else if (kingdoms[currentKingdom].sheep === 0) {
                // this kingdom has no sheep
            }
            else {
                // this dragon has already fed and the kingdom barely has any sheep
            }
            // go to the next dragon
            startDragon = (startDragon + 1) % dragons.length;
        }
        // see if the dragon bellies have changed
        change = dragonBellies.reduce(function (prev, belly, index) {
            if (belly !== preFeeding[index])
                return true;
            return prev;
        }, false);
    };
    do {
        _loop_1();
    } while (change === true);
    // if any dragon did not get sheep, that dragon goes hungry
    dragonBellies.forEach(function (belly, index) {
        if (belly === 0)
            dragons[index].hunger++;
    });
    // now that the dragons have stopped feeding, update their sheep count
    dragons.forEach(function (dragon, index) {
        dragon.sheep += dragonBellies[index];
    });
}
/**
 * at the end of the round dragons first heal wounds with their sheep and then gain levels (if they can)
 * @param dragons
 * @param startDragon
 */
function runHealingAndLeveling(dragons, startDragon) {
    // we run this reward loop as long as dragons can keep gaining levels
    var crazyLoopCatcher = 0;
    do {
        var levelUps = false;
        // each dragon gets a turn, in current turn order
        for (var d = 0; d < dragons.length; d++) {
            // first thing is to heal
            if (dragons[startDragon].wounds > dragons[startDragon].sheep) {
                // this dragon has more wounds than sheep - heal as many wounds as possible
                dragons[startDragon].wounds -= dragons[startDragon].sheep;
                dragons[startDragon].sheep = 0;
            }
            else {
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
                if (dragons[startDragon].level === 10)
                    break;
            }
            startDragon = (startDragon + 1) % dragons.length;
            if (++crazyLoopCatcher > 90) {
                console.log("Loop:".concat(crazyLoopCatcher, " startDragon:").concat(startDragon, " levelUps:").concat(levelUps));
                console.log(dragons);
                if (crazyLoopCatcher > 100)
                    break;
            }
        }
    } while (levelUps === true);
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
function playOneGame(gameTrialStats, numDragons, numKingdoms, startSheep, numFeast, numFamine, feastFactor, famineFactor, testing) {
    // show me some debugging stuff when receiving the testing flag
    if (testing) {
        console.log();
        console.log("*** NEW GAME ***");
    }
    // start with the base kingdoms and dragons
    var kingdoms = generateKingdoms(numKingdoms, startSheep);
    var dragons = generateDragons(numDragons);
    // dragon 0 is always first player, but each round first player shifts
    var startDragon = 0, winner = false, extinction = false;
    var dragonGrouping = dragons.map(function (dragon) { return 0; });
    var _loop_2 = function () {
        console.log("Round ".concat(round + 1, " of the game, first dragon: ").concat(startDragon));
        // let each dragon pick a kingdom and a huntmode
        //console.log(`choose tactics`);
        runChooseKingdomAndHuntMode(kingdoms, dragons, startDragon);
        if (testing) {
            //console.log(`the dragons:`);
            //console.log(dragons);
        }
        // run a feast and famine cycle to add and remove sheep *after* dragons have chosen actions
        if (numFeast > kingdoms.length)
            return "break";
        //console.log(`feast and famine`)
        runFeastAndFamineCycle(kingdoms, numFeast, numFamine, feastFactor, famineFactor);
        // split the food between the dragons
        //console.log(`feeding`)
        runDragonFeedingCycle(kingdoms, dragons, startDragon);
        // allow dragons to heal and level-up
        //console.log(`leveling`)
        runHealingAndLeveling(dragons, startDragon);
        // this counts how many dragons are in each kingdom
        var kingdomMap = kingdoms.map(function (kingdom) { return 0; });
        dragons.forEach(function (dragon) {
            kingdomMap[dragon.location]++;
        });
        // this tells us how many times dragons were together
        kingdomMap.forEach(function (quantity) {
            if (quantity > 0)
                dragonGrouping[quantity - 1]++;
        });
        // this checks to see if there is a winner
        winner = dragons.reduce(function (prev, curr) {
            if (curr.level === 10)
                return true;
            return prev;
        }, false);
        // this checks to see if all sheep have been eaten
        extinction = kingdoms.reduce(function (prev, kingdom) {
            if (kingdom.sheep > 0)
                return false;
            return prev;
        }, true);
        // shift the first player by one each round
        startDragon = (startDragon + 1) % dragons.length;
    };
    // this is the core game cycle
    // the max rounds has a hard stop just for safety - the standard stop is to find a winner or go extinct
    for (var round = 0; round < 100 && winner === false && extinction === false; round++) {
        var state_1 = _loop_2();
        if (state_1 === "break")
            break;
    }
    if (testing)
        console.log("game lasted ".concat(round + 1, " rounds"));
    // record the final scores and the score histogram
    var scores = dragons.map(function (dragon) { return dragon.level; });
    var scoreHisto = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    scores.forEach(function (score) { return scoreHisto[score]++; });
    var gameTrial = {
        numDragons: numDragons,
        numKingdoms: numKingdoms,
        startSheep: startSheep,
        numFeast: numFeast,
        numFamine: numFamine,
        feastFactor: feastFactor,
        famineFactor: famineFactor,
        rounds: round + 1,
        scores: scores,
        scoreHisto: scoreHisto,
        dragonGrouping: dragonGrouping,
        winner: (winner === true) ? 1 : 0
    };
    // show this game's data
    if (testing) {
        console.log(kingdoms);
        console.log(dragons);
        console.log(gameTrial);
    }
    // record this game's data
    gameTrialStats.push(gameTrial);
}
;
function playManyGames(gameParameterTrials, games, numDragons, numKingdoms, startSheep, numFeast, numFamine, feastFactor, famineFactor) {
    // this stores statistics from our game
    var gameTrialStats = [];
    // this plays the game many times
    var testing = (games === 1) ? true : false;
    for (var game = 0; game < games; game++)
        playOneGame(gameTrialStats, numDragons, numKingdoms, startSheep, numFeast, numFamine, feastFactor, famineFactor, testing);
    // creates some calculation helpers
    var arr1 = [], arr2 = [];
    for (var i = 0; i < numDragons; i++) {
        arr1.push(0);
        arr2.push(0);
    }
    var scores = gameTrialStats.reduce(function (prev, curr) {
        return prev.map(function (qty, ind) { return qty + curr.scores[ind] / games; });
    }, arr1);
    var scoreHisto = gameTrialStats.reduce(function (prev, curr) {
        return prev.map(function (qty, ind) { return qty + curr.scoreHisto[ind] / games; });
    }, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    var grouping = gameTrialStats.reduce(function (prev, curr) {
        return prev.map(function (qty, ind) { return qty + curr.dragonGrouping[ind] / games; });
    }, arr2);
    // this calculates what the average game looks like with these parameters
    var averageGameTrialStats = {
        numDragons: numDragons,
        numKingdoms: numKingdoms,
        startSheep: startSheep,
        numFeast: numFeast,
        numFamine: numFamine,
        feastFactor: feastFactor,
        famineFactor: famineFactor,
        rounds: Math.round(gameTrialStats.reduce(function (prev, curr) { return prev + curr.rounds; }, 0) / games * 10) / 10,
        scores: scores.map(function (qty) { return Math.round(qty * 10) / 10; }),
        scoreHisto: scoreHisto.map(function (qty) { return Math.round(qty * 10) / 10; }),
        dragonGrouping: grouping.map(function (qty) { return Math.round(qty * 10) / 10; }),
        winner: Math.round(gameTrialStats.reduce(function (prev, curr) { return prev + curr.winner; }, 0) / games * 100) / 100
    };
    // show the average game
    console.log("The average game:");
    console.log(averageGameTrialStats);
    gameParameterTrials.push(averageGameTrialStats);
}
// how we store our game trial data
var gameParameterTrials = [];
var trial = 0;
for (var numDragons = 4; numDragons <= 4; numDragons++) {
    for (var numKingdoms = 9; numKingdoms <= 9; numKingdoms++) {
        for (var startSheep = 3; startSheep <= 3; startSheep++) {
            for (var feastFactor = 4; feastFactor <= 4; feastFactor++) {
                for (var famineFactor = 4; famineFactor <= 4; famineFactor++) {
                    for (var numFeast = 4; numFeast <= 4; numFeast++) {
                        for (var numFamine = 1; numFamine <= 1; numFamine++) {
                            console.log("Trail ".concat(++trial));
                            playManyGames(gameParameterTrials, 1000, numDragons, numKingdoms, startSheep, numFeast, numFamine, feastFactor, famineFactor);
                        }
                    }
                }
            }
        }
    }
}
// filter down to trials with an acceptable win ratio
var final = gameParameterTrials.filter(function (a) { return (a.winner >= .7 && a.winner <= .9); });
final.sort(function (a, b) { return a.winner - b.winner; });
//console.log(final);
final.forEach(function (trial, index) {
    var keys = Object.keys(trial);
    if (index === 0)
        console.log(JSON.stringify(keys));
    else {
        var foo_1 = [];
        keys.forEach(function (key) { return foo_1.push(trial[key]); });
        console.log(JSON.stringify(foo_1));
    }
});
console.log("Trials that passed muster: ".concat(final.length, " of ").concat(trial));
