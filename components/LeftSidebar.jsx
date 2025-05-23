import Link from 'next/link';

const LeftSidebar = () => {
  return (
    <div className="h-screen w-64 bg-gray-800 text-gray-200 p-5">
      <h2 className="text-xl font-semibold mb-5">InnVestAI</h2>
      <nav>
        <ul>
          <li className="mb-3"><Link href="/"><a>Dashboard</a></Link></li>
          <li className="mb-3"><Link href="/deals"><a>Deals</a></Link></li>
          <li className="mb-3"><Link href="/deals/create"><a>Create Deal</a></Link></li>
          <li className="mb-3"><Link href="/analytics"><a>Analytics</a></Link></li>
          <li className="mb-3"><Link href="/admin/accounts"><a>Account</a></Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default LeftSidebar;
