import React from 'react';
import flowEditor from './flowEditor';
import { TurnModuleParams } from './index';
import { capitalize, phraseFormatter } from '../../scripts/naming';
import css from './turnModule.module.css';
import TextareaAutosize from 'react-textarea-autosize';

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
  phasesFreeText: string;         // free text of phase names
  phases: Array<string>;          // list of phases in the stage
  phaseCycles: Array<PhaseCycle>; // list of phase cycles in the stage
  rules: Array<string>;           // list of rules used in this stage (?)
}

export const NEW_STAGE = {
  id: '',
  name: '',
  phasesFreeText: '',
  phases: [],
  phaseCycles: [],
  rules: [],
};

export function drawStage(
  stateOf: TurnModuleParams,
  stage: Stage,
  row: number
){

  let collapse = ''; //row==0 ? css.collapse : '';

  return (
  <div className={`${css.cardSleeve} ${collapse}`} key={`stage-${row}`}>
    <div className={`${css.card} ${css.stage}`}>
      <div></div><div>Stage</div>
      <div className={css.head}>id:</div>
      <div className={css.body}>{stage.id}</div>

      <div className={css.head}>Name:</div>
      <input 
        className={css.body} 
        value={stage.name}
        onChange={(evt: React.ChangeEvent<HTMLInputElement>)=>{
          let stages = JSON.parse(JSON.stringify(stateOf.stages));
          stages[row].name = evt.target.value;
          stateOf.setStages(stages);
        }}
      />
      <div className={css.head}>Phases:</div>
      <TextareaAutosize 
        className={css.body} 
        value={stage.phasesFreeText}
        onChange={(evt: React.ChangeEvent<HTMLTextAreaElement>)=>{
          let stages = JSON.parse(JSON.stringify(stateOf.stages));
          stages[row].phasesFreeText = evt.target.value;
          stateOf.setStages(stages);
        }}
        onKeyDown={(evt: React.KeyboardEvent<HTMLTextAreaElement>)=>{
          if(evt.keyCode == 13) {
            evt.preventDefault();
            let stages = JSON.parse(JSON.stringify(stateOf.stages));
            let phases = phraseFormatter(stages[row].phasesFreeText);
            stages[row].phases = phases
            stages[row].phasesFreeText = phases.join(', ');
            stateOf.setStages(stages);
          }
        }}
      />

      <div className={css.head}>Rules:</div>
      <TextareaAutosize className={css.body} value={stage.rules.join(', ')}/>
    </div>
    {flowEditor(stateOf,'stage',row)}
  </div>
  );
}