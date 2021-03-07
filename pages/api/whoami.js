import Amplify, { withSSRContext } from 'aws-amplify';
import config from "../../aws-exports.js";

// Amplify SSR configuration needs to be enabled within each API route
Amplify.configure({ ...config, ssr: true });

export default async (req, res) => {
  const { Auth } = withSSRContext({ req });
  try {
    const user = await Auth.currentAuthenticatedUser();
    res.json({ user: user.username });
  } catch (err) {
    res.statusCode = 200;
    res.json({ user: null });
  }
};