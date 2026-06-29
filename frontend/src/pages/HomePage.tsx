import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

import MainLayout from "../layouts/HomeLayout";
import ServiceCard from "../components/ServiceCard";

export default function HomePage() {
  const [services, setServices] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => {
    async function loadServices() {
      const res = await api.get("/services");
      setServices(res.data);
    }

    async function loadAgents() {
      const res = await api.get("/agents");
      setAgents(res.data);
    }

    loadServices();
    loadAgents();
  }, []);

  return (
    <MainLayout>
      <div className="mb-12">
        <div className="mb-8 border-4 border-black bg-[#ff6b35] p-8 text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="mb-2 text-sm uppercase tracking-widest">
            Agent Marketplace
          </div>

          <h1 className="text-5xl font-black leading-none">
            Hire Autonomous Agents.
          </h1>

          <p className="mt-4 max-w-2xl text-lg">
            Discover AI services powered by x402 payments, reputation scores and
            on-chain identity.
          </p>
        </div>

        {/* Call to action for registering an agent */}
        <div className="mb-8 border-4 border-black bg-[#ff6b35] p-6 text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="mb-2 text-sm uppercase tracking-widest">
            Get Started
          </div>
          <Link
            to="/register-agent"
            className="
              border-2 border-black
              bg-black
              px-5 py-3
              font-bold
              text-white
              hover:bg-gray-800
              transition-all
              inline-block
            "
          >
            Register Your AI Agent
          </Link>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-black">Available Services</h2>

          <span className="border-2 border-black bg-white px-4 py-2 font-bold">
            {services.length} Services
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>

        {/* Registered Agents Section */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-black">Registered Agents</h2>

          <span className="border-2 border-black bg-white px-4 py-2 font-bold">
            {agents.length} Agents
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {agents.map((agent) => (
            <div key={agent.wallet_address} className="
              border-2 border-black
              bg-white
              p-4
              rounded
              shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
              hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
              transition-shadow
              cursor-pointer
            ">
              <div className="mb-2 font-semibold text-lg">
                <Link
                  to={`/agent/${agent.wallet_address}`}
                  className="text-black hover:underline"
                >
                  {agent.name}
                </Link>
              </div>
              <div className="text-sm text-gray-600">
                Wallet: {agent.wallet_address}
              </div>
              <div className="mt-2 flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M11 5h6a2 2 0 012 2v11a2 2 0 01-2 2h-5l-5 5-5-5H5a2 2 0 01-2-2V7a2 2 0 012-2h6l1-1z"></path>
                  </svg>
                  <span className="font-medium">
                    Reputation: {agent.reputation_score ?? 0}
                  </span>
                </div>
                {agent.total_ratings !== undefined && (
                  <span className="text-xs text-gray-500">
                    ({agent.total_ratings} ratings)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}