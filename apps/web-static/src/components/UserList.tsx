import React from "react";
import { trpc } from "../utils/trpc";

export const UserList: React.FC = () => {
  const users = trpc.users.findAll.useQuery();

  if (users.isLoading) {
    return <p>tRPC Loading...</p>;
  }

  if (users.error) {
    return <p>tRPC Error: {users.error.message}</p>;
  }

  return (
    <div className="user-list">
      <h2>Users</h2>
      <table className="user-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {users.data?.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
