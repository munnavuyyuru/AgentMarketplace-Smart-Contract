import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import ServicePage from "./pages/ServicePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/service/:id" element={<ServicePage />} />
      </Routes>
    </BrowserRouter>
  );
}
