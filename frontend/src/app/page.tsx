"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Chama sua API do backend NestJS
    const res = await fetch("http://localhost:3001/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, senha }),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("token", data.token); // salva o JWT
      router.push("/dashboard");
    } else {
      setErro("Login ou senha inválidos.");
    }
  }

  return (
    <div className="login-container">
      <form
        onSubmit={handleSubmit}
        className="login-form"
      >
        <h1 className="login-title">Acesso ao Sistema</h1>

        <input
          type="text"
          placeholder="Login"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          className="login-input"
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="login-input"
        />

        {erro && <p className="error-message">{erro}</p>}

        <section className="divider">
        <Link href="/criar_usuario" className="create-button">Criar</Link>
        <button type="submit" className="login-button">Entrar</button>
        </section>
      </form>
    </div>
  );
}
