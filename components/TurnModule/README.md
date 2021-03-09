## The Turn Module
This is responsible for controlling the flow of the game and determining which player (agent) acts next. Its settings are chosen from within the **Turn Module Interface (TMI)**, but many parameters come from other modules. The **TMI** uses five kinds of structures to coordinate the flow of the game: **stages**, **phases**, **rounds**, **turns**, and **steps**.

### index
The main component of the **TurnModule** is the `index.tsx`, which is responsible for rendering the **TMI** itself and also contains the TMI data model. The componnents for the TMI ar designed around the notion of "lists of cards", as there can be any number of each type of component. These components cross-reference each other to show how they are connected.

### turnModule.module.css
this contains unified css formatting for the TMI so all the components have a similar look and feel

### drawStage
Stages are the largest structure in game flow, and are responsible for  determining the current rules set of the game. Stages frequently play very differently from each other. All games have at least one stage, with specialized "startup" and "cleanup" stages being the most common additional stages. However, games can have any positive number of stages.

Users create new stages using the TMI, give them names, and manually enter which rules they use and which phases are contained within them. When phase names and rules are etnered, they are checked against this known lists of both, and the user is shown when the name is new or matches an existing name.

### drawPhase
Phases are the game structure that broadly determine which actions are available to the agents; these sets of actions may be reduced by the current component state, but will never be increased. In other words: if an agent can do it, it must be listed in the phase definition first. Phases are repeatable, both individually and in cycles; that is recorded in the stage definition

Users create new phases in the TMI, give them names, and select the round and turn types that each phase uses. Available actions for each phase are also manually entered. Users are given feedback when action names already exist on the list of known actions.

### drawRound
Rounds are the game structure that determine the specific order in which agents may act. Rounds have one of a predetermined list of types.

Users create new rounds structures by entering a name and selecting the type from a dropdwon menu. They may also select zero or more options for the round, based on which type was chosen.

### drawTurn
Turn are the time window during which a single agent performs one or more actions sequentially before another agent is allowed to act, though interrupts and reactions may alter this. Turns have one or more steps which define a particular order that actions must be taken in. Only specific actions are allowed to interrupt or react and agents must have access to those actions as indicated by a tracking component.

Users create turns by entering a name. They may also enter the names of actions as Interrupts and Reactions that may be used to alter normal play order. The user is alerted to when these actions match those on the known list of all actions.

### drawStep
Steps are sets of Actions that users are required to pick from in sequential order. Turns may have a single step with a single available action, a single step with many available actions, or many steps each with it's own distinct set of available actions.

Users create steps by providing them with names and lists of Actions that are allowed to be performed at each step; they are alerted to when the action names match existing names on list of all known actions.

### flowEditor
The flowEditor is a component that attaches "add", "remove", "move up" and "move down" buttons to each of the flowParts within a particular group (stages, phases, etc). These allow users to amnipulate the number and order of various parts of the game.