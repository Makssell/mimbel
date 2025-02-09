import Link from 'next/link';
import styles from '../styles/index.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <h1>...</h1>
      <div className={styles.linksContainer}>
        <Link href="/site1" className={styles.link}>1</Link>
        <Link href="/site2" className={styles.link}>2</Link>
        <Link href="/site3" className={styles.link}>3</Link>
      </div>
    </div>
  );
}
