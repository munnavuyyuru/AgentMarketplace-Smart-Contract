import { Link } from "react-router-dom";

type Props = {
  service: any;
};

export default function ServiceCard({ service }: Props) {
  const wallet = service.provider_address || "";

  const shortWallet =
    wallet.length > 10 ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : wallet;

  return (
    <div
      className="
        border-2 border-black
        bg-white
        p-6
        transition-all
        hover:-translate-y-1
        shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
      "
    >
      <div className="mb-3 text-xs font-bold uppercase tracking-widest">
        AI SERVICE
      </div>

      <h3 className="mb-6 text-2xl font-black">{service.title}</h3>

      <div className="mb-6 border-t-2 border-black pt-4">
        <div className="mb-2 text-xs font-bold uppercase">Provider</div>

        <Link
          to={`/agent/${wallet}`}
          className="
            font-mono
            text-sm
            underline
            hover:text-blue-600
          "
        >
          {shortWallet}
        </Link>
      </div>

      <div className="mb-6 border-t-2 border-black pt-4">
        <div className="mb-2 text-xs font-bold uppercase">Price</div>

        <div className="text-lg font-black">{service.price_wei}</div>
      </div>

      <Link
        to={`/service/${service.id}`}
        className="
          inline-block
          border-2
          border-black
          bg-yellow-300
          px-4
          py-2
          font-bold
          transition-all
          hover:bg-yellow-400
        "
      >
        View Service →
      </Link>
    </div>
  );
}
