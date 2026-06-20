import { useEffect, useState } from "react";
import { api } from "../services/api";

import MainLayout from "../layouts/HomeLayout";
import ServiceCard from "../components/ServiceCard";

export default function HomePage() {
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    async function loadServices() {
      const res = await api.get("/services");
      setServices(res.data);
    }

    loadServices();
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
      </div>
    </MainLayout>
  );
}
