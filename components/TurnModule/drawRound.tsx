import React from 'react';
import flowEditor from './flowEditor';
import { TurnModuleParams, FlowPartOptions, Item } from './index';
import { 
  camelToTitle, 
  phraseFormatter, 
  phraseListFormatter 
} from '../common/naming';
//import Select from 'react-select';
import { familySelector } from './selectors';
import TextareaAutosize from 'react-textarea-autosize';
import css from './turn.module.css';

/**
 * rounds are the game structure that determines the specific order in which 
 * agents may act. Rounds have one of a predetermined list of types and may 
 * also include specific interrupts and reactions that can temporarily alter 
 * turn order. Only specific actions are allowed to interrupt or react and 
 * agents must have access to those actions as indicated by a 
 * tracking component
 * Rounds are pre-defined structures that are selected by teh designer
 */

/**
 * Options: Many rounds and turns have parameters that are set by 
 * options and flags
 */
interface RoundOption {
  key: string;              // a key that identifies a particular turn option
  value: string | boolean;  // a value that indicates which option was taken
}

export interface Round {
  flowType: string;
  identity: Item;               // uniquely identifies this round
  description: string;          // free test to describe the round purpose
  type: string;                 // one of a pre-defined list of Round types
  interruptFreeText: string;
  interrupts: Array<string>;    // list of actions allowed to interrupt a turn
  reactionFreeText: string;
  reactions: Array<string>;     // list of actions allowed to react to a turn
  options: Array<RoundOption>;  // list of options used with this round
  parents: Array<string>;       // list of phase IDs this round is linked to
  children: Array<string>;      // list if turn IDs this round is linked to
}

export const NEW_ROUND = {
  flowType: 'round',
  identity: null,
  description: '',
  type: '',
  interruptFreeText: '',
  interrupts: [],
  reactionFreeText: '',
  reactions: [],
  options: [],
  parents: [],
  children: [],
};

/**
 * This is the list of all known round types. Each one is unique and creates a 
 * specific ordering mechanism. Many are "simple" and don't require any data
 * beyond the number of players. Others are Adaptive and create play orders 
 * based on game components they track. Finally there are Purchase orders that 
 * require players to choose how much much they are willing to spend to 
 * determine their play order
 */
const ROUND_TYPES = {
  fixed: {
    type: "simple",
    options: {
      clockwise: true
    }
  },
  progressive: {
    type: "simple",
    options: {
      clockwise: true
    }
  },
  lastFirst: {
    type: "simple",
    options: {
      clockwise: true
    }
  },
  randomStart: {
    type: "simple",
    options: {
      clockwise: true
    }
  },
  randomTurn: {
    type: "simple"
  },
  staticStat: {
    type: "adaptive",
    options: {
      clockwise: true
    }
  },
  dynamicStat: {
    type: "adaptive"
  },
  passOrder: {
    type: "adaptive"
  },
  bidStart: {
    type: "purchase",
    options: {
      clockwise: true
    }
  },
  bidTurn: {
    type: "purchase"
  },
  actionStart: {
    type: "purchase",
    options: {
      clockwise: true
    }
  },
  actionTurn: {
    type: "purchase"
  },
};

export function drawRound(
  stateOf: TurnModuleParams,
  round: Round,
  row: number,
  options?: FlowPartOptions,
){
  // use this to hide the ID strings that appear in the TMI
  const SHOW_ID = options['testing']==true ? '' : css.noShow;

  return (
    <div className={css.cardSleeve} key={`round-${row}`}>
      <div className={`${css.card} ${css.round}`}>
        <label className={css.head}>Name:</label>
        <input 
          className={css.body} 
          value={round.identity.label}
          onChange={(evt: React.ChangeEvent<HTMLInputElement>)=>{
            let identity = JSON.parse(JSON.stringify(round.identity));
            identity.label = phraseFormatter(evt.target.value);
            stateOf.changer('round',row,{identity});
          }}
          onKeyDown={(evt: React.KeyboardEvent<HTMLInputElement>)=>{
            if(evt.keyCode == 13) {
              evt.preventDefault();
              let identity = JSON.parse(JSON.stringify(round.identity));
              identity.label = round.identity.label.trim();
              stateOf.changer('round',row,{identity});
            }
          }}
          onBlur={()=>{
            let identity = JSON.parse(JSON.stringify(round.identity));
            identity.label = round.identity.label.trim();
            stateOf.changer('round',row,{identity});
          }}        
        />
  
        <label className={css.head}>id:</label>
        <div className={css.identity}>{round.identity.value}</div>
  
        <label className={css.head}>Description:</label>
        <TextareaAutosize 
          className={css.body} 
          minRows={2}
          value={round.description}
          onChange={(evt: React.ChangeEvent<HTMLTextAreaElement>)=>{
            stateOf.changer('round',row,{description:evt.target.value});
          }}
        />

        <label className={css.head}>Type:</label>
        <select 
          className={css.body} 
          value={round.type}
          onChange={(evt: React.ChangeEvent<HTMLSelectElement>)=>{
            stateOf.changer('round',row,{type:evt.target.value});
          }}
        >
          <option value="Please Choose" key={'round-00'}>Please Choose</option>
          {Object.keys(ROUND_TYPES).map((type:string,index:number)=>{
            return (<option value={type} key={`round-${index}`}>{camelToTitle(type)}</option>);
          })}
        </select>
  
        <label className={css.head}>Options:</label>
        <div className={css.body}></div>
  
        <label className={css.head}>Interrupts:</label>
        <TextareaAutosize 
          className={css.body} 
          minRows={2}
          value={round.interruptFreeText}
          onChange={(evt: React.ChangeEvent<HTMLTextAreaElement>)=>{
            stateOf.changer('round',row,{interruptFreeText:evt.target.value});
          }}
          onKeyDown={(evt: React.KeyboardEvent<HTMLTextAreaElement>)=>{
            if(evt.keyCode == 13) {
              evt.preventDefault();
              let interrupts = phraseListFormatter(round.interruptFreeText);
              stateOf.changer('round',row,{interrupts,interruptFreeText:interrupts.join(', ')});
            }
          }}
          onBlur={()=>{
            let interrupts = phraseListFormatter(round.interruptFreeText);
            stateOf.changer('round',row,{interrupts,interruptFreeText:interrupts.join(', ')});
          }}
        />
        
        <label className={css.head}>Reactions:</label>
        <TextareaAutosize 
          className={css.body}
          minRows={2}
          value={round.reactionFreeText}
          onChange={(evt: React.ChangeEvent<HTMLTextAreaElement>)=>{
            stateOf.changer('round',row,{reactionFreeText:evt.target.value});
          }}
          onKeyDown={(evt: React.KeyboardEvent<HTMLTextAreaElement>)=>{
            if(evt.keyCode == 13) {
              evt.preventDefault();
              let reactions = phraseListFormatter(round.reactionFreeText);
              stateOf.changer('round',row,{reactions,reactionFreeText:reactions.join(', ')});
            }
          }}
          onBlur={()=>{
            let reactions = phraseListFormatter(round.reactionFreeText);
            stateOf.changer('round',row,{reactions,reactionFreeText:reactions.join(', ')});
          }}
        />
  
        <label className={css.head}>Parent Phases:</label>
        {familySelector(stateOf,round,'parent','phase')}

        <label className={css.head}>Child Turns:</label>
        {familySelector(stateOf,round,'child','turn')}

      </div>
      {flowEditor(stateOf,'round',row)}
    </div>
    );
}