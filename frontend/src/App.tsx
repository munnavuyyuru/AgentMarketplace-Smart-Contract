import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import ServicePage from "./pages/ServicePage";
import AgentProfilePage from "./pages/AgentProfilePage";
import PurchasesPage from "./pages/PurchasesPage";
import DeliverablePage from "./pages/DeliverablePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/service/:id" element={<ServicePage />} />

        <Route path="/agent/:wallet" element={<AgentProfilePage />} />

        <Route path="/deliverable/:id" element={<DeliverablePage />} />

        <Route path="/purchases" element={<PurchasesPage />} />
      </Routes>
    </BrowserRouter>
  );
}
