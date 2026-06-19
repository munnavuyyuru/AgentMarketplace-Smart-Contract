import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import ServicePage from "./pages/ServicePage";
import AgentProfilePage from "./pages/AgentProfilePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/service/:id" element={<ServicePage />} />

        <Route path="/agent/:wallet" element={<AgentProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}
