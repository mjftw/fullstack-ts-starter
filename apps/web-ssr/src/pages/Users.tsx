import { Suspense } from "react";
import { trpc } from "../utils/trpc";

const UserList = () => {
  const users = trpc.users.findAll.useQuery();

  if (users.isLoading) {
    return <p>Loading users...</p>;
  }

  if (users.error) {
    return <p>Error: {users.error.message}</p>;
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

const AddUserForm = () => {
  const utils = trpc.useContext();
  const createUser = trpc.users.create.useMutation({
    onSuccess: () => {
      utils.users.findAll.invalidate();
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      await createUser.mutateAsync({
        email: formData.get("email") as string,
        name: formData.get("name") as string,
      });
    } catch (error) {
      alert(`Error adding user: ${error}`);
    }
  };

  return (
    <div className="add-user-form">
      <h2>Add User</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="input"
          required
        />
        <input
          type="text"
          name="name"
          placeholder="Name"
          className="input"
          required
        />
        <button
          type="submit"
          className="button"
          disabled={createUser.isLoading}
        >
          {createUser.isLoading ? "Adding..." : "Add User"}
        </button>
      </form>
    </div>
  );
};

export default function Users() {
  return (
    <div className="users-page">
      <h1>Users Management</h1>
      <Suspense fallback={<p>Loading user list...</p>}>
        <UserList />
      </Suspense>
      <AddUserForm />
    </div>
  );
}
