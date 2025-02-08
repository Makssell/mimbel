import Link from 'next/link';
import styles from '../styles/index.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <h1>Main Page</h1>
      <div className={styles.linksContainer}>
        <Link href="/site1" className={styles.link}>Site 1</Link>
        <Link href="/site2" className={styles.link}>Site 2</Link>
        <Link href="/site3" className={styles.link}>Site 3</Link>
        <Link href="/addFlag" className={styles.link}>addFlag</Link>
      </div>
    </div>
  );
}
