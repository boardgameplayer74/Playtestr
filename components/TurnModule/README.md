### The Turn Module
This is responsible for controlling the flow of the game and determining which player (agent) acts next. Its settings are chosen from within the **Turn Module Interface (TMI)**, but many parameters come from other modules. The **TMI** uses five kinds of structures to coordinate the flow of the game: **stages**, **phases**, **rounds**, **turns**, and **steps**.

The main component of the **TurnModule** is the `index.tsx`, which is responsible for rendering the **TMI** itself and also contains the TMI data model. A number of support components are located in the same directory to render different parts of the **TMI** as needed, and a unified **TMI** css module lives here as well.

## drawStage

## drawPhase

## drawRound

## drawTurn

## drawStep