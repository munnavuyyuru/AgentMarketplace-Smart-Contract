import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

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
    <div style={{ padding: 20 }}>
      <h1>Agent Marketplace</h1>

      {services.map((service) => (
        <div
          key={service.id}
          style={{
            border: "1px solid #ccc",
            padding: 16,
            marginBottom: 16,
          }}
        >
          <h3>{service.title}</h3>

          <p>{service.provider_address}</p>

          <Link to={`/service/${service.id}`}>View Service</Link>
        </div>
      ))}
    </div>
  );
}
