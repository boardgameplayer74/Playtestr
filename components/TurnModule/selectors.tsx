import React from 'react';
//import flowEditor from './flowEditor';
import { TurnModuleParams } from './index';
import Select from 'react-select';
import css from './turn.module.css';

export function familySelector(
  stateOf: TurnModuleParams,
  self: any,
  type: string,
  flowPart: string
){

  // use this to hide the ID strings that appear in the TMI
  const customStyles = {
    control: (provided, state) => {
      //console.log('CONTROL: ',provided);
      return Object.assign(provided,{
        border: 'none',
        backgroundColor: 'rgba(255,255,255,.4)'
      });
    },
    option: (provided, state) => {
      //console.log('OPTION: ',provided);
      return Object.assign(provided,{
        backgroundColor:'rgba(255,255,255,.4)'
      });
    },
    singleValue: (provided, state) => {
      //console.log('SINGLE_VALUE: ',provided);
      return provided;
    }
  };

  if (type=='parent') {
    return (
      <Select 
        className={css.selector}
        styles={customStyles}
        isMulti
        value={(()=>stateOf.findParents(self.identity))()}
        options={stateOf[`${flowPart}s`].map((thing:any)=>thing.identity)}
        onChange={(selections,type) => {
          if (type.action=='select-option') {
            stateOf.addLink(type.option.value,self.identity.value);
          } else if (type.action=='remove-value') {
            stateOf.unLink(type.removedValue.value,self.identity.value);
          } else if (type.action=='clear') {
            stateOf.unLink(null,self.identity.value);
          }
        }}
      />
    );
  }
  if (type=='child') {
    return (
        <Select 
          className={css.selector}
          styles={customStyles}
          isMulti
          value={(()=>stateOf.findChildren(self.identity))()}
          options={stateOf[`${flowPart}s`].map((thing:any)=>thing.identity)}
          onChange={(selections,type) => {
            if (type.action=='select-option') {
              stateOf.addLink(self.identity.value,type.option.value);
            } else if (type.action=='remove-value') {
              stateOf.unLink(self.identity.value,type.removedValue.value);
            } else if (type.action=='clear') {
              stateOf.unLink(self.identity.value,null);
            }
          }}
        />
    );
  }
  return null;
}