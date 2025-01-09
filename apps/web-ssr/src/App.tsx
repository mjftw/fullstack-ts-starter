import "./App.css";
import { Link, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Users from "./pages/Users";
import Map from "./pages/Map";

export default function App() {
  return (
    <div className="app-container">
      <nav>
        <Link to="/">Home</Link>
        <Link to="/users">Users</Link>
        <Link to="/map">Map</Link>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/users" element={<Users />} />
          <Route path="/map" element={<Map />} />
        </Routes>
      </main>
    </div>
  );
}
