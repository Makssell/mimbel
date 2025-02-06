// pages/index.js
import Link from 'next/link';

const Home = () => {
  return (
    <div>
      <h1>Main Page</h1>
      <ul>
        <li>
          <Link href="/site1">Site 1</Link>
        </li>
        <li>
          <Link href="/site2">Site 2</Link>
        </li>
        <li>
          <Link href="/site3">Site 3</Link>
        </li>
      </ul>
    </div>
  );
};

export default Home;
