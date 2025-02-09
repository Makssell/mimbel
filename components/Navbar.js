import Link from 'next/link';
import styles from '../styles/Navbar.module.css'; // Import the CSS module

const Navbar = () => (
  <nav className={styles.navbar}>
    <ul className={styles.navList}>
      <li className={styles.navItem}>
        <Link href="/" className={styles.navLink}>Home</Link>
      </li>
      <li className={styles.navItem}>
        <Link href="/site1" className={styles.navLink}>Site 1</Link>
      </li>
      <li className={styles.navItem}>
        <Link href="/site2" className={styles.navLink}>Site 2</Link>
      </li>
      <li className={styles.navItem}>
        <Link href="/site3" className={styles.navLink}>Site 3</Link>
      </li>
    </ul>
  </nav>
);

export default Navbar;
