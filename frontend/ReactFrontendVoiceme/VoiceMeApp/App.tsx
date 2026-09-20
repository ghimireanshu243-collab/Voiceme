import React from "react";
import Homepage from "./src/app/Homepage";

export default function App() {
    return <Homepage />;
}
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import LoginPage from './LoginPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Define the URL paths for your pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}