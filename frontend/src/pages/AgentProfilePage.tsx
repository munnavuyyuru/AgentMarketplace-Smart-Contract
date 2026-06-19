import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../services/api";

export default function AgentProfilePage() {
  const { wallet } = useParams();

  const [profile, setProfile] = useState<any>(null);

  const [reputation, setReputation] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const profileRes = await api.get(`/agent-profile/${wallet}`);

      setProfile(profileRes.data);

      const reputationRes = await api.get(`/reputation/${wallet}`);

      setReputation(reputationRes.data);
    }

    loadData();
  }, [wallet]);

  if (!profile || !reputation) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Agent Profile</h1>

      <p>Wallet: {wallet}</p>

      <h2>Reputation</h2>

      <p>⭐ {reputation.avgRating}</p>

      <p>🛡 {reputation.reputationScore}</p>

      <h2>Marketplace Stats</h2>

      <p>
        Services:
        {profile.totalServices}
      </p>

      <p>
        Payments:
        {profile.totalPayments}
      </p>

      <p>
        Revenue:
        {profile.totalRevenue}
      </p>

      <h2>Services</h2>

      {profile.services.map((service: any) => (
        <div key={service.id}>{service.title}</div>
      ))}
    </div>
  );
}
