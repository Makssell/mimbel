// components/Navbar.js
import Link from 'next/link';

const Navbar = () => (
  <nav>
    <ul>
      <li><Link href="/">Home</Link></li>
      <li><Link href="/site1">Site 1</Link></li>
      <li><Link href="/site2">Site 2</Link></li>
      <li><Link href="/site3">Site 3</Link></li>
    </ul>
  </nav>
);

export default Navbar;
