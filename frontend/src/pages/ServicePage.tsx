import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../services/api";

export default function ServicePage() {
  const { id } = useParams();

  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadService() {
      try {
        const res = await api.get(`/services/${id}`);
        setService(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadService();
  }, [id]);

  async function purchaseService() {
    try {
      const res = await api.get(`/paid/service/${id}`);

      console.log("Paid response:", res.data);
    } catch (error: any) {
      console.log("402 response:", error.response);

      alert("x402 payment challenge received");
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!service) {
    return <div>Service not found</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>{service.title}</h1>

      <p>
        <strong>Provider:</strong> {service.provider_address}
      </p>

      <p>
        <strong>Description URI:</strong> {service.description_uri}
      </p>

      <p>
        <strong>Price (Wei):</strong> {service.price_wei}
      </p>

      <button onClick={purchaseService}>Purchase Service</button>
    </div>
  );
}
