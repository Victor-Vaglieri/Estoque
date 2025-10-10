// app/auth/criar_usuario/page.tsx

"use client";

import { IconEye } from '@/app/components/icons/IconEye';
import { IconEyeSlash } from '@/app/components/icons/IconEyeSlash';
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateUserPage() {
  const router = useRouter();

  // Novos estados para os campos do formulário
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [verSenha, setVerSenha] = useState(false);
  const [verConfirmacaoSenha, setVerConfirmacaoSenha] = useState(false);

  // Estados para feedback ao usuário
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(""); // Limpa erros anteriores
    setSucesso(""); // Limpa sucessos anteriores

    // 1. Validação de senha
    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return; // Interrompe a execução
    }

    // 2. Chama sua API para criar o usuário (ajuste o endpoint se necessário)
    const res = await fetch("http://localhost:3001/cadastrar_usuario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // 3. Envia o payload correto para o backend
      body: JSON.stringify({ login, senha }),
    });

    if (res.ok) {
      setSucesso("Usuário lnaçado com sucesso! Você poderá fazer o login quando o gestor confirmar.");
      // Opcional: redirecionar para o login após alguns segundos
      setTimeout(() => router.push('/'), 2000);
    } else {
      // Tenta pegar uma mensagem de erro específica do backend
      const errorData = await res.json();
      setErro(errorData.message || "Erro ao criar usuário. O login pode já existir.");
    }
  }

  return (
    <div className="login-container">
      <form
        onSubmit={handleSubmit}
        className="login-form"
      >
        <h1 className="login-title">Criar Nova Conta</h1>

        <input
          type="text"
          placeholder="Login de Acesso"
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
          /><button type="button" onClick={() => setVerSenha(!verSenha)} className="toggle-password-button" aria-label={verSenha ? "Esconder senha" : "Mostrar senha"}>{verSenha ? <IconEyeSlash className="icon" /> : <IconEye className="icon" />}</button></div>

        <div className="password-container">
          <input
            type={verConfirmacaoSenha ? "text" : "password"}
            placeholder="Confirme a Senha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            className="login-input"
            required
          />
          <button type="button" onClick={() => setVerConfirmacaoSenha(!verConfirmacaoSenha)} className="toggle-password-button" aria-label={verConfirmacaoSenha ? "Esconder senha" : "Mostrar senha"}>{verConfirmacaoSenha ? <IconEyeSlash className="icon" /> : <IconEye className="icon" />}</button></div>

        {/* Mensagens de feedback */}
        {erro && <p className="error-message">{erro}</p>}
        {sucesso && <p className="success-message">{sucesso}</p>} {/* Crie uma classe .success-message no seu CSS */}

        {/* 4. Ações do formulário atualizadas */}
        <section className="divider">
          <Link href="/" className="return-button">Voltar ao Login</Link>
          <button type="submit" className="register-button">Enviar cadastro</button>
        </section>
      </form>
    </div>
  );
}