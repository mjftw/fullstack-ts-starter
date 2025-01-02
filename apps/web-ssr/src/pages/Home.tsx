import { Suspense, lazy } from "react";
import reactLogo from "../assets/react.svg";
import { trpc } from "../utils/trpc";

const Card = lazy(() => import("../Card"));

export default function Home() {
  const helloQuery = trpc.hello.hello.useQuery({ name: "from SSR" });

  return (
    <div>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>

      <Suspense fallback={<p>Loading card component...</p>}>
        <Card />
      </Suspense>

      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>

      <div className="trpc-demo">
        <h3>tRPC Demo</h3>
        <p className="demo-description">
          This app uses tRPC for type-safe client-server communication.
        </p>
        {helloQuery.isLoading ? (
          <span className="loading">Loading...</span>
        ) : (
          <span className="result">{helloQuery.data?.greeting}</span>
        )}
        {helloQuery.error && (
          <span className="error">{helloQuery.error.message}</span>
        )}
      </div>
    </div>
  );
}
