"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

import "./perfis.css";

enum Funcao {
    TERCEIROS = 'TERCEIROS',
    SAIDA = 'SAIDA',
    RECEBIMENTO = 'RECEBIMENTO',
    INVENTARIO = 'INVENTARIO',
    AVISOS = 'AVISOS',
    CADASTRO = 'CADASTRO',
    LISTA = 'LISTA',
    GESTOR = 'GESTOR',
}

interface CadastroRequest {
    id: number;
    nome: string;
    login: string;
    responsavelId: number | null;
    createdAt: string;
    responsavelNome?: string | null;
}

interface User {
    id: number;
    nome: string;
    login: string;
    role: string; 
    lojaId: number | null;
}

interface Loja {
    id: number;
    nome: string;
}

export default function PerfisPage() {
    const router = useRouter();
    const { user } = useAuth();
    const currentUserId = user?.id;

    const [solicitacoes, setSolicitacoes] = useState<CadastroRequest[]>([]);
    const [usuarios, setUsuarios] = useState<User[]>([]);
    const [solicitacoesConfirmadas, setSolicitacoesConfirmadas] = useState<CadastroRequest[]>([]);
    const [lojas, setLojas] = useState<Loja[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<number | null>(null);

    
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [solicitacaoParaAprovar, setSolicitacaoParaAprovar] = useState<CadastroRequest | null>(null);
    const [selectedFuncoes, setSelectedFuncoes] = useState<Funcao[]>([Funcao.TERCEIROS]);
    const [selectedLojaId, setSelectedLojaId] = useState<string>("");

    
    const [showEditModal, setShowEditModal] = useState(false);
    const [usuarioParaEditar, setUsuarioParaEditar] = useState<User | null>(null);
    const [editForm, setEditForm] = useState({
        nome: '',
        login: '',
        
        lojaId: '',
        funcoes: [] as Funcao[]
    });

    const clearFeedback = () => { setError(null); setSuccess(null); };

    const fetchData = async () => {
        setIsLoading(true);
        clearFeedback();
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
            
            const results = await Promise.allSettled([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/perfis/solicitacoes`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/perfis/usuarios`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/perfis/confirmados`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/perfis/lojas`, { headers }) 
            ]);

            if (results[0].status === 'fulfilled' && results[0].value.ok) {
                setSolicitacoes(await results[0].value.json());
            }

            if (results[1].status === 'fulfilled' && results[1].value.ok) {
                setUsuarios(await results[1].value.json());
            }

            if (results[2].status === 'fulfilled' && results[2].value.ok) {
                setSolicitacoesConfirmadas(await results[2].value.json());
            }
            
            if (results[3].status === 'fulfilled' && results[3].value.ok) {
                setLojas(await results[3].value.json());
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocorreu um erro ao carregar os dados.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            if (!user.funcoes.some(f => f === 'GESTOR')) {
                router.push('/inicio');
                return;
            }
        }
        fetchData();
    }, [router, user]);

    

    const handleAprovarClick = (solicitacao: CadastroRequest) => {
        setSolicitacaoParaAprovar(solicitacao);
        setSelectedFuncoes([Funcao.TERCEIROS]);
        setSelectedLojaId(""); 
        setShowApproveModal(true);
        clearFeedback();
    };

    const handleConfirmAprovacao = async () => {
        if (!solicitacaoParaAprovar) return;
        if (selectedFuncoes.length === 0) {
            setError("Selecione pelo menos uma função.");
            return;
        }
        if (!selectedLojaId) {
            setError("Selecione uma loja para o usuário.");
            return;
        }

        setIsSubmitting(solicitacaoParaAprovar.id);
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/perfis/aprovar/${solicitacaoParaAprovar.id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    funcoes: selectedFuncoes,
                    lojaId: parseInt(selectedLojaId)
                })
            });

            if (!response.ok) throw new Error('Falha ao aprovar usuário.');
            
            setSuccess('Utilizador aprovado com sucesso!');
            setShowApproveModal(false);
            await fetchData();
        } catch (err) {
            setError('Ocorreu um erro ao aprovar.');
        } finally {
            setIsSubmitting(null);
        }
    };

    const handleRejeitar = async (cadastroId: number) => {
        if (!window.confirm('Rejeitar solicitação permanentemente?')) return;
        setIsSubmitting(cadastroId);
        const token = localStorage.getItem('token');

        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/perfis/rejeitar/${cadastroId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            setSuccess('Solicitação rejeitada.');
            await fetchData();
        } catch (err) {
            setError('Erro ao rejeitar.');
        } finally {
            setIsSubmitting(null);
        }
    };

    const handleFuncaoChange = (funcao: Funcao) => {
        setSelectedFuncoes(prev => 
            prev.includes(funcao) ? prev.filter(f => f !== funcao) : [...prev, funcao]
        );
    };

    

    const handleEditUserClick = (userToEdit: User) => {
        setUsuarioParaEditar(userToEdit);
        
        const rolesString = userToEdit.role || '';
        const rolesArray = rolesString.split(', ').filter(r => Object.values(Funcao).includes(r as Funcao)) as Funcao[];

        setEditForm({
            nome: userToEdit.nome,
            login: userToEdit.login,
            lojaId: userToEdit.lojaId ? userToEdit.lojaId.toString() : '',
            funcoes: rolesArray
        });

        setShowEditModal(true);
        clearFeedback();
    };

    const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const handleEditFuncaoChange = (funcao: Funcao) => {
        setEditForm(prev => ({
            ...prev,
            funcoes: prev.funcoes.includes(funcao) 
                ? prev.funcoes.filter(f => f !== funcao) 
                : [...prev.funcoes, funcao]
        }));
    };

    const handleConfirmEdit = async () => {
        if (!usuarioParaEditar) return;
        if (editForm.funcoes.length === 0) {
            setError("O usuário deve ter pelo menos uma função.");
            return;
        }
        if (!editForm.lojaId) {
             setError("O usuário deve estar associado a uma loja.");
             return;
        }

        setIsSubmitting(usuarioParaEditar.id);
        const token = localStorage.getItem('token');

        try {
            const payload: any = {
                nome: editForm.nome,
                login: editForm.login,
                lojaId: parseInt(editForm.lojaId),
                funcoes: editForm.funcoes
            };

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/perfis/usuario/${usuarioParaEditar.id}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Falha ao atualizar usuário.');

            setSuccess('Usuário atualizado com sucesso!');
            setShowEditModal(false);
            await fetchData();
        } catch (err) {
            setError('Ocorreu um erro ao atualizar.');
        } finally {
            setIsSubmitting(null);
        }
    };

    const handleDeleteUser = async (userId: number) => {
        if (userId === currentUserId) {
            setError("Você não pode remover a si mesmo. Peça a outro gestor.");
            return;
        }
        if (!window.confirm("Tem certeza que deseja remover este usuário?")) return;

        setIsSubmitting(userId);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/perfis/usuario/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Falha ao remover usuário.');
            setSuccess('Usuário removido.');
            await fetchData();
        } catch (err) {
            setError('Erro ao remover.');
        } finally {
            setIsSubmitting(null);
        }
    };


    return (
        <>
            <div className="page-header-perfis">
                <h1 className="page-title-perfis">Gestão de Perfis</h1>
            </div>

            {error && <p className="perfis-message perfis-error">{error}</p>}
            {success && <p className="perfis-message perfis-success">{success}</p>}
            {isLoading && <p>Carregando dados...</p>}

            {!isLoading && (
                <div className="perfis-container">

                    {}
                    <section className="perfis-section">
                        <h2 className="section-title">Solicitações Pendentes</h2>
                        {solicitacoes.length === 0 ? (
                            <p className="no-data-message">Nenhuma solicitação pendente.</p>
                        ) : (
                            <div className="perfis-table-container">
                                <table className="perfis-table">
                                    <thead>
                                        <tr>
                                            <th>Nome</th>
                                            <th>Login</th>
                                            <th>Data</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {solicitacoes.map((req) => (
                                            <tr key={req.id}>
                                                <td data-label="Nome">{req.nome}</td>
                                                <td data-label="Login">{req.login}</td>
                                                <td data-label="Data">{new Date(req.createdAt).toLocaleDateString()}</td>
                                                <td data-label="Ações">
                                                    <div className="perfis-actions">
                                                        <button className="btn-action btn-rejeitar" onClick={() => handleRejeitar(req.id)} disabled={isSubmitting === req.id}>
                                                            Rejeitar
                                                        </button>
                                                        <button className="btn-action btn-aprovar" onClick={() => handleAprovarClick(req)} disabled={isSubmitting === req.id}>
                                                            Aprovar
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

                    {}
                    <section className="perfis-section">
                        <h2 className="section-title">Utilizadores Atuais</h2>
                        {usuarios.length === 0 ? (
                            <p className="no-data-message">Nenhum utilizador encontrado.</p>
                        ) : (
                            <div className="perfis-table-container">
                                <table className="perfis-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Nome</th>
                                            <th>Login</th>
                                            <th>Loja</th>
                                            <th>Funções</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usuarios.map((u) => (
                                            <tr key={u.id} className={u.id === currentUserId ? 'current-user-row' : ''}>
                                                <td data-label="ID">{u.id}</td>
                                                <td data-label="Nome">{u.nome} {u.id === currentUserId && '(Você)'}</td>
                                                <td data-label="Login">{u.login}</td>
                                                <td data-label="Loja">
                                                    {lojas.find(l => l.id === u.lojaId)?.nome || 'N/A'}
                                                </td>
                                                <td data-label="Funções">
                                                    <div className="role-badge-container">
                                                        {u.role && u.role.split(', ').map(role => (
                                                            <span key={role} className={`role-badge role-${role.toLowerCase()}`}>{role}</span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td data-label="Ações">
                                                    <div className="perfis-actions">
                                                        <button 
                                                            className="btn-action btn-editar" 
                                                            onClick={() => handleEditUserClick(u)}
                                                            disabled={isSubmitting !== null}
                                                        >
                                                            Editar
                                                        </button>
                                                        {u.id !== currentUserId && (
                                                            <button 
                                                                className="btn-action btn-rejeitar" 
                                                                onClick={() => handleDeleteUser(u.id)}
                                                                disabled={isSubmitting !== null}
                                                            >
                                                                Remover
                                                            </button>
                                                        )}
                                                    </div>
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

            {}
            {showApproveModal && solicitacaoParaAprovar && (
                <div className="perfis-modal-overlay">
                    <div className="perfis-modal-content">
                        <h3 className="modal-title">Aprovar {solicitacaoParaAprovar.nome}</h3>
                        
                        <label className="modal-label">Loja:</label>
                        <select 
                            className="modal-select"
                            value={selectedLojaId} 
                            onChange={(e) => setSelectedLojaId(e.target.value)}
                        >
                            <option value="">Selecione a Loja...</option>
                            {lojas.map(l => (
                                <option key={l.id} value={l.id}>{l.nome}</option>
                            ))}
                        </select>

                        <label className="modal-label">Funções (Selecione):</label>
                        <div className="funcoes-checkbox-group">
                            {Object.values(Funcao).map((funcao) => (
                                <label 
                                    key={funcao} 
                                    className={`funcao-tag tag-${funcao.toLowerCase()} ${selectedFuncoes.includes(funcao) ? 'selected' : ''}`}
                                >
                                    <input
                                        type="checkbox"
                                        value={funcao}
                                        checked={selectedFuncoes.includes(funcao)}
                                        onChange={() => handleFuncaoChange(funcao)}
                                        className="hidden-checkbox" 
                                    />
                                    {funcao}
                                </label>
                            ))}
                        </div>

                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setShowApproveModal(false)}>Cancelar</button>
                            <button 
                                className="btn-primary" 
                                onClick={handleConfirmAprovacao}
                                disabled={!selectedLojaId || selectedFuncoes.length === 0}
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {}
            {showEditModal && usuarioParaEditar && (
                <div className="perfis-modal-overlay">
                    <div className="perfis-modal-content">
                        <h3 className="modal-title">Editar Usuário</h3>
                        
                        {}
                        <div className="modal-subtitle">
                            <span>Editando:</span> 
                            <strong className="highlight-name">{usuarioParaEditar.nome}</strong>
                        </div>
                        
                        <div className="edit-form-grid">
                            <label>
                                Nome:
                                <input type="text" name="nome" value={editForm.nome} onChange={handleEditFormChange} />
                            </label>
                            
                            <label>
                                Loja:
                                <select name="lojaId" value={editForm.lojaId} onChange={handleEditFormChange}>
                                    <option value="">Selecione...</option>
                                    {lojas.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
                                </select>
                            </label>
                        </div>

                        <label className="modal-label">Funções (Selecione):</label>
                        <div className="funcoes-checkbox-group">
                            {Object.values(Funcao).map((funcao) => (
                                <label 
                                    key={funcao} 
                                    className={`funcao-tag tag-${funcao.toLowerCase()} ${editForm.funcoes.includes(funcao) ? 'selected' : ''} ${usuarioParaEditar.id === currentUserId && funcao === Funcao.GESTOR ? 'disabled' : ''}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={editForm.funcoes.includes(funcao)}
                                        onChange={() => handleEditFuncaoChange(funcao)}
                                        disabled={usuarioParaEditar.id === currentUserId && funcao === Funcao.GESTOR}
                                        className="hidden-checkbox"
                                    />
                                    {funcao}
                                </label>
                            ))}
                        </div>

                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancelar</button>
                            <button className="btn-primary" onClick={handleConfirmEdit}>Salvar Alterações</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}