import React  from 'react';
import { TurnModuleState, turnModuleInterface } from '../../components/TurnModule';


export default function designer() {

  // this is my state function
  const stateOf = {
    // this snaps the state of the Turn Module Interface into the state object
    turnModule: TurnModuleState(),
  };

  return (
    <div>
      <div>This is the designer page</div>
      {turnModuleInterface(stateOf.turnModule)}
    </div>
  );
} 