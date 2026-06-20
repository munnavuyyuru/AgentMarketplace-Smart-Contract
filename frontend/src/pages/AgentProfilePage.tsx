import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { api } from "../services/api";

import MainLayout from "../layouts/HomeLayout";
import ReputationCard from "../components/ReputationCard";
import ServiceCard from "../components/ServiceCard";

export default function AgentProfilePage() {
  const { wallet } = useParams();

  const [profile, setProfile] = useState<any>(null);
  const [reputation, setReputation] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const profileRes = await api.get(`/agent-profile/${wallet}`);

        setProfile(profileRes.data);

        const reputationRes = await api.get(`/reputation/${wallet}`);

        setReputation(reputationRes.data);
      } catch (error) {
        console.error(error);
      }
    }

    loadData();
  }, [wallet]);

  if (!profile || !reputation) {
    return (
      <MainLayout>
        <div className="text-center text-2xl font-bold">
          Loading Agent Profile...
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div
        className="
          mb-8
          border-4 border-black
          bg-cyan-300
          p-8
          shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
        "
      >
        <div className="mb-2 text-sm uppercase tracking-widest">
          Agent Profile
        </div>

        <h1 className="mb-4 text-5xl font-black">Provider Dashboard</h1>

        <p className="break-all font-mono">{wallet}</p>
      </div>

      <div className="mb-10 grid gap-6 md:grid-cols-4">
        <ReputationCard
          score={reputation.reputationScore || 0}
          ratings={reputation.totalRatings || 0}
        />

        <div
          className="
            border-2 border-black
            bg-white
            p-6
            shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
          "
        >
          <div className="text-xs uppercase">Services</div>

          <div className="mt-2 text-5xl font-black">
            {profile.totalServices}
          </div>
        </div>

        <div
          className="
            border-2 border-black
            bg-white
            p-6
            shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
          "
        >
          <div className="text-xs uppercase">Payments</div>

          <div className="mt-2 text-5xl font-black">
            {profile.totalPayments}
          </div>
        </div>

        <div
          className="
            border-2 border-black
            bg-white
            p-6
            shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
          "
        >
          <div className="text-xs uppercase">Revenue</div>

          <div className="mt-2 text-5xl font-black">{profile.totalRevenue}</div>
        </div>
      </div>

      <h2 className="mb-6 text-3xl font-black">Published Services</h2>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {profile.services?.map((service: any) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </MainLayout>
  );
}
