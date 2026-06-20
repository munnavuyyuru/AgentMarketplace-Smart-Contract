import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../services/api";

import MainLayout from "../layouts/HomeLayout";
import ReviewCard from "../components/ReviewCard";
import ReputationCard from "../components/ReputationCard";

export default function ServicePage() {
  const { id } = useParams();

  const [service, setService] = useState<any>(null);
  const [reputation, setReputation] = useState<any>(null);
  const [ratings, setRatings] = useState<any[]>([]);

  const [reviewer, setReviewer] = useState("");
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState("");

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

  function purchaseService() {
    window.location.href = `http://localhost:5000/paid/service/${id}`;
  }

  async function submitReview() {
    if (!reviewer.trim()) {
      alert("Please enter wallet address");
      return;
    }

    if (!comment.trim()) {
      alert("Please enter review");
      return;
    }

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

      setReviewer("");
      setComment("");
      setScore(5);

      alert("Review submitted");
    } catch (err) {
      console.error(err);
      alert("Failed to submit review");
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center text-2xl font-bold">Loading Service...</div>
      </MainLayout>
    );
  }

  if (!service) {
    return (
      <MainLayout>
        <div className="text-center text-2xl font-bold">Service Not Found</div>
      </MainLayout>
    );
  }

  const shortWallet =
    service.provider_address?.length > 10
      ? `${service.provider_address.slice(
          0,
          6,
        )}...${service.provider_address.slice(-4)}`
      : service.provider_address;

  return (
    <MainLayout>
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div>
          <div
            className="
              mb-8
              border-4 border-black
              bg-[#ff6b35]
              p-8
              text-white
              shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
            "
          >
            <div className="mb-2 text-sm uppercase tracking-widest">
              AI Service
            </div>

            <h1 className="text-5xl font-black">{service.title}</h1>

            <Link
              to={`/agent/${service.provider_address}`}
              className="
                mt-4
                block
                font-mono
                underline
              "
            >
              Provider: {shortWallet}
            </Link>
          </div>

          <div
            className="
              mb-8
              border-2 border-black
              bg-white
              p-6
              shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
            "
          >
            <h2 className="mb-4 text-2xl font-black">Description</h2>

            <p className="break-all">{service.description_uri}</p>
          </div>

          <div className="mb-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-3xl font-black">Reviews</h2>

              <span
                className="
                  border-2 border-black
                  bg-white
                  px-4 py-2
                  font-bold
                "
              >
                {ratings.length} Reviews
              </span>
            </div>

            <div className="space-y-4">
              {ratings.length > 0 ? (
                ratings.map((review: any, index: number) => (
                  <ReviewCard key={review.id ?? index} review={review} />
                ))
              ) : (
                <div className="border-2 border-black bg-white p-6">
                  No Reviews Yet
                </div>
              )}
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
            <h2 className="mb-2 text-2xl font-black">Leave a Review</h2>

            <p className="mb-6 text-sm text-gray-600">
              Enter wallet address, rating and review.
            </p>

            <input
              type="text"
              placeholder="Wallet Address"
              value={reviewer}
              onChange={(e) => setReviewer(e.target.value)}
              className="
                mb-4
                w-full
                border-2 border-black
                p-3
                font-mono
              "
            />

            <select
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="
                mb-4
                w-full
                border-2 border-black
                p-3
              "
            >
              <option value={5}>⭐⭐⭐⭐⭐</option>
              <option value={4}>⭐⭐⭐⭐</option>
              <option value={3}>⭐⭐⭐</option>
              <option value={2}>⭐⭐</option>
              <option value={1}>⭐</option>
            </select>

            <textarea
              rows={4}
              placeholder="Write review..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="
                mb-4
                w-full
                border-2 border-black
                p-3
              "
            />

            <button
              onClick={submitReview}
              disabled={!reviewer.trim() || !comment.trim()}
              className="
                border-2 border-black
                bg-black
                px-5 py-3
                font-bold
                text-white
                disabled:opacity-50
              "
            >
              Submit Review
            </button>
          </div>
        </div>

        <div>
          <div
            className="
              sticky top-6
              border-4 border-black
              bg-yellow-300
              p-6
              shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
            "
          >
            <div className="mb-2 text-sm uppercase tracking-widest">
              Purchase
            </div>

            <div className="mb-1 text-xs uppercase">Price</div>

            <div className="mb-4 text-4xl font-black">{service.price_wei}</div>

            <button
              onClick={purchaseService}
              className="
                w-full
                border-2 border-black
                bg-black
                px-4 py-3
                font-bold
                text-white
              "
            >
              Purchase with x402
            </button>
          </div>

          <div className="mt-6">
            <ReputationCard
              score={reputation?.reputationScore || 0}
              ratings={reputation?.totalRatings || 0}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
