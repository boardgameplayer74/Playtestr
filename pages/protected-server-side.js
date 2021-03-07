import { withSSRContext } from 'aws-amplify';

function Protected({ username }) {
  return (<h1>Hello {username} from SSR route!</h1>);
}

export async function getServerSideProps({ req, res }) {
  const { Auth } = withSSRContext({ req });
  try {
    const user = await Auth.currentAuthenticatedUser();
    //console.log('user: ', user);
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

export default Protected;