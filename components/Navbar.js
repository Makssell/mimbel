import { useState } from "react";
import Link from "next/link";
import styles from "../styles/Navbar.module.css";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false); // State to toggle the menu visibility

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.hamburger} onClick={toggleMenu}>
        <span className={styles.bar}></span>
        <span className={styles.bar}></span>
        <span className={styles.bar}></span>
      </div>
      <ul className={`${styles.menu} ${menuOpen ? styles.open : ""}`}>
        <li><Link href="/">Home</Link></li>
        <li><Link href="/site1">Flaguesser</Link></li>
        <li><Link href="/site2">Flags</Link></li>
        <li><Link href="/site3">Monkeyroller</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
