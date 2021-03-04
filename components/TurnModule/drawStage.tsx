import React from 'react';
import flowEditor from './flowEditor';
import { TurnModuleParams } from './index';
import { phraseFormatter } from '../../scripts/naming';
import TextareaAutosize from 'react-textarea-autosize';
import css from './turnModule.module.css';

// use this to hide the ID strings appear in the TMI
const SHOW_ID = ''; //css.noShow;

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
  phaseFreeText: string;          // free text of phase names
  phases: Array<string>;          // list of phases in the stage
  phaseCycles: Array<PhaseCycle>; // list of phase cycles in the stage
  ruleFreeText: string;           // free text of rule names
  rules: Array<string>;           // list of rules used in this stage (?)
}

export const NEW_STAGE = {
  id: '',
  name: '',
  phaseFreeText: '',
  phases: [],
  phaseCycles: [],
  ruleFreeText: '',
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
      <label className={css.head}>Name:</label>
      <input 
        className={css.body} 
        value={stage.name}
        autoComplete="off"
        onChange={(evt: React.ChangeEvent<HTMLInputElement>)=>{
          stateOf.changer('stages',row,'name',evt.target.value);
        }}
      />
      <label className={`${css.head} ${SHOW_ID}`}>id:</label>
      <div className={css.identity}>{stage.id}</div>
      <label className={css.head}>Phases:</label>
      <TextareaAutosize 
        className={css.body} 
        minRows={2}
        value={stage.phaseFreeText}
        onChange={(evt: React.ChangeEvent<HTMLTextAreaElement>)=>{
          stateOf.changer('stages',row,'phaseFreeText',evt.target.value);
        }}
        onKeyDown={(evt: React.KeyboardEvent<HTMLTextAreaElement>)=>{
          if(evt.keyCode == 13) {
            evt.preventDefault();
            let phases = phraseFormatter(stage.phaseFreeText);
            stateOf.changer('stages',row,'phases',phases);
            stateOf.changer('stages',row,'phaseFreeText',phases.join(', '));
          }
        }}
        onBlur={()=>{
          let phases = phraseFormatter(stage.phaseFreeText);
          stateOf.changer('stages',row,'phases',phases);
          stateOf.changer('stages',row,'phaseFreeText',phases.join(', '));
        }}
      />
      <label className={css.head}>Rules:</label>
      <TextareaAutosize 
        className={css.body} 
        minRows={2}
        value={stage.ruleFreeText}
        onChange={(evt: React.ChangeEvent<HTMLTextAreaElement>)=>{
          stateOf.changer('stages',row,'ruleFreeText',evt.target.value);
        }}
        onKeyDown={(evt: React.KeyboardEvent<HTMLTextAreaElement>)=>{
          if(evt.keyCode == 13) {
            evt.preventDefault();
            let rules = phraseFormatter(stage.ruleFreeText);
            stateOf.changer('stages',row,'rules',rules);
            stateOf.changer('stages',row,'ruleFreeText',rules.join(', '));
          }
        }}
        onBlur={()=>{
          let rules = phraseFormatter(stage.ruleFreeText);
          stateOf.changer('stages',row,'rules',rules);
          stateOf.changer('stages',row,'ruleFreeText',rules.join(', '));
        }}
      />
    </div>
    {flowEditor(stateOf,'stage',row)}
  </div>
  );
}