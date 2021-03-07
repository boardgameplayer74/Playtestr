import Amplify, { Auth } from 'aws-amplify';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import config from '../aws-exports';
import Link from 'next/link';
import '../styles/globals.css';

Amplify.configure({ ...config, ssr:true });

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  useEffect(() => {
    // Access the user session on the client
    Auth.currentAuthenticatedUser()
      .then(user => { setUser(user); })
      .catch(err => setUser(null));
  }, []);

  return (
    <div>
      <nav className={'navbar'}>
        <Link href="/"><span className={'navlink'}>Home</span></Link>
        <Link href="/profile"><span className={'navlink'}>Profile</span></Link>
        <Link href="/designer"><span className={'navlink'}>Designer</span></Link>
        {user && <button
          className={'signOut'}
          onClick={()=>{
            Auth.signOut();
            router.push('/');
          }}
        >Sign Out {user.username}</button>}
      </nav>
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
