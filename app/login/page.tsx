"use client";

import { isAuthenticated, login, protectRoute } from "@/common/utils/Auth";
import { useState } from "react";

export default function LoginPage(){
  protectRoute(false, false, "/products");

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();

      let success = await login(username, password);
      if (success) {
        window.location.href = '/products';
      } else {
        alert('Login failed. Please check your credentials.');
      }
  }

  // redirect to products if already logged in
  if (typeof window !== 'undefined' && isAuthenticated()) {
    window.location.href = '/products';
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 min-h-screen w-full">
      <h1 className="text-2xl font-bold mb-6">Login</h1>
      <p className="mb-4">
        To get started, please enter your credentials.
      </p>
      {/* Login form can be added here */}
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          className="border rounded p-2"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="border rounded p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button 
          type="submit"
          className="bg-blue-600 text-white rounded p-2 hover:bg-blue-700"
        >
          Login
        </button>
      </form>
      

    </div>
  );
}