"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export function UsersList() {
    const [users] = api.users.findAll.useSuspenseQuery();

    const utils = api.useUtils();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const createUser = api.users.create.useMutation({
        onSuccess: async () => {
            await utils.users.invalidate();
            setName("");
            setEmail("");
        },
    });

    return (
        <div className="w-full max-w-xl">
            <div className="mb-8">
                {users && users.length > 0 ? (
                    <div>
                        <h2 className="mb-4 text-2xl font-bold">Users</h2>
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th className="text-left">Name</th>
                                    <th className="text-left">Email</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td className="py-2">{user.name}</td>
                                        <td className="py-2">{user.email}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p>No users found.</p>
                )}
            </div>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    createUser.mutate({ name, email });
                }}
                className="flex flex-col gap-2"
            >
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-full px-4 py-2 text-black"
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-full px-4 py-2 text-black"
                />
                <button
                    type="submit"
                    className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
                    disabled={createUser.isLoading}
                >
                    {createUser.isLoading ? "Adding..." : "Add User"}
                </button>
            </form>
        </div>
    );
} 