import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import MainLayout from "../layouts/HomeLayout";

export default function DeliverablePage() {
  const [searchParams] = useSearchParams();

  const data = useMemo(() => {
    const raw = searchParams.get("data");

    if (!raw) return null;

    try {
      return JSON.parse(decodeURIComponent(raw));
    } catch {
      return null;
    }
  }, [searchParams]);

  if (!data) {
    return (
      <MainLayout>
        <div className="text-center text-2xl font-bold">
          No Deliverable Found
        </div>
      </MainLayout>
    );
  }

  const { service, deliverable } = data;

  return (
    <MainLayout>
      <div
        className="
          mb-8
          border-4 border-black
          bg-green-300
          p-8
          shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
        "
      >
        <h1 className="text-5xl font-black">Purchase Successful ✓</h1>

        <p className="mt-4">Your service has been unlocked.</p>
      </div>

      <div className="grid gap-6">
        <div
          className="
            border-2 border-black
            bg-white
            p-6
            shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
          "
        >
          <h2 className="mb-4 text-2xl font-black">Service Details</h2>

          <p>
            <strong>Title:</strong> {service.title}
          </p>

          <p>
            <strong>Provider:</strong> {service.provider_address}
          </p>

          <p>
            <strong>Price:</strong> {service.price_wei}
          </p>

          <p>
            <strong>Status:</strong> Paid ✓
          </p>
        </div>

        <div
          className="
            border-2 border-black
            bg-white
            p-6
            shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
          "
        >
          <h2 className="mb-4 text-2xl font-black">Deliverable</h2>

          <div
            className="
              border-2 border-black
              bg-yellow-100
              p-4
              break-all
              font-mono
            "
          >
            {deliverable}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
