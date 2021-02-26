import React, { useState } from 'react';
import { TurnModuleParams, TurnModuleState, turnModuleInterface } from '../../components/TurnModule';


export default function designer() {

  // this is my state function
  const stateOf = {
    turnModule: TurnModuleState(),
  };

  return (
    <div>
      <div>This is the designer page</div>
      {turnModuleInterface(stateOf.turnModule)}
    </div>
  );
} 