import React from 'react';
import flowEditor from './flowEditor';
import { TurnModuleParams } from './index';
import { phraseFormatter } from '../common/naming';
import TextareaAutosize from 'react-textarea-autosize';
import css from './turn.module.css';

/**
 * Phases are the game structure that broadly determine which actions are 
 * available to the agents; these sets of actions may be reduced by the 
 * current component state, but will never be increased. In other words: 
 * if an agent can do it, it must be listed in the phase definition first.
 * Phases are repeatable, both individually and in cycles; that is recorded 
 * in the stage definition
 * It's possible that phases get their actions from the embedded turns
 */

export interface Phase {
  id: string;             // unique identifer for the phase, generated
  name: string;           // human friendly name for the phase
  description: string;    // free test to describe the phase purpose
  actions: Array<string>; // list of actions available in the phase
  roundName: string;      // the human-readable name of the round definition
  roundId: string;        // the id of the round definition
  turnName: string;       // human readable turn name
  turnId: string;         // type of turn used in this phase
}

export const NEW_PHASE = {
  id: '',
  name: '',
  description: '',
  actions: [],
  roundName: '',
  roundId: '',
  turnName: '',
  turnId: '',
};
 
export function drawPhase(
  stateOf: TurnModuleParams,
  phase: Phase,
  row: number,
  options?: object,
){
  // use this to hide the ID strings that appear in the TMI
  const SHOW_ID = options['testing']==true ? '' : css.noShow;

  return (
    <div className={css.cardSleeve} key={`phase-${row}`}>
      <div className={`${css.card} ${css.phase}`}>
        <label className={css.head}>Name:</label>
        <input 
          className={css.body} 
          value={phase.name}
          autoComplete="off"
          onChange={(evt: React.ChangeEvent<HTMLInputElement>)=>{
            stateOf.changer('phase',row,{name:phraseFormatter(evt.target.value)});
          }}
          onKeyDown={(evt: React.KeyboardEvent<HTMLInputElement>)=>{
            if(evt.keyCode == 13) {
              evt.preventDefault();
              stateOf.changer('phase',row,{name:phase.name.trim()});
            }
          }}
          onBlur={()=>{
            stateOf.changer('phase',row,{name:phase.name.trim()});
          }}        
        />
        <label className={`${css.head} ${SHOW_ID}`}>id:</label>
        <div className={`${css.identity} ${SHOW_ID}`}>{phase.id}</div>
  
        <label className={css.head}>Description:</label>
        <TextareaAutosize 
          className={css.body} 
          minRows={2}
          value={phase.description}
          onChange={(evt: React.ChangeEvent<HTMLTextAreaElement>)=>{
            stateOf.changer('phase',row,{description:evt.target.value});
          }}
        />
  
        <label className={css.head}>Actions:</label>
        <div className={css.body}>{phase.actions.join(', ')}</div>
  
        <label className={css.head}>Round Name:</label>
        <select
          className={css.body} 
          value={phase.roundId}
          onChange={(evt: React.ChangeEvent<HTMLSelectElement>)=>{
            let roundId = evt.target.value;
            let roundName = stateOf.rounds.reduce((acc,curr)=>{
              return (curr.id==roundId) ? curr.name : acc;
            },'');
            stateOf.changer('phase',row,{roundId,roundName});
          }}
        >
          <option value="Please Choose">Please Choose</option>
          {stateOf.rounds.length && stateOf.rounds.map((round,index) => {
            return (<option 
              key={`choose-round-${index}`}
              value={round.id}
            >{round.name}</option>)
          })}
        </select>
  
        <label className={`${css.head} ${SHOW_ID}`}>Round Id:</label>
        <div className={`${css.identity} ${SHOW_ID}`}>{phase.roundId}</div>
  
        <label className={css.head}>Turn Name:</label>
        <select 
          className={css.body} 
          value={phase.turnId}
          onChange={(evt: React.ChangeEvent<HTMLSelectElement>)=>{
            let turnId = evt.target.value;
            let turnName = stateOf.turns.reduce((acc,curr)=>{
              return (curr.id==turnId) ? curr.name : acc;
            },'');
            stateOf.changer('phase',row,{turnId,turnName});
          }}
        >
          <option value="Please Choose">Please Choose</option>
          {stateOf.turns.length && stateOf.turns.map((turn,index) => {
            return (<option 
              key={`choose-turn-${index}`}
              value={turn.id}
            >{turn.name}</option>)
          })}
        </select>
  
        <label className={`${css.head} ${SHOW_ID}`}>Turn Id:</label>
        <div className={`${css.identity} ${SHOW_ID}`}>{phase.turnId}</div>
  
      </div>
      {flowEditor(stateOf,'phase',row)}
    </div>
    );
}