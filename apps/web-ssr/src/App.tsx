import "./App.css";
import { Suspense, lazy } from "react";
import { Link, Route, Routes } from "react-router-dom";

const Home = lazy(() => import("./pages/Home"));
const Users = lazy(() => import("./pages/Users"));

export default function App() {
  return (
    <div className="app-container">
      <nav>
        <Link to="/">Home</Link>
        <Link to="/users">Users</Link>
      </nav>

      <main>
        <Routes>
          <Route
            path="/"
            element={
              <Suspense fallback={<p>Loading home page...</p>}>
                <Home />
              </Suspense>
            }
          />
          <Route
            path="/users"
            element={
              <Suspense fallback={<p>Loading users page...</p>}>
                <Users />
              </Suspense>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
