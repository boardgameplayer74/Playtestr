import splash from '../styles/splash.module.css';

/**
 * simple splash page!
 */
export default function NotAuthorized() {
  return (
    <div>
      <div className={splash.blurb}>
        <div>You are <b>not authorized</b> to view this <span className={splash.playtestr}>Playtestr</span> page.</div>
      </div>
      <img className={splash.bgimage} src='/images/bgcomponents.jpg'/>
    </div>
  );
}