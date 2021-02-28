import React from 'react';
import { TurnModuleParams } from './index';
import css from './turnModule.module.css';
import ReactTooltip from 'react-tooltip';

export default function flowEditor(
  stateOf: TurnModuleParams,
  thing: string,
  row: number
){
  let things = stateOf[`${thing}s`];

  const killShow = things.length<2 ? css.noShow : '';
  const upShow = row==0 ? css.noShow : '';
  const downShow = things.length-1==row ? css.noShow : '';

  return (
    <div className={css.flowEditor}>
      <ReactTooltip />
      <button 
        className={`${css.kill} ${killShow}`}
        data-tip={`delete the current ${thing}`}
        onClick={()=>{
          stateOf.remove(thing,row);
        }}
      >x</button>
      <button 
        className={`${css.up} ${upShow}`}
        data-tip="move up one"
        onClick={()=>{
          stateOf.moveUp(thing,row);
        }}
      >&uarr;</button>
      <button 
        className={`${css.down} ${downShow}`}
        data-tip="move down one"
        onClick={()=>{
          stateOf.moveDown(thing,row);
        }}
      >&darr;</button>
      <button 
        className={css.add}
        data-tip={`Add another ${thing} after this one`}
        onClick={()=>{
          stateOf.add(thing,row).catch(alert);
        }}
      >+</button>
    </div>
  );
}