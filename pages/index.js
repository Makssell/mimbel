import Link from 'next/link';
import styles from '../styles/index.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.linksContainer}>
        <Link href="/site1" className={styles.link}>1</Link>
        <span className={styles.inactiveLink}>2</span>
        <span className={styles.inactiveLink}>3</span>
        <Link href="/admin" className={styles.adminLink}>Admin</Link>
      </div>
    </div>
  );
}
