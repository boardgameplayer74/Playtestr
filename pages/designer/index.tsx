import React from 'react';
import { Tab, Tabs, TabList, TabPanel, resetIdCounter } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { TurnModuleState, turnModuleInterface } from '../../components/TurnModule';
import { ActionModuleState, actionModuleInterface } from '../../components/ActionModule';
import { RuleModuleState, ruleModuleInterface } from '../../components/RuleModule';

/**
 * This is a server-side protected page.  User are not allowed to access it unless they are a member of at least one group
 */
import { withSSRContext } from 'aws-amplify';
export async function getServerSideProps({ req, res }) {
  const { Auth } = withSSRContext({ req });
  try {
    const user = await Auth.currentAuthenticatedUser();
    const groups = user.signInUserSession.accessToken.payload['cognito:groups'];
    //console.log('user: ', user);
    //console.log("GROUPS: ",groups);
    if (groups==undefined) {
      res.writeHead(302, { Location: '/notAuthorized'});
      res.end();
    }
    return {
      props: {
        authenticated: true, 
        username: user.username
      }
    };
  } catch (err) {
    res.writeHead(302, { Location: '/profile'});
    res.end();
  }
  return {props:{}};
}


// this draws our designer page
export default function designer() {

  //resetIdCounter();

  // this is my state function
  const stateOf = {
    // this snaps the state of the Turn Module Interface into the state object
    turnModule: TurnModuleState(),
    actionModule: ActionModuleState(),
    ruleModule: RuleModuleState(),
  };

  return (
    <div>
      <Tabs>
        <TabList>
          <Tab>Turn Module</Tab>
          <Tab>Action Module</Tab>
          <Tab>Rule Module</Tab>
        </TabList>
        <TabPanel>{turnModuleInterface(stateOf.turnModule)}</TabPanel>
        <TabPanel>{actionModuleInterface(stateOf.actionModule)}</TabPanel>
        <TabPanel>{ruleModuleInterface(stateOf.ruleModule)}</TabPanel>
      </Tabs>
    </div>
  );
} 