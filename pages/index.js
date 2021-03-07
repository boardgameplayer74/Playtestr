//import Head from 'next/head';
//import Image from 'next/image';
import splash from '../styles/splash.module.css';

/**
 * simple splash page!
 */
export default function Home() {
  return (
    <div>
      <div className={splash.blurb}>
        <div><span className={splash.playtestr}>Playtestr</span>; an automated playtesting service to take your boardgame development to the next level.</div>
        <div>Coming Soon ...</div>
      </div>
      <img className={splash.bgimage} src='/images/bgcomponents.jpg'/>
    </div>
  );
}