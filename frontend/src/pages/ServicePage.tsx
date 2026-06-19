import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../services/api";

export default function ServicePage() {
  const { id } = useParams();

  const [service, setService] = useState<any>(null);
  const [reputation, setReputation] = useState<any>(null);
  const [ratings, setRatings] = useState<any[]>([]);
  const [score, setScore] = useState(5);

  const [comment, setComment] = useState("");

  const [reviewer, setReviewer] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const serviceRes = await api.get(`/services/${id}`);

        setService(serviceRes.data);

        const wallet = serviceRes.data.provider_address;

        const reputationRes = await api.get(`/reputation/${wallet}`);

        setReputation(reputationRes.data);

        const ratingsRes = await api.get(`/ratings/${id}`);

        setRatings(ratingsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  async function purchaseService() {
    try {
      const res = await api.get(`/paid/service/${id}`);

      console.log("Paid response:", res.data);

      alert("Service Unlocked");
    } catch (error: any) {
      console.log("402 response:", error.response);

      alert("x402 payment challenge received");
    }
  }

  async function submitReview() {
    try {
      await api.post("/ratings", {
        service_id: Number(id),
        reviewer,
        score,
        comment,
      });

      const ratingsRes = await api.get(`/ratings/${id}`);

      setRatings(ratingsRes.data);

      const reputationRes = await api.get(
        `/reputation/${service.provider_address}`,
      );

      setReputation(reputationRes.data);

      setComment("");

      alert("Review submitted");
    } catch (err) {
      console.error(err);

      alert("Failed to submit review");
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!service) {
    return <div>Service not found</div>;
  }

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      <h1>{service.title}</h1>

      <p>
        <strong>Provider:</strong>
        <a href={`/agent/${service.provider_address}`}>
          {service.provider_address}
        </a>
      </p>

      <p>
        <strong>Description URI:</strong> {service.description_uri}
      </p>

      <p>
        <strong>Price (Wei):</strong> {service.price_wei}
      </p>

      {reputation && (
        <div
          style={{
            border: "1px solid #ccc",
            padding: "16px",
            marginTop: "20px",
            marginBottom: "20px",
            borderRadius: "8px",
          }}
        >
          <h2>Agent Reputation</h2>

          <p>⭐ Average Rating: {reputation.avgRating}</p>

          <p>💬 Total Reviews: {reputation.totalRatings}</p>

          <p>🛡 Reputation Score: {reputation.reputationScore}</p>
        </div>
      )}

      <button onClick={purchaseService}>Purchase Service</button>

      <hr
        style={{
          marginTop: "30px",
          marginBottom: "30px",
        }}
      />

      <hr
        style={{
          marginTop: "30px",
          marginBottom: "30px",
        }}
      />

      <h2>Leave Review</h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          maxWidth: "500px",
        }}
      >
        <input
          placeholder="Reviewer Wallet"
          value={reviewer}
          onChange={(e) => setReviewer(e.target.value)}
        />

        <select
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
        >
          <option value={5}>5</option>
          <option value={4}>4</option>
          <option value={3}>3</option>
          <option value={2}>2</option>
          <option value={1}>1</option>
        </select>

        <textarea
          placeholder="Write review"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <button onClick={submitReview}>Submit Review</button>
      </div>

      <h2>Reviews</h2>

      {ratings.length === 0 ? (
        <p>No reviews yet</p>
      ) : (
        ratings.map((rating) => (
          <div
            key={rating.id}
            style={{
              border: "1px solid #ddd",
              padding: "12px",
              marginBottom: "10px",
              borderRadius: "6px",
            }}
          >
            <p>
              <strong>{rating.reviewer}</strong>
            </p>

            <p>⭐ {rating.score} / 5</p>

            <p>{rating.comment}</p>
          </div>
        ))
      )}
    </div>
  );
}
