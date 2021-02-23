/**
 * this module contains the structure of the stateOf object
 * mostly this is just notes, right now
 */
 
let stateOf = {

  /**
   * The turn module is responsible for controlling the flow of the game and 
   * determining which agent acts next. Its settings are chosen from within the 
   * Turn Module Interface, but many of its parameters come from other modules.
   */
  turnModule: {
    /** 
     * Stages are the largest structure in game flow, and are responsible for 
     * determining the current rules set of the game. Many games have three 
     * stages (beginning, middle, end) that allow them to: 
     *  (1) be setup for first play
     *  (2) play as normal
     *  (3) clean up and determine final scoring
     * However, games can have any number of stages; they don't repeat and are 
     * transitioned based on component state. Stages hold phases; each has a 
     * specific list of phases it contains as well as the specific rules 
     * that apply during that stage
     */
    stages: [{
      name: 'stage01',
      // two phases
      phases: ['phase02', 'phase03'],
      // each phase happens just once
      phaseCycles: [],
      // with three rules in play
      rules: ["rule01","rule02","rule03"]
    },{
      name: 'stage02',
      // three phases
      phases: ['phase01', 'phase02', 'phase03'],
      // where ...
      phaseCycles: [{
        // phase 01 can repeat itself several times
        phases: ['phase01'],
        triggers: ['trigger01']
      },{
        // and phases 02 and 03 can repeat in a cycle
        phases: ['phase02','phase03'],
        triggers: ['trigger02']
      }],
      // with seven rules used in this stage
      rules: ['rule04','rule05','rule06','rule07','rule08','rule09','rule10']
    },{
      name: 'stage03',
      // single phase
      phases: ['phase04'],
      // played just once
      phaseCycles: [],
      // with five rules used
      rules: ['rule11','rule12','rule13','rule14','rule15']
    }],
    
    /**
     * phases are the game structure that broadly determine which actions are 
     * available to the agents; these sets of actions may be reduced by the 
     * current component state, but will never be increased. In other words: 
     * if an agent can do it, it must be listed in the phase definition first.
     * Phases are repeatable, both individually and in cycles; that is recorded 
     * in the stge definition
     * It's possible that phases get their actions from the embedded turns
     */
    phases: [{
      name: 'phase01',
      actions:["action01","action02","action03","action04","action05"],
      roundName: 'round01',
      turnName: 'turn01'
    },{
      name: 'phase02',
      actions:["action02","action04","action06","action07","action08"],
      roundName: 'round02',
      turnName: 'turn02'
    },{
      name: 'phase03',
      actions:["action01","action03","action06","action10","action15"],
      roundName: 'round02',
      turnName: 'turn03'
    },{
      name: 'phase04',
      actions:["action11","action12","action13","action14"],
      roundName: 'round01',
      turnName: 'turn04'
    }],
    
    /**
     * rounds are the game structure that determines the specific order in which 
     * agents may act. Rounds have one of a predetermined list of typesand may 
     * also include specific interrupts and reactions that can temporarily alter 
     * turn order. Only specific actions are allowed to interrupt or react and 
     * agents must have access to those actions as indicated by a 
     * tracking component
     */
    rounds: [{
      name: 'round01',
      // simple fixed round
      type: 'fixed',
      // with no interrupts or reactions
      interrupts: [],
      reactions: []
    },{
      name: 'round02',
      // simple fixed order
      type: 'fixed',
      // where agents can interrupt the current actor or react to its actions
      interrupts: ['action07','action08'],
      reactions: ['action9','action10']
    }],
    
    /**
     * a turn is the time during which a single agents performs one or more 
     * actions sequentially before another gent is allowed to act, though 
     * interrupts and reactions may alter this. Turns have one or more steps 
     * which define a particular order actions must be taken in. Multiple turns 
     * may be defined, typically one for each phase because the available 
     * actions are different
     */
    turns: [{
      name: 'turn01',
      // this turn consists of three steps
      steps: [{
        // first step allows for only a single action (IE: roll dice and move)
        name: 'step01',
        actions: ['action01']
      },{
        // second step gives the agent a choice (IE: buy property or pay rent)
        name: 'step02',
        actions: ['action02','action03']
      },{
        // third step has more possible actions: (buy/sell houses, action property, etc)
        name: 'step03',
        actions: ['action04','action05','action06']
      }]
    },{
      name: 'turn02',
      // this turn has a single step with lots of available actions
      step: [{
        name: 'step01',
        actions: ['action02','action04','action06','action08','action10']
      }]
    }]
  },
  
  
  /**
   * The action module contains the definitions of avery action agents are 
   * allowed to perform in the game. General availability of actions is determined 
   * by the Turn Module via the current stage, phase, round, turn, and step; 
   * however, the action module determines which of the available actions is 
   * allowed to the current agent by examining the tracking components.
   * 
   * Actions are the mechanism by which the component state of the game is 
   * changed. They have a name/id, and a listof checks and performs.
   * Checks are expressions that must be true for the action to be available
   * Performs are operations that occur when the action is enacted
   * 
   * The Action Module will run the Checks for every action the Turn Module says 
   * is present, narrowing down the list to only those that have passed all the 
   * checks. This shorter list is passed to the Agent Module to determine which 
   * action is actually chosen.
   * 
   * Actions should be as discrete as possible. So if a player can buy a card 
   * with money or sometimes get one for free, those should be distinct actions. 
   */
  actionModule: {
    type: '',
    actions: [{
      // name / id of action
      name: 'buy one card',
      id: 'uuid#',
      // determines when the action can be used
      checks: [{
        // there must be at least 1 of the thing you want to get
        componentName: 'game.itemToPurchase.count',
        discriminator: '>=',
        value: 1
      },{
        // if the agent has enough money to buy the item ...
        componentName: 'currentAgent.money',
        discriminator: '>=',
        value: 'game.itemToPurchase.cost'
      }],
      // determines what the action does
      performs:[{
        componentName: 'currentAgent.hand',
        name: 'add',
        value: 'game.itemToPurchase.card'
      },{
        componentName: 'currentAgent.money',
        operation: 'subtract',
        value: 'game.itemToPurchase.cost'
      }],
    },{
      // name / id of action
      name: 'get a free card',
      id: 'uuid#',
      checks:[{
        // there must be at least 1 of the thing you want to get
        componentName: 'game.itemToPurchase.count',
        discriminator: '>=',
        value: 1
      },{
        // if the agent can take a free item ...
        componentName: 'currentAgent.freeItem',
        discriminator: '>=',
        value: 1
      }],
      performs:[{
        componentName: 'currentAgent.freeItem',
        operation: 'subtract',
        value: 1
      },{
        componentName: 'currentAgent.hand',
        name: 'add',
        value: 'game.itemToPurchase.card'
      }],
    }],
  },
  
  
  /**
   * the Reaction Module contains a list of actions the game performs based on 
   * the current component state. This list is divided into several buckets 
   * depending on when the component state is checked.
   * Reactions are defined the same as as actions and are capable of all the 
   * same operations; however, they are kept separate from actions because they 
   * aren't things the players choose to do directly. Reactions are also 
   * typically responsible for transitions in the Turn Module
   */
  reactionModule: {
    afterAction: ['action01','action02','action03'],
    afterTurn: ['action04','action05'],
    afterRound: ['action06','action07','action07','action08'],
    afterPhase: ['action09','action10'],
    afterStage: ['action11','action12'],
    reactions: [{
      
    }]
   },
  
  /**
   * The Agent Module contains the number of agents playing the game. It's also 
   * the module responsible for determining which actions the agents choose of 
   * those available.
   * 
   * In level 1 playtesting, agents choose actions antirely at random. We call 
   * this monte-carlo testing. Agents do not make decisions based on desired 
   * outcomes. They just play. This works because we play a very large number of 
   * games with level 1 agents and are able to discern the relative strength of 
   * different actions without preconceptive biases.
   * 
   * In level 2 playtesting we use level 1 playtesting data to train neural 
   * networks to make heuristic choices from available actions. These NNs are 
   * each tuned to achieve specific outcomes:
   *  (1) highest personal score
   *  (2) lowest personal score
   *  (3) highest total game score
   *  (4) smallest game delta (highest-lowest)
   *  (5) lowest total game score
   * the NNs continue to play and reinforce their initial training goals, but 
   * play against each other in various combinations in order to rate different 
   * tactics. For example, 3 personal-score maximizers might play a very 
   * different game than 2 high-totals and a min-delta.
   */
  agentModule: {
    agents: [{
      name: "agent01",

    },{
      name: "agent02",

    },{
      name: "agent03",

    }]
    
  }
  
};


/**
 * round types are a predefined structure that users select from within the TMI
 * rounds may also optionally contain "Interrupts" and "Reactions"
 * interrupts allow an agent outside
 */
const roundTypes = [
  /**
   * simple turn orders play out in a predetermined fashion with agent actions 
   * and component tracking haveing no effect
   */
  {
    // play progesses through the agents in numerical order from 1 to the highest
    name: 'fixed',
    properties: {},
    options: {}
  },{
    // as fixed, but the first player increases one each turn
    // once the highest number has played, return to 1 if unplayed and continue
    // until all have played
    name: 'progressive',
    properties: {},
    options: {}
  },{
    // as progessive, but the first player decreses one each turn, thus the last 
    // player of each round becomes the first next round and plays twice in a row.
    name: 'lastFirst',
    properties: {},
    options: {}
  },{
    // as progessive, but the first player is chosen randomly each round
    name: 'randomStart',
    properties: {},
    options: {}
  },{
    // each agent is selected at random from those that have not yet played
    name: 'randomeTurn',
    properties: {},
    options: {}
  },
  
  /**
   * adaptive turn orders are influenced by the current state of the game, but 
   * agents have no direct influence
   */
  {
    // turn order is determined at the start of the round by the value a 
    // tracking component for each agent
    name: 'staticStat',
    properties: {},
    options: {}

  },{
    // the next agent to act is determined at the end of each turn by the value
    // of a tracking component for each agent
    name: 'dynamicStat',
    properties: {},
    options: {}

  },{
    // this turn order spans rounds from within a repeatable phase
    // the first player to pass in a round becomes the first player to act in 
    // the next phase, the second is second, and so on
    name: 'passOrder',
    properties: {},
    options: {}

  },
  
  /**
   * purchase turn orders allow agents to determine their turn order directly by 
   * interacting with the other agents
   */
  {
    // at the start of each round agents offer to modify a tracking component to 
    // become first plyer. The one with the largest offered change goes first 
    // and play progresses numerically after that. Only the winner actually 
    // "pays", and bids can be done openly or in secret. 
    name: 'bidStart',
    properties: {},
    options: {}

  },{
    // as bidStart, but all agents pay and turn order is from highest to lowest 
    // component change
    name: 'bidTurn',
    properties: {},
    options: {}

  },{
    // on their turn agents may take an action to become first player; only one 
    // agent may do this and usually at the expense of taking other actions if 
    // on one does this, the order is unchanged from the previous round
    name: 'actionStart',
    properties: {},
    options: {}

  },{
    // agents are required to select their order for the next round typically by 
    // selection of a role or function that provides trade offs against the turn 
    // order. Roles typically have thematic names and may allow repeats or not
    // If repeats are allowed, a secondary mechanism must be employed to resolve 
    // ties. If not, extra roles and random role removal may be used to keep 
    // aagents from guessing what roles have laready been taken
    name: 'actionTurn',
    properties: {},
    options: {}
  }]