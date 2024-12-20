import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { trpc } from "./utils/trpc";

function App() {
  const [count, setCount] = useState(0);
  const users = trpc.findAllUsers.useQuery();

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
        {users.isLoading ? (
          <p>tRPC Loading...</p>
        ) : (
          <p>Found users: {users.data?.map((user) => user.name).join(", ")}</p>
        )}
        {users.error && <p>tRPC Error: {users.error.message}</p>}
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
