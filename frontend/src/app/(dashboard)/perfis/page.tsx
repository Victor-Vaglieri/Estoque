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

// NOVA INTERFACE
interface Fornecedor {
    id: number;
    nome: string;
}

export default function PerfisPage() {
    const router = useRouter();
    const { user } = useAuth();
    const currentUserId = user?.id;

    const [solicitacoes, setSolicitacoes] = useState<CadastroRequest[]>([]);
    const [usuarios, setUsuarios] = useState<User[]>([]);
    // const [solicitacoesConfirmadas, setSolicitacoesConfirmadas] = useState<CadastroRequest[]>([]); // Não estava sendo usado visualmente, mantive comentado se quiser limpar
    const [lojas, setLojas] = useState<Loja[]>([]);
    
    // NOVO ESTADO
    const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<number | null>(null);

    // Estados Modais Usuários
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [solicitacaoParaAprovar, setSolicitacaoParaAprovar] = useState<CadastroRequest | null>(null);
    const [selectedFuncoes, setSelectedFuncoes] = useState<Funcao[]>([Funcao.TERCEIROS]);
    const [selectedLojaId, setSelectedLojaId] = useState<string>("");
    const [showEditModal, setShowEditModal] = useState(false);
    const [usuarioParaEditar, setUsuarioParaEditar] = useState<User | null>(null);
    const [editForm, setEditForm] = useState({ nome: '', login: '', lojaId: '', funcoes: [] as Funcao[] });

    // NOVO: Estados Modal Fornecedor
    const [showFornecedorModal, setShowFornecedorModal] = useState(false);
    const [fornecedorEditing, setFornecedorEditing] = useState<Fornecedor | null>(null); // Se null, é criação
    const [fornecedorName, setFornecedorName] = useState("");


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
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/perfis/lojas`, { headers }),
                // NOVO FETCH
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/perfis/fornecedores`, { headers }) 
            ]);

            if (results[0].status === 'fulfilled' && results[0].value.ok) setSolicitacoes(await results[0].value.json());
            if (results[1].status === 'fulfilled' && results[1].value.ok) setUsuarios(await results[1].value.json());
            if (results[2].status === 'fulfilled' && results[2].value.ok) setLojas(await results[2].value.json());
            // NOVO SET
            if (results[3].status === 'fulfilled' && results[3].value.ok) setFornecedores(await results[3].value.json());

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocorreu um erro ao carregar os dados.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            if (!user.funcoes.some((f: string) => f === 'GESTOR')) {
                router.push('/inicio');
                return;
            }
        }
        fetchData();
    }, [router, user]);

    // --- FUNÇÕES DE FORNECEDOR ---

    const handleOpenFornecedorModal = (fornecedor?: Fornecedor) => {
        clearFeedback();
        if (fornecedor) {
            setFornecedorEditing(fornecedor);
            setFornecedorName(fornecedor.nome);
        } else {
            setFornecedorEditing(null);
            setFornecedorName("");
        }
        setShowFornecedorModal(true);
    };

    const handleSaveFornecedor = async () => {
        if (!fornecedorName.trim()) {
            setError("Nome do fornecedor é obrigatório.");
            return;
        }
        
        const token = localStorage.getItem('token');
        const method = fornecedorEditing ? 'PATCH' : 'POST';
        const url = fornecedorEditing 
            ? `${process.env.NEXT_PUBLIC_API_URL}/perfis/fornecedores/${fornecedorEditing.id}`
            : `${process.env.NEXT_PUBLIC_API_URL}/perfis/fornecedores`;

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome: fornecedorName })
            });

            if (!res.ok) throw new Error("Falha ao salvar fornecedor.");

            setSuccess(`Fornecedor ${fornecedorEditing ? 'atualizado' : 'criado'} com sucesso!`);
            setShowFornecedorModal(false);
            fetchData(); // Recarrega a lista
        } catch (err) {
            setError("Erro ao salvar fornecedor.");
        }
    };

    // NOVA FUNÇÃO: DELETAR FORNECEDOR
    const handleDeleteFornecedor = async (id: number) => {
        if (!window.confirm("Tem certeza que deseja excluir este fornecedor?")) return;
        
        setIsSubmitting(id);
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/perfis/fornecedores/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                // Tenta ler a mensagem de erro do backend (ex: "Possui produtos vinculados")
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao remover fornecedor.');
            }

            setSuccess('Fornecedor removido com sucesso.');
            await fetchData(); // Recarrega a lista
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao remover.');
        } finally {
            setIsSubmitting(null);
        }
    };


    // ... (Funções de Aprovação e Edição de Usuário MANTIDAS IGUAIS - Omitidas para brevidade, mantenha as suas) ...
    const handleAprovarClick = (solicitacao: CadastroRequest) => {
        setSolicitacaoParaAprovar(solicitacao);
        setSelectedFuncoes([Funcao.TERCEIROS]);
        setSelectedLojaId(""); 
        setShowApproveModal(true);
        clearFeedback();
    };
    const handleConfirmAprovacao = async () => {
        if (!solicitacaoParaAprovar) return;
        if (selectedFuncoes.length === 0) { setError("Selecione pelo menos uma função."); return; }
        if (!selectedLojaId) { setError("Selecione uma loja para o usuário."); return; }
        setIsSubmitting(solicitacaoParaAprovar.id);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/perfis/aprovar/${solicitacaoParaAprovar.id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ funcoes: selectedFuncoes, lojaId: parseInt(selectedLojaId) })
            });
            if (!response.ok) throw new Error('Falha ao aprovar usuário.');
            setSuccess('Utilizador aprovado com sucesso!');
            setShowApproveModal(false);
            await fetchData();
        } catch (err) { setError('Ocorreu um erro ao aprovar.'); } finally { setIsSubmitting(null); }
    };
    const handleRejeitar = async (cadastroId: number) => {
        if (!window.confirm('Rejeitar solicitação permanentemente?')) return;
        setIsSubmitting(cadastroId);
        const token = localStorage.getItem('token');
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/perfis/rejeitar/${cadastroId}`, {
                method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` },
            });
            setSuccess('Solicitação rejeitada.');
            await fetchData();
        } catch (err) { setError('Erro ao rejeitar.'); } finally { setIsSubmitting(null); }
    };
    const handleFuncaoChange = (funcao: Funcao) => {
        setSelectedFuncoes(prev => prev.includes(funcao) ? prev.filter(f => f !== funcao) : [...prev, funcao]);
    };
    const handleEditUserClick = (userToEdit: User) => {
        setUsuarioParaEditar(userToEdit);
        const rolesString = userToEdit.role || '';
        const rolesArray = rolesString.split(', ').filter(r => Object.values(Funcao).includes(r as Funcao)) as Funcao[];
        setEditForm({ nome: userToEdit.nome, login: userToEdit.login, lojaId: userToEdit.lojaId ? userToEdit.lojaId.toString() : '', funcoes: rolesArray });
        setShowEditModal(true);
        clearFeedback();
    };
    const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };
    const handleEditFuncaoChange = (funcao: Funcao) => {
        setEditForm(prev => ({
            ...prev, funcoes: prev.funcoes.includes(funcao) ? prev.funcoes.filter(f => f !== funcao) : [...prev.funcoes, funcao]
        }));
    };
    const handleConfirmEdit = async () => {
        if (!usuarioParaEditar) return;
        if (editForm.funcoes.length === 0) { setError("O usuário deve ter pelo menos uma função."); return; }
        if (!editForm.lojaId) { setError("O usuário deve estar associado a uma loja."); return; }
        setIsSubmitting(usuarioParaEditar.id);
        const token = localStorage.getItem('token');
        try {
            const payload: any = { nome: editForm.nome, login: editForm.login, lojaId: parseInt(editForm.lojaId), funcoes: editForm.funcoes };
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/perfis/usuario/${usuarioParaEditar.id}`, {
                method: 'PATCH', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error('Falha ao atualizar usuário.');
            setSuccess('Usuário atualizado com sucesso!');
            setShowEditModal(false);
            await fetchData();
        } catch (err) { setError('Ocorreu um erro ao atualizar.'); } finally { setIsSubmitting(null); }
    };
    const handleDeleteUser = async (userId: number) => {
        if (userId === currentUserId) { setError("Você não pode remover a si mesmo."); return; }
        if (!window.confirm("Tem certeza que deseja remover este usuário?")) return;
        setIsSubmitting(userId);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/perfis/usuario/${userId}`, {
                method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Falha ao remover usuário.');
            setSuccess('Usuário removido.');
            await fetchData();
        } catch (err) { setError('Erro ao remover.'); } finally { setIsSubmitting(null); }
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

                    {/* --- SEÇÃO 1: SOLICITAÇÕES (Mantida) --- */}
                    <section className="perfis-section">
                        <h2 className="section-title">Solicitações Pendentes</h2>
                        {solicitacoes.length === 0 ? (
                            <p className="no-data-message">Nenhuma solicitação pendente.</p>
                        ) : (
                            <div className="perfis-table-container">
                                <table className="perfis-table">
                                    <thead>
                                        <tr>
                                            <th>Nome</th><th>Login</th><th>Data</th><th>Ações</th>
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
                                                        <button className="btn-action btn-rejeitar" onClick={() => handleRejeitar(req.id)} disabled={isSubmitting === req.id}>Rejeitar</button>
                                                        <button className="btn-action btn-aprovar" onClick={() => handleAprovarClick(req)} disabled={isSubmitting === req.id}>Aprovar</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    {/* --- SEÇÃO 2: USUÁRIOS (Mantida) --- */}
                    <section className="perfis-section">
                        <h2 className="section-title">Utilizadores Atuais</h2>
                        {usuarios.length === 0 ? (
                            <p className="no-data-message">Nenhum utilizador encontrado.</p>
                        ) : (
                            <div className="perfis-table-container">
                                <table className="perfis-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th><th>Nome</th><th>Login</th><th>Loja</th><th>Funções</th><th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usuarios.map((u) => (
                                            <tr key={u.id} className={u.id === currentUserId ? 'current-user-row' : ''}>
                                                <td data-label="ID">{u.id}</td>
                                                <td data-label="Nome">{u.nome} {u.id === currentUserId && '(Você)'}</td>
                                                <td data-label="Login">{u.login}</td>
                                                <td data-label="Loja">{lojas.find(l => l.id === u.lojaId)?.nome || 'N/A'}</td>
                                                <td data-label="Funções">
                                                    <div className="role-badge-container">
                                                        {u.role && u.role.split(', ').map(role => (
                                                            <span key={role} className={`role-badge role-${role.toLowerCase()}`}>{role}</span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td data-label="Ações">
                                                    <div className="perfis-actions">
                                                        <button className="btn-action btn-editar" onClick={() => handleEditUserClick(u)} disabled={isSubmitting !== null}>Editar</button>
                                                        {u.id !== currentUserId && (
                                                            <button className="btn-action btn-rejeitar" onClick={() => handleDeleteUser(u.id)} disabled={isSubmitting !== null}>Remover</button>
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

                    {/* --- SEÇÃO 3: FORNECEDORES (NOVA) --- */}
                    <section className="perfis-section">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 className="section-title" style={{ marginBottom: 0 }}>Fornecedores</h2>
                            <button className="btn-primary" onClick={() => handleOpenFornecedorModal()}>+ Novo Fornecedor</button>
                        </div>
                        
                        {fornecedores.length === 0 ? (
                            <p className="no-data-message">Nenhum fornecedor cadastrado.</p>
                        ) : (
                            <div className="perfis-table-container">
                                <table className="perfis-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Nome</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {fornecedores.map((f) => (
                                            <tr key={f.id}>
                                                <td data-label="ID" style={{ width: '80px' }}>{f.id}</td>
                                                <td data-label="Nome">{f.nome}</td>
                                                <td data-label="Ações" style={{ width: '150px' }}>
                                                    <div className="perfis-actions">
                                                        <button 
                                                            className="btn-action btn-editar" 
                                                            onClick={() => handleOpenFornecedorModal(f)}
                                                            disabled={isSubmitting !== null}
                                                        >
                                                            Editar
                                                        </button>
                                                        
                                                        {/* NOVO BOTÃO DE REMOVER */}
                                                        <button 
                                                            className="btn-action btn-rejeitar" 
                                                            onClick={() => handleDeleteFornecedor(f.id)}
                                                            disabled={isSubmitting !== null}
                                                        >
                                                            Remover
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

                </div>
            )}

            {/* --- MODAIS (Mantidos os anteriores) --- */}
            
            {/* Modal Aprovar */}
            {showApproveModal && solicitacaoParaAprovar && (
                <div className="perfis-modal-overlay">
                    <div className="perfis-modal-content">
                        <h3 className="modal-title">Aprovar {solicitacaoParaAprovar.nome}</h3>
                        <label className="modal-label">Loja:</label>
                        <select className="modal-select" value={selectedLojaId} onChange={(e) => setSelectedLojaId(e.target.value)}>
                            <option value="">Selecione a Loja...</option>
                            {lojas.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
                        </select>
                        <label className="modal-label">Funções:</label>
                        <div className="funcoes-checkbox-group">
                            {Object.values(Funcao).map((funcao) => (
                                <label key={funcao} className={`funcao-tag tag-${funcao.toLowerCase()} ${selectedFuncoes.includes(funcao) ? 'selected' : ''}`}>
                                    <input type="checkbox" checked={selectedFuncoes.includes(funcao)} onChange={() => handleFuncaoChange(funcao)} className="hidden-checkbox" />
                                    {funcao}
                                </label>
                            ))}
                        </div>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setShowApproveModal(false)}>Cancelar</button>
                            <button className="btn-primary" onClick={handleConfirmAprovacao} disabled={!selectedLojaId || selectedFuncoes.length === 0}>Confirmar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Editar Usuário */}
            {showEditModal && usuarioParaEditar && (
                <div className="perfis-modal-overlay">
                    <div className="perfis-modal-content">
                        <h3 className="modal-title">Editar Usuário</h3>
                        <div className="edit-form-grid">
                            <label>Nome:<input type="text" name="nome" value={editForm.nome} onChange={handleEditFormChange} /></label>
                            <label>Loja:
                                <select name="lojaId" value={editForm.lojaId} onChange={handleEditFormChange}>
                                    <option value="">Selecione...</option>
                                    {lojas.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
                                </select>
                            </label>
                        </div>
                        <label className="modal-label">Funções:</label>
                        <div className="funcoes-checkbox-group">
                            {Object.values(Funcao).map((funcao) => (
                                <label key={funcao} className={`funcao-tag tag-${funcao.toLowerCase()} ${editForm.funcoes.includes(funcao) ? 'selected' : ''} ${usuarioParaEditar.id === currentUserId && funcao === Funcao.GESTOR ? 'disabled' : ''}`}>
                                    <input type="checkbox" checked={editForm.funcoes.includes(funcao)} onChange={() => handleEditFuncaoChange(funcao)} disabled={usuarioParaEditar.id === currentUserId && funcao === Funcao.GESTOR} className="hidden-checkbox" />
                                    {funcao}
                                </label>
                            ))}
                        </div>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancelar</button>
                            <button className="btn-primary" onClick={handleConfirmEdit}>Salvar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- NOVO: Modal Editar/Criar Fornecedor --- */}
            {showFornecedorModal && (
                <div className="perfis-modal-overlay">
                    <div className="perfis-modal-content" style={{ maxWidth: '400px' }}>
                        <h3 className="modal-title">{fornecedorEditing ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h3>
                        
                        <div className="edit-form-grid" style={{ gridTemplateColumns: '1fr' }}>
                            <label>
                                Nome do Fornecedor:
                                <input 
                                    type="text" 
                                    value={fornecedorName} 
                                    onChange={(e) => setFornecedorName(e.target.value)} 
                                    placeholder="Ex: Tecidos & Cia"
                                    autoFocus
                                />
                            </label>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setShowFornecedorModal(false)}>Cancelar</button>
                            <button className="btn-primary" onClick={handleSaveFornecedor}>Salvar</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}