// pages/index.js
import Link from 'next/link';
import styles from './index.module.css'; // Import a CSS module for styling


const Home = () => {
  return (
    <div className={styles.container}>
      <h1>Main Page</h1>
      <div className={styles.linksContainer}>
        <Link href="/site1">
          <a className={styles.link}>Site 1</a>
        </Link>
        <Link href="/site2">
          <a className={styles.link}>Site 2</a>
        </Link>
        <Link href="/site3">
          <a className={styles.link}>Site 3</a>
        </Link>
      </div>
    </div>
  );
};

export default Home;
