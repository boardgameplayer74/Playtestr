import React from 'react';
import flowEditor from './flowEditor';
import { TurnModuleParams } from './index';
import css from './turnModule.module.css';

/**
 * Stages are the largest structure in game flow, and are responsible for 
 * determining the current rules set of the game. Stages frequently play very 
 * differently from each other. All games have at least one stage, with 
 * specialized "startup" and "cleanup" stages being the most common additional 
 * stages. However, games can have any positive number of stages.
 */

/**
 * a phase cycle describes how which phases repeat within a stage and what 
 * triggers the game to move on from that cycle
 */
interface PhaseCycle {
  phases: Array<string>;  // an array of phase names that repeat in sequence
  trigger: Array<string>; // an array of trigger events that will end the cycle
}

export interface Stage {
  id: string;                     // unique identifier for the stage, generated
  name: string;                   // human friendly name for the stage
  phases: Array<string>;          // list of phases in the stage
  phaseCycles: Array<PhaseCycle>; // list of phase cycles in the stage
  rules: Array<string>;           // list of rules used in this stage (?)
}

export const NEW_STAGE = {
  id: '',
  name: '',
  phases: [],
  phaseCycles: [],
  rules: [],
};

export function drawStage(
  stateOf: TurnModuleParams,
  stage: Stage,
  row: number
){

  return (
  <div className={css.cardSleeve} key={`stage-${row}`}>
    <div className={`${css.card} ${css.stage}`}>
      <div></div><div>Stage</div>
      <div className={css.head}>id:</div>
      <div className={css.body}>{stage.id}</div>
      <div className={css.head}>Name:</div>
      <div className={css.body}>{stage.name}</div>
      <div className={css.head}>Phases:</div>
      <div className={css.body}>{stage.phases.join(', ')}</div>
      <div className={css.head}>Rules:</div>
      <div className={css.body}>{stage.rules.join(', ')}</div>
    </div>
    {flowEditor(stateOf,'stage',row)}
  </div>
  );
}