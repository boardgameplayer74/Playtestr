"use strict";
exports.__esModule = true;
;
var Mode;
(function (Mode) {
    Mode["hunting"] = "HUNTING";
    Mode["sneaking"] = "SNEAKING";
    Mode["warpath"] = "WARPATH";
})(Mode || (Mode = {}));
;
/**
 * create some kingdoms full of sheep
 * @param   numKingdoms the count of kingdoms this game will use
 * @return  Kingdom[]   an array of Kingdom objects
 */
function generateKingdoms(numKingdoms, startSheep) {
    var kingdoms = [];
    for (var i = 0; i < numKingdoms; i++)
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
function generateDragons(numDragons) {
    var dragons = [];
    for (var i = 0; i < numDragons; i++)
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
        // TODO: add distance, sheep count, and dragon_count to the rubric
        // return the decision
        return isAcceptable;
    }
    // dragons prefer kingdoms with at least 3 sheep because they don't want to exterminate all life
    var threePlusSheep = kingdoms.filter(function (kingdom) { return kingdom.sheep > 2; });
    // the probability that a dragon goes to a kingdom is proportional to the number of sheep it has
    // this is done by adding the index for that kingdom a number of times equal to its sheep
    var kingdomProbs = [];
    kingdoms.forEach(function (kingdom) {
        for (var i = 0; i < kingdom.sheep; i++)
            kingdomProbs.push(kingdom.index);
    });
    //console.log(`kingdomProbs: ${JSON.stringify(kingdomProbs)}`);
    // have each dragon choose where it's going to go and what it's going to do
    for (var turn = 0; turn < dragons.length; turn++) {
        var dragon = dragons[startDragon];
        // initially, the dragon's location and mode are reset
        dragon.location = null;
        dragon.mode = null;
        // sets the dragon's location to the first acceptable random choice found
        // and it's mode to hunting
        while (dragon.location === null) {
            var newLocation = kingdomProbs[Math.floor(Math.random() * kingdomProbs.length)];
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
function runDragonFeedingCycle(kingdoms, dragons, startDragon) {
    // initially, all dragons only hunt, which means they share
    // show me the dragon bellies (initially all zero)
    var bellies = dragons.map(function (dragon) { return 0; });
    var change = true;
    var _loop_1 = function () {
        var preFeeding = JSON.parse(JSON.stringify(bellies));
        // give each dragon 1 turn
        for (var dragonNumber = 0; dragonNumber < dragons.length; dragonNumber++) {
            var currentKingdom = dragons[startDragon].location;
            if (bellies[dragonNumber] === 0 && kingdoms[currentKingdom].sheep > 0) {
                // this dragon hasn't fed. It must eat.
                bellies[dragonNumber]++;
                kingdoms[currentKingdom].sheep--;
                //console.log(`dragon ${dragonNumber} hunted in kingdom ${currentKingdom}`);
            }
            else if (bellies[dragonNumber] > 0 && kingdoms[currentKingdom].sheep > 2) {
                // this dragon would like to eat and there appears to be plenty available
                bellies[dragonNumber]++;
                kingdoms[currentKingdom].sheep--;
                //console.log(`dragon ${dragonNumber} hunted in kingdom ${currentKingdom}`);
            }
            else if (bellies[dragonNumber] > 0 && kingdoms[currentKingdom].sheep === 1) {
                // this kingdom is depleted anyway, so might as well take the last sheep
                bellies[dragonNumber]++;
                kingdoms[currentKingdom].sheep--;
                //console.log(`dragon ${dragonNumber} hunted in kingdom ${currentKingdom}`);
            }
            else if (kingdoms[currentKingdom].sheep === 0) {
                //console.log(`dragon ${dragonNumber} could not find food in kingdom ${currentKingdom}`);
            }
            else {
                // this dragon has already fed and the kingdom barely has any sheep
                //console.log(`dragon ${dragonNumber} with belly ${bellies[dragonNumber]} chose not to feed in Kingdom ${currentKingdom} with ${kingdoms[currentKingdom].sheep} sheep`);
            }
            // go to the next dragon
            startDragon = (startDragon + 1) % dragons.length;
        }
        // see if the bellies have changed
        change = bellies.reduce(function (prev, belly, index) {
            if (belly !== preFeeding[index])
                return true;
            return prev;
        }, false);
    };
    do {
        _loop_1();
    } while (change === true);
    // now that the dragons have stopped feeding, update their sheep count
    dragons.forEach(function (dragon, index) {
        dragon.sheep += bellies[index];
    });
}
/**
 * this runs a single simulation of the dragon game
 */
function playOneGame(gameData, numDragons, numKingdoms, startSheep, numFeast, numFamine, feastFactor, famineFactor) {
    //console.log();
    //console.log(`*** NEW GAME ***`);
    // start with the base kingdoms and dragons
    var kingdoms = generateKingdoms(numKingdoms, startSheep);
    var dragons = generateDragons(numDragons);
    // let the dragons fly around and get sheep
    // dragon 0 is always starts as first player, but each round first player shifts
    var startDragon = 0, winner = -1;
    var dragonGrouping = dragons.map(function (dragon) { return 0; });
    var _loop_2 = function () {
        //console.log(`Round ${round+1} of the game, first dragon: ${startDragon}`);
        // pick a kingdom and a hunt mode for each dragon
        runChooseKingdomAndHuntMode(kingdoms, dragons, startDragon);
        //console.log(`the dragons:`);
        //console.log(dragons);
        // now that all dragons have chosen a location, run a feast and famine cycle
        if (numFeast > kingdoms.length)
            return "break";
        runFeastAndFamineCycle(kingdoms, numFeast, numFamine, feastFactor, famineFactor);
        //console.log(`kingdoms before feeding:`);
        //console.log(kingdoms);
        // the dragon feed cycle
        runDragonFeedingCycle(kingdoms, dragons, startDragon);
        //console.log(`kingdoms after feeding:`);
        //console.log(kingdoms);
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
            if (curr.sheep >= 54)
                return curr.index;
            return prev;
        }, -1);
        if (winner > -1) {
            return "break";
        }
        // this checks to see if all sheep have been eaten
        var totalSheep = kingdoms.reduce(function (agg, kingdom) { return agg + kingdom.sheep; }, 0);
        if (totalSheep === 0)
            return "break";
        // shift the first player by one each round
        startDragon = (startDragon + 1) % dragons.length;
    };
    for (var round = 0; round < 100 && winner === -1; round++) {
        var state_1 = _loop_2();
        if (state_1 === "break")
            break;
    }
    //console.log(`game lasted ${round+1} rounds`);
    var game = {
        numDragons: numDragons,
        numKingdoms: numKingdoms,
        startSheep: startSheep,
        numFeast: numFeast,
        numFamine: numFamine,
        rounds: round + 1,
        scores: dragons.map(function (dragon) { return dragon.sheep; }),
        scoreTotal: dragons.reduce(function (prev, curr) { return prev + curr.sheep; }, 0),
        dragonGrouping: dragonGrouping,
        winner: (winner > -1) ? 1 : 0
    };
    // show this game's data
    //console.log(game);
    // record this game's data
    gameData.push(game);
}
;
function playManyGames(gameParameterTrials, games, numDragons, numKingdoms, startSheep, numFeast, numFamine, feastFactor, famineFactor) {
    // this stores statistics from our game
    var gameData = [];
    // this plays the game many times
    for (var game = 0; game < games; game++)
        playOneGame(gameData, numDragons, numKingdoms, startSheep, numFeast, numFamine, feastFactor, famineFactor);
    // creates some calculation helpers
    var arr1 = [], arr2 = [];
    for (var i = 0; i < numDragons; i++) {
        arr1.push(0);
        arr2.push(0);
    }
    var scores = gameData.reduce(function (prev, curr) {
        return prev.map(function (qty, ind) { return qty + curr.scores[ind] / games; });
    }, arr1);
    var grouping = gameData.reduce(function (prev, curr) {
        return prev.map(function (qty, ind) { return qty + curr.dragonGrouping[ind] / games; });
    }, arr2);
    // this calculates what the average game looks like with these parameters
    var averageGameData = {
        numDragons: numDragons,
        numKingdoms: numKingdoms,
        startSheep: startSheep,
        numFeast: numFeast,
        numFamine: numFamine,
        rounds: Math.round(gameData.reduce(function (prev, curr) { return prev + curr.rounds; }, 0) / games * 10) / 10,
        scores: scores.map(function (qty) { return Math.round(qty * 10) / 10; }),
        scoreTotal: scores.reduce(function (prev, curr) { return prev + curr; }, 0),
        dragonGrouping: grouping.map(function (qty) { return Math.round(qty * 10) / 10; }),
        winner: Math.round(gameData.reduce(function (prev, curr) { return prev + curr.winner; }, 0) / games * 10) / 10
    };
    // show the average game
    //console.log(`The average game:`);
    //console.log(averageGameData);
    gameParameterTrials.push(averageGameData);
}
// how we store our game trial data
var gameParameterTrials = [];
var numDragons = 4;
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
var trial = 0;
for (var numKingdoms = 1; numKingdoms <= 8; numKingdoms++) {
    for (var startSheep = 3; startSheep <= 5; startSheep++) {
        for (var feastFactor = 1; feastFactor <= 3; feastFactor++) {
            for (var famineFactor = 2; famineFactor <= 3; famineFactor++) {
                for (var numFeast = 1; numFeast <= numKingdoms; numFeast++) {
                    for (var numFamine = 1; numFamine <= numKingdoms; numFamine++) {
                        console.log("Trail ".concat(++trial));
                        playManyGames(gameParameterTrials, 1000, numDragons, numKingdoms, startSheep, numFeast, numFamine, feastFactor, famineFactor);
                    }
                }
            }
        }
    }
}
// filter down to trials with an acceptable win ratio
var final = gameParameterTrials.filter(function (a) { return (a.winner >= .6 && a.winner < .9); });
final.sort(function (a, b) { return a.winner - b.winner; });
console.log(final);
console.log("Trials that passed muster: ".concat(final.length, " of ").concat(trial));
