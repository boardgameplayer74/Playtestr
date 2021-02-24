import Head from 'next/head';
import IMage from 'next/image';
import splash from '../styles/splash.module.css';

/**
 * simple splash page!
 */
export default function Home() {
  return (
    <div>
      <div className={splash.blurb}>
        <div>Coming Soon ...</div>
        <div><span className={splash.playtestr}>Playtestr</span>; an automated playtesting service to take your boardgame development to the next level.</div>
      </div>
      <img className={splash.bgimage} src='/images/bgcomponents.jpg'/>
    </div>
  );
}