"use client";

// --- CORREÇÃO: Caminhos relativos para os ícones ---
import { IconEye } from '@/app/components/icons/IconEye';
import { IconEyeSlash } from '@/app/components/icons/IconEyeSlash';
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateUserPage() {
    const router = useRouter();

    // --- ESTADOS ATUALIZADOS ---
    const [nome, setNome] = useState(""); 
    const [login, setLogin] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    // --- REMOVIDO: Estado do responsavelId ---
    // const [responsavelId, setResponsavelId] = useState(""); 

    const [verSenha, setVerSenha] = useState(false);
    const [verConfirmacaoSenha, setVerConfirmacaoSenha] = useState(false);

    // Estados para feedback ao usuário
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");


    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErro(""); 
        setSucesso(""); 

        // 1. Validação de senha
        if (senha !== confirmarSenha) {
            setErro("As senhas não coincidem.");
            return; 
        }

        // --- REMOVIDO: Validação do responsavelId ---

        // 2. Chama sua API
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cadastrar_usuario`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // 3. Envia o payload (sem responsavelId)
            body: JSON.stringify({ 
                nome: nome,
                login: login, 
                senha: senha
                // responsavelId: respIdNum // REMOVIDO
            }),
        });

        if (res.ok) {
            // Mensagem de sucesso atualizada
            setSucesso("Solicitação enviada com sucesso! Você poderá fazer o login quando seu gestor aprovar.");
            // Limpa o formulário
            setNome("");
            setLogin("");
            setSenha("");
            setConfirmarSenha("");
            // setResponsavelId(""); // REMOVIDO
            // Opcional: redirecionar para o login após alguns segundos
            setTimeout(() => router.push('/'), 3000); 
        } else {
            const errorData = await res.json();
            setErro(errorData.message || "Erro ao enviar solicitação. O login pode já existir.");
        }
    }

    return (
        <div className="login-container">
            <form
                onSubmit={handleSubmit}
                className="login-form"
            >
                <h1 className="login-title">Solicitar Nova Conta</h1>

                {/* --- Campo Nome --- */}
                 <input
                    type="text"
                    placeholder="Nome Completo"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="login-input"
                    required
                />

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
                    /><button type="button" onClick={() => setVerSenha(!verSenha)} className="toggle-password-button" aria-label={verSenha ? "Esconder senha" : "Mostrar senha"}>{verSenha ? <IconEyeSlash className="icon" /> : <IconEye className="icon" />}</button>
                </div>

                <div className="password-container">
                    <input
                        type={verConfirmacaoSenha ? "text" : "password"}
                        placeholder="Confirme a Senha"
                        value={confirmarSenha}
                        onChange={(e) => setConfirmarSenha(e.target.value)}
                        className="login-input"
                        required
                    />
                    <button type="button" onClick={() => setVerConfirmacaoSenha(!verConfirmacaoSenha)} className="toggle-password-button" aria-label={verConfirmacaoSenha ? "Esconder senha" : "Mostrar senha"}>{verConfirmacaoSenha ? <IconEyeSlash className="icon" /> : <IconEye className="icon" />}</button>
                </div>

                {/* Mensagens de feedback */}
                {erro && <p className="error-message">{erro}</p>}
                {sucesso && <p className="success-message">{sucesso}</p>} 

                <section className="divider">
                    <Link href="/" className="return-button">Voltar ao Login</Link>
                    <button type="submit" className="register-button">Enviar Solicitação</button>
                </section>
            </form>
        </div>
    );
}

