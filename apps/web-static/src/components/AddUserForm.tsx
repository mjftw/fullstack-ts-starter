import React, { useState } from "react";
import { trpc } from "../utils/trpc";

export const AddUserForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const createUser = trpc.users.create.useMutation();

  const handleAddUser = async () => {
    try {
      await createUser.mutateAsync({ email, name });
      alert("User added successfully!");
      setEmail("");
      setName("");
    } catch (error) {
      alert(`Error adding user: ${error}`);
    }
  };

  return (
    <div className="add-user-form">
      <h2>Add User</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="input"
      />
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="input"
      />
      <button onClick={handleAddUser} className="button">
        Add User
      </button>
    </div>
  );
};
