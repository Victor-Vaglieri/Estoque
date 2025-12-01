
"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext"; 
import { IconEye } from '@/app/components/icons/IconEye';
import { IconEyeSlash } from '@/app/components/icons/IconEyeSlash';
import { loginUser } from "@/lib/authService";

export default function LoginPage() {
  const { login: authLogin } = useAuth(); 

  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");

  const [erro, setErro] = useState("");
  const [verSenha, setVerSenha] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setIsLoading(true);

    try {
      
      const token = await loginUser(login, senha);

      authLogin(token);

    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro desconhecido ao tentar logar.");
      
    } finally {
      setIsLoading(false);
    }
  }

  
  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h1 className="login-title">Acesso ao Sistema</h1>
        <input
          type="text"
          placeholder="Login"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          className="login-input"
          required
        />
        <div className="password-container">
          <input
            type={verSenha ? "text" : "password"}
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="login-input"
            required
          />
          <button type="button" onClick={() => setVerSenha(!verSenha)} className="toggle-password-button" aria-label={verSenha ? "Esconder senha" : "Mostrar senha"}>
            {verSenha ? <IconEyeSlash className="icon" /> : <IconEye className="icon" />}
          </button>
        </div>
        {erro && <p className="error-message">{erro}</p>}
        <section className="divider">
          <Link href="/criar_usuario" className="create-button">Criar</Link>
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </section>
      </form>
    </div>
  );
}