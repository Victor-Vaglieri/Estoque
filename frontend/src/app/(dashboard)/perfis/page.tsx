"use client";

import { useState, useEffect } from 'react';
// Usando caminho relativo
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

// Importe o CSS específico para esta página
import './perfis.css';

// --- 1. Enum de Funções (deve espelhar o seu schema 'usuarios.db') ---
enum Funcao {
    CADASTRO = 'CADASTRO',
    COMPRAS = 'COMPRAS',
    RECEBIMENTO = 'RECEBIMENTO',
    FUNCIONARIO = 'FUNCIONARIO',
    EMPREGADA = 'EMPREGADA',
    GESTOR = 'GESTOR',
}

// Interface para a Solicitação de Cadastro (do cadastros.db)
interface CadastroRequest {
    id: number;
    nome: string;
    login: string;
    responsavelId: number | null; 
    createdAt: string;
    // --- NOVO CAMPO ---
    responsavelNome?: string | null; // O nome do aprovador
}

// Interface para um Utilizador existente
interface User {
    id: number;
    nome: string;
    login: string;
    role: string; // O backend já formata isto como string
}

export default function PerfisPage() {
    const router = useRouter();
    const { user } = useAuth(); 
    const currentUserId =  user?.sub;

    const [solicitacoes, setSolicitacoes] = useState<CadastroRequest[]>([]);
    const [usuarios, setUsuarios] = useState<User[]>([]);
    // Estado para solicitações confirmadas
    const [solicitacoesConfirmadas, setSolicitacoesConfirmadas] = useState<CadastroRequest[]>([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<number | null>(null); 

    const [showApproveModal, setShowApproveModal] = useState(false);
    const [solicitacaoParaAprovar, setSolicitacaoParaAprovar] = useState<CadastroRequest | null>(null);
    const [selectedFuncoes, setSelectedFuncoes] = useState<Funcao[]>([Funcao.FUNCIONARIO]); 

    const [showEditModal, setShowEditModal] = useState(false);
    const [usuarioParaEditar, setUsuarioParaEditar] = useState<User | null>(null);
    const [selectedEditFuncoes, setSelectedEditFuncoes] = useState<Funcao[]>([]);


    const clearFeedback = () => { setError(null); setSuccess(null); };

    // 1. Função para buscar TODAS as listas
    const fetchData = async () => {
        setIsLoading(true); 
        clearFeedback(); 
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            // Agora busca 3 listas
            const results = await Promise.allSettled([
                // 1. Solicitações Pendentes
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/perfis/solicitacoes`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                }),
                 // 2. Utilizadores Atuais
                 fetch(`${process.env.NEXT_PUBLIC_API_URL}/perfis/usuarios`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                }),
                // 3. Solicitações Confirmadas
                 fetch(`${process.env.NEXT_PUBLIC_API_URL}/perfis/confirmados`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                })
            ]);

            // Processa Solicitações Pendentes (índice 0)
            if (results[0].status === 'fulfilled' && results[0].value.ok) {
                const solicitacoesData: CadastroRequest[] = await results[0].value.json();
                setSolicitacoes(solicitacoesData);
            } else {
                console.error("Falha ao carregar solicitações:", results[0].status === 'rejected' ? results[0].reason : 'Resposta não OK');
                setError(prev => (prev ? `${prev} | Falha ao carregar solicitações.` : 'Falha ao carregar solicitações.'));
                setSolicitacoes([]);
            }

            // Processa Utilizadores Atuais (índice 1)
            if (results[1].status === 'fulfilled' && results[1].value.ok) {
                 const usuariosData: User[] = await results[1].value.json();
                 setUsuarios(usuariosData);
            } else {
                console.error("Falha ao carregar usuários:", results[1].status === 'rejected' ? results[1].reason : 'Resposta não OK');
                setError(prev => (prev ? `${prev} | Falha ao carregar usuários.` : 'Falha ao carregar usuários.'));
                setUsuarios([]);
            }
            
            // Processa Solicitações Confirmadas (índice 2)
            if (results[2].status === 'fulfilled' && results[2].value.ok) {
                 const confirmadasData: CadastroRequest[] = await results[2].value.json();
                 setSolicitacoesConfirmadas(confirmadasData);
            } else {
                console.error("Falha ao carregar confirmados:", results[2].status === 'rejected' ? results[2].reason : 'Resposta não OK');
                setError(prev => (prev ? `${prev} | Falha ao carregar confirmados.` : 'Falha ao carregar confirmados.'));
                setSolicitacoesConfirmadas([]);
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocorreu um erro ao carregar os dados.');
        } finally {
             setIsLoading(false);
        }
    };

    useEffect(() => {
         fetchData();
    }, [router, user]); 

    // --- FUNÇÕES DE APROVAÇÃO E REJEIÇÃO (Solicitações) ---

    const handleAprovarClick = (solicitacao: CadastroRequest) => {
        setSolicitacaoParaAprovar(solicitacao); 
        setSelectedFuncoes([Funcao.FUNCIONARIO]); 
        setShowApproveModal(true); 
        clearFeedback();
    };

    const handleConfirmAprovacao = async () => {
        if (!solicitacaoParaAprovar) return;
        if (selectedFuncoes.length === 0) {
            setError("Selecione pelo menos uma função para o novo usuário.");
            return;
        }

        setIsSubmitting(solicitacaoParaAprovar.id); 
        clearFeedback();
        const token = localStorage.getItem('token');
        if (!token) { router.push('/login'); return; }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/perfis/aprovar/${solicitacaoParaAprovar.id}`, { 
                method: 'POST', 
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ funcoes: selectedFuncoes }) 
            });

             if (!response.ok) {
                 const errData = await response.json();
                throw new Error(errData.message || 'Falha ao aprovar usuário.');
            }
            
            setSuccess('Utilizador aprovado e criado com sucesso!');
            setShowApproveModal(false); 
            await fetchData(); 

        } catch (err) {
             setError(err instanceof Error ? err.message : 'Ocorreu um erro ao aprovar.');
        } finally {
            setIsSubmitting(null); 
        }
    };
    
    const handleRejeitar = async (cadastroId: number) => {
         if (!window.confirm('Tem certeza que deseja rejeitar esta solicitação? Ela será removida permanentemente.')) return;
        
        setIsSubmitting(cadastroId); 
        clearFeedback();
        const token = localStorage.getItem('token');
        if (!token) { router.push('/login'); return; }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/perfis/rejeitar/${cadastroId}`, { 
                method: 'DELETE', 
                headers: { 'Authorization': `Bearer ${token}` },
            });

             if (!response.ok) {
                 const errData = await response.json();
                throw new Error(errData.message || 'Falha ao rejeitar usuário.');
            }
            
            setSuccess('Solicitação rejeitada com sucesso.');
            await fetchData(); 

        } catch (err) {
             setError(err instanceof Error ? err.message : 'Ocorreu um erro ao rejeitar.');
        } finally {
            setIsSubmitting(null); 
        }
    };

    const handleFuncaoChange = (funcao: Funcao) => {
        setSelectedFuncoes(prev => {
            if (prev.includes(funcao)) {
                return prev.filter(f => f !== funcao);
            } else {
                return [...prev, funcao];
            }
        });
    };

    // --- NOVAS FUNÇÕES: GERIR UTILIZADORES ATUAIS ---
    const handleEditUserClick = (user: User) => {
        if (user.id === currentUserId) {
            setError("Não pode editar as suas próprias funções.");
            return;
        }
        setUsuarioParaEditar(user);
        const rolesArray = user.role.split(', ').filter(role => role in Funcao) as Funcao[];
        setSelectedEditFuncoes(rolesArray);
        setShowEditModal(true);
        clearFeedback();
    };

    const handleEditFuncaoChange = (funcao: Funcao) => {
        setSelectedEditFuncoes(prev => {
            if (prev.includes(funcao)) {
                return prev.filter(f => f !== funcao);
            } else {
                return [...prev, funcao];
            }
        });
    };

    const handleConfirmEdit = async () => {
        if (!usuarioParaEditar) return;
        if (selectedEditFuncoes.length === 0) {
            setError("O usuário deve ter pelo menos uma função."); 
            return;
        }

        setIsSubmitting(usuarioParaEditar.id); 
        clearFeedback();
        const token = localStorage.getItem('token');
        if (!token) { router.push('/login'); return; }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/perfis/usuario/${usuarioParaEditar.id}`, { 
                method: 'PATCH', 
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ funcoes: selectedEditFuncoes }) 
            });

             if (!response.ok) {
                 const errData = await response.json();
                throw new Error(errData.message || 'Falha ao atualizar usuário.');
            }
            
            setSuccess('Usuário atualizado com sucesso!');
            setShowEditModal(false); 
            await fetchData(); 

        } catch (err) {
             setError(err instanceof Error ? err.message : 'Ocorreu um erro ao atualizar.');
        } finally {
            setIsSubmitting(null); 
        }
    };

    const handleDeleteUser = async (userId: number) => {
        if (userId === currentUserId) {
            setError("Você não pode remover a si mesmo.");
            return;
        }
        
        setIsSubmitting(userId); 
        clearFeedback();
        const token = localStorage.getItem('token');
        if (!token) { router.push('/login'); return; }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/perfis/usuario/${userId}`, { 
                method: 'DELETE', 
                headers: { 'Authorization': `Bearer ${token}` },
            });

             if (!response.ok) {
                 const errData = await response.json();
                throw new Error(errData.message || 'Falha ao remover usuário.');
            }
            
            setSuccess('Usuário removido com sucesso.');
            await fetchData(); 

        } catch (err) {
             setError(err instanceof Error ? err.message : 'Ocorreu um erro ao remover.');
        } finally {
            setIsSubmitting(null); 
        }
    };


    return (
        <>
            <div className="page-header-perfis"> 
                <h1 className="page-title-perfis">Gestão de Perfis e Cadastros</h1>
            </div>
            
            {error && <p className="perfis-message perfis-error">{error}</p>}
            {success && <p className="perfis-message perfis-success">{success}</p>}
            {isLoading && <p>Carregando dados...</p>}

            {!isLoading && ( 
                <div className="perfis-container">
                    
                    {/* --- Secção 1: Solicitações Pendentes --- */}
                    <section className="perfis-section">
                        <h2 className="section-title">Solicitações de Cadastro Pendentes</h2>
                        {error && !isLoading && !solicitacoes.length && <p className="no-data-message">Não foi possível carregar as solicitações.</p>}
                        {!error && !isLoading && solicitacoes.length === 0 && (
                            <p className="no-data-message">Nenhuma solicitação de cadastro pendente.</p>
                        )}
                        {solicitacoes.length > 0 && (
                            <div className="perfis-table-container">
                                <table className="perfis-table">
                                    <thead>
                                        <tr>
                                            <th>ID Solicitação</th>
                                            <th>Nome</th>
                                            <th>Login Desejado</th>
                                            <th>ID Responsável (Se houver)</th>
                                            <th>Data Solicitação</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {solicitacoes.map((req) => (
                                            <tr key={`req-${req.id}`}>
                                                <td>{req.id}</td>
                                                <td>{req.nome}</td>
                                                <td>{req.login}</td>
                                                <td>{req.responsavelId || 'N/A'}</td>
                                                <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <div className="perfis-actions">
                                                        <button 
                                                            className="btn-action btn-rejeitar" 
                                                            onClick={() => handleRejeitar(req.id)}
                                                            disabled={isSubmitting === req.id}
                                                        >
                                                             {isSubmitting === req.id ? '...' : 'Rejeitar'}
                                                        </button>
                                                        <button 
                                                            className="btn-action btn-aprovar" 
                                                            onClick={() => handleAprovarClick(req)}
                                                            disabled={isSubmitting === req.id}
                                                        >
                                                            {isSubmitting === req.id ? '...' : 'Aprovar'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    {/* --- Secção 2: Utilizadores Atuais --- */}
                     <section className="perfis-section">
                        <h2 className="section-title">Utilizadores Atuais</h2>
                         {error && !isLoading && !usuarios.length && <p className="no-data-message">Não foi possível carregar os usuários.</p>}
                         {!error && !isLoading && usuarios.length === 0 && (
                            <p className="no-data-message">Nenhum utilizador encontrado.</p>
                        )}
                        {usuarios.length > 0 && (
                            <div className="perfis-table-container">
                                <table className="perfis-table">
                                     <thead>
                                        <tr>
                                            <th>ID Utilizador</th>
                                            <th>Nome</th>
                                            <th>Login</th>
                                            <th>Permissão (Role)</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usuarios.map((u) => (
                                            <tr key={`user-${u.id}`}>
                                                <td>{u.id}</td>
                                                <td>{u.nome}</td>
                                                <td>{u.login}</td>
                                                <td>
                                                    <span className={`role-badge role-${u.role ? u.role.toLowerCase().replace(/, /g, '-') : 'nd'}`}>
                                                        {u.role || 'N/D'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="perfis-actions">
                                                        <button 
                                                            className="btn-action btn-rejeitar"
                                                            onClick={() => handleDeleteUser(u.id)}
                                                            disabled={isSubmitting !== null || u.id === currentUserId}
                                                            title={u.id === currentUserId ? "Não pode remover a si mesmo" : "Remover Usuário"}
                                                        >
                                                            Remover
                                                        </button>
                                                        <button 
                                                            className="btn-action btn-editar"
                                                            onClick={() => handleEditUserClick(u)} 
                                                            disabled={isSubmitting !== null || u.id === currentUserId}
                                                            title={u.id === currentUserId ? "Não pode editar a si mesmo" : "Editar Funções"}
                                                        >
                                                            Editar
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    {/* --- ATUALIZADO: Secção 3: Solicitações Confirmadas --- */}
                     <section className="perfis-section">
                        <h2 className="section-title">Histórico de Solicitações Confirmadas</h2>
                        {error && !isLoading && !solicitacoesConfirmadas.length && <p className="no-data-message">Não foi possível carregar o histórico.</p>}
                        {!error && !isLoading && solicitacoesConfirmadas.length === 0 ? (
                            <p className="no-data-message">Nenhuma solicitação confirmada encontrada.</p>
                        ) : (
                            <div className="perfis-table-container">
                                <table className="perfis-table">
                                     <thead>
                                        <tr>
                                            <th>ID Solicitação</th>
                                            <th>Nome</th>
                                            <th>Login (Criado)</th>
                                            {/* --- MUDANÇA: Título da Coluna --- */}
                                            <th>Aprovado por (Nome)</th> 
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {solicitacoesConfirmadas.map((req) => (
                                            <tr key={`req-conf-${req.id}`} className="confirmed-row">
                                                <td>{req.id}</td>
                                                <td>{req.nome}</td>
                                                <td>{req.login}</td>
                                                {/* --- MUDANÇA: Exibe o nome --- */}
                                                <td>
                                                    {req.responsavelNome || `ID: ${req.responsavelId}`}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>
            )}

            {/* --- Modal de Aprovação (Existente) --- */}
            {showApproveModal && solicitacaoParaAprovar && (
                <div className="perfis-modal-overlay">
                    <div className="perfis-modal-content">
                        <h3 className="modal-title">Aprovar Novo Utilizador</h3>
                        <p>Selecione as funções para <strong>{solicitacaoParaAprovar.nome}</strong> (Login: {solicitacaoParaAprovar.login}):</p>
                        
                        <div className="funcoes-checkbox-group">
                            {Object.values(Funcao).map((funcao) => (
                                <label key={funcao} className="funcao-checkbox">
                                    <input 
                                        type="checkbox"
                                        value={funcao}
                                        checked={selectedFuncoes.includes(funcao)}
                                        onChange={() => handleFuncaoChange(funcao)}
                                    />
                                    {funcao}
                                </label>
                            ))}
                        </div>

                        {error && <p className="perfis-message perfis-error modal-error">{error}</p>}

                        <div className="modal-actions">
                            <button 
                                className="btn-secondary" 
                                onClick={() => setShowApproveModal(false)} 
                                disabled={isSubmitting === solicitacaoParaAprovar.id}
                            >
                                Cancelar
                            </button>
                             <button 
                                className="btn-primary" 
                                onClick={handleConfirmAprovacao} 
                                disabled={isSubmitting === solicitacaoParaAprovar.id || selectedFuncoes.length === 0}
                            >
                                {isSubmitting === solicitacaoParaAprovar.id ? 'Aprovando...' : 'Confirmar Aprovação'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

             {/* --- NOVO: Modal de Edição de Funções --- */}
            {showEditModal && usuarioParaEditar && (
                <div className="perfis-modal-overlay">
                    <div className="perfis-modal-content">
                        <h3 className="modal-title">Editar Funções</h3>
                        <p>Editando funções para <strong>{usuarioParaEditar.nome}</strong> (Login: {usuarioParaEditar.login}):</p>
                        
                        <div className="funcoes-checkbox-group">
                            {Object.values(Funcao).map((funcao) => (
                                <label key={funcao} className="funcao-checkbox">
                                    <input 
                                        type="checkbox"
                                        value={funcao}
                                        checked={selectedEditFuncoes.includes(funcao)}
                                        onChange={() => handleEditFuncaoChange(funcao)}
                                    />
                                    {funcao}
                                </label>
                            ))}
                        </div>

                        {error && <p className="perfis-message perfis-error modal-error">{error}</p>}

                        <div className="modal-actions">
                            <button 
                                className="btn-secondary" 
                                onClick={() => setShowEditModal(false)} 
                                disabled={isSubmitting === usuarioParaEditar.id}
                            >
                                Cancelar
                            </button>
                             <button 
                                className="btn-primary" 
                                onClick={handleConfirmEdit} 
                                disabled={isSubmitting === usuarioParaEditar.id || selectedEditFuncoes.length === 0}
                            >
                                {isSubmitting === usuarioParaEditar.id ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

