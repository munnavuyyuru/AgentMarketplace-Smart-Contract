import MainLayout from "../layouts/HomeLayout";

export default function PurchasesPage() {
  return (
    <MainLayout>
      <div
        className="
        border-4 border-black
        bg-lime-300
        p-8
        shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
      "
      >
        <h1 className="text-5xl font-black">Purchases</h1>

        <p className="mt-4">x402 purchase history will be shown here.</p>
      </div>
    </MainLayout>
  );
}
