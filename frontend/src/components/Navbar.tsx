import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="border-b-4 border-black bg-[#f8f5ee]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-2xl font-black tracking-tight">
          AGENT MARKET
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="border-2 border-black bg-white px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            Marketplace
          </Link>

          <Link
            to="/purchases"
            className="border-2 border-black  bg-[#ff6b35] px-4 py-2 font-semibold
                      text-white  shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            Purchases
          </Link>
        </div>
      </div>
    </header>
  );
}
