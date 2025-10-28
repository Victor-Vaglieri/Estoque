"use client";

// --- CORREÇÃO AQUI: Importar ChangeEvent ---
import { useState, useEffect, FormEvent, ChangeEvent, useMemo } from 'react';
// --- CORREÇÃO AQUI: Caminho relativo ---
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

// Importe o CSS específico para esta página
import './avisos.css';

// Enum para Importância (espelha o backend)
enum Importancia {
    BAIXA = 'BAIXA',
    MEDIA = 'MEDIA',
    ALTA = 'ALTA',
}

// Interface para um Alerta (vindo do backend)
interface Alerta {
    id: number;
    titulo: string;
    descricao: string;
    importancia: Importancia;
    concluido: boolean;
    createdAt: string; // Vem como string ISO
    destinadoPara?: number | null; // Opcional
    finishedAt?: string | null; // Opcional
    userId?: number; // Adicionado: ID do criador
}

// Tipo para os dados do formulário
interface AlertaFormData {
    titulo: string;
    descricao: string;
    importancia: Importancia;
    destinadoPara?: string; // Como string para o input, converter antes de enviar
}

const initialFormData: AlertaFormData = {
    titulo: '',
    descricao: '',
    importancia: Importancia.MEDIA, // Padrão
    destinadoPara: '',
};

// --- NOVO: Tipo para Critérios de Ordenação ---
type SortCriteria = 'recentes' | 'antigos' | 'importancia';

export default function AvisosPage() {
    const router = useRouter();
    const { user } = useAuth();

    const [alertas, setAlertas] = useState<Alerta[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Estados do formulário
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [formData, setFormData] = useState<AlertaFormData>(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- NOVO: Estado para Ordenação ---
    const [sortCriteria, setSortCriteria] = useState<SortCriteria>('recentes'); // Padrão: Mais recentes

    const clearFeedback = () => { setError(null); setSuccess(null); };

    // --- BUSCAR ALERTAS ---
    const fetchAlertas = async () => {
        // Não reseta o loading se já estiver carregando
        // setIsLoading(true); 
        clearFeedback();
        const token = localStorage.getItem('token');
        if (!token) { router.push('/login'); return; }

        setIsLoading(true); // Define loading aqui
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avisos`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
            if (!response.ok) throw new Error('Falha ao carregar avisos.');
            const data: Alerta[] = await response.json();
            setAlertas(data); // Armazena sem ordenar aqui
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocorreu um erro.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAlertas();
    }, [router]); // Dependência ajustada

    // --- FUNÇÕES CRUD COMPLETAS ---

    // Abrir formulário para ADICIONAR
    const handleAddClick = () => {
        setIsEditing(null);
        setFormData(initialFormData);
        setShowForm(true);
        clearFeedback();
    };

    // Abrir formulário para EDITAR
    const handleEditClick = (alerta: Alerta) => {
        // Verifica permissão (apenas criador pode editar)
        if (alerta.concluido) {
            setError("Não é possível editar um aviso concluído.");
            window.scrollTo(0, 0);
            return;
        }
        setIsEditing(alerta.id);
        setFormData({
            titulo: alerta.titulo,
            descricao: alerta.descricao,
            importancia: alerta.importancia,
            destinadoPara: alerta.destinadoPara?.toString() ?? '',
        });
        setShowForm(true);
        clearFeedback();
        window.scrollTo(0, 0); // Rola para o topo para ver o formulário
    };

    // Fechar formulário
    const handleCancelForm = () => {
        setShowForm(false);
        setIsEditing(null);
        setFormData(initialFormData);
    };

    // Lidar com mudanças nos inputs do formulário
    const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Submeter formulário (CRIAR ou ATUALIZAR)
    const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        clearFeedback();
        const token = localStorage.getItem('token');
        if (!token) { router.push('/login'); setIsSubmitting(false); return; }

        const method = isEditing ? 'PATCH' : 'POST';
        const url = isEditing
            ? `${process.env.NEXT_PUBLIC_API_URL}/avisos/${isEditing}`
            : `${process.env.NEXT_PUBLIC_API_URL}/avisos`;

        let destinadoParaValue: number | null = null;
        if (formData.destinadoPara && formData.destinadoPara.trim() !== '') {
            const parsedInt = parseInt(formData.destinadoPara, 10);
            if (isNaN(parsedInt) || parsedInt <= 0) {
                setError("ID do destinatário inválido. Deve ser um número positivo.");
                setIsSubmitting(false);
                return;
            }
            destinadoParaValue = parsedInt;
        }


        const body = {
            titulo: formData.titulo,
            descricao: formData.descricao,
            importancia: formData.importancia,
            destinadoPara: destinadoParaValue, // Envia número ou null
        };

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || `Falha ao ${isEditing ? 'atualizar' : 'criar'} aviso.`);
            }
            setSuccess(`Aviso ${isEditing ? 'atualizado' : 'criado'} com sucesso!`);
            setShowForm(false); // Fecha o formulário
            setIsEditing(null); // Limpa o modo de edição
            setFormData(initialFormData); // Limpa os dados do formulário
            await fetchAlertas(); // Recarrega a lista
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocorreu um erro.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // REMOVER alerta
    const handleDelete = async (id: number, creatorId?: number) => {

        clearFeedback();
        const token = localStorage.getItem('token');
        if (!token) { router.push('/login'); return; }

        // Adiciona feedback visual de que algo está acontecendo
        // Poderia usar um estado específico para delete, ex: deletingId
        // setIsLoading(true); 

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avisos/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Falha ao remover aviso.');
            }
            setSuccess('Aviso removido com sucesso!');
            await fetchAlertas(); // Recarrega a lista
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocorreu um erro ao remover.');
        } finally {
            // setIsLoading(false);
        }
    };

    // MARCAR COMO CONCLUÍDO/PENDENTE
    const handleToggleConcluido = async (alerta: Alerta) => {
        // Verifica permissão (criador, destinatário ou aviso público?)
        // Adapte esta regra conforme necessário
        clearFeedback();
        const token = localStorage.getItem('token');
        if (!token) { router.push('/login'); return; }

        const newStatus = !alerta.concluido;

        // Adiciona feedback visual
        // Poderia usar um estado específico, ex: togglingId
        // setIsLoading(true); 

        try {
            // Usa o endpoint PATCH para atualizar apenas o status 'concluido'
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avisos/${alerta.id}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ concluido: newStatus }),
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Falha ao atualizar status.');
            }
            setSuccess(`Status do aviso atualizado!`);
            await fetchAlertas(); // Recarrega a lista
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocorreu um erro ao atualizar status.');
        } finally {
            // setIsLoading(false);
        }
    };


    // --- Ordenação da Lista ---
    const sortedAlertas = useMemo(() => {
        const sortableAlertas = [...alertas];
        const importanceOrder: Record<Importancia, number> = { [Importancia.ALTA]: 3, [Importancia.MEDIA]: 2, [Importancia.BAIXA]: 1 };

        switch (sortCriteria) {
            case 'importancia':
                sortableAlertas.sort((a, b) => importanceOrder[b.importancia] - importanceOrder[a.importancia] || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
            case 'antigos':
                sortableAlertas.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                break;
            case 'recentes': default:
                sortableAlertas.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
        }
        return sortableAlertas;
    }, [alertas, sortCriteria]);


    return (
        <>
            <div className="page-header-avisos">
                <h1 className="page-title-avisos">Quadro de Avisos</h1>
                {/* Só mostra o botão Adicionar se o usuário estiver logado */}
                {
                    <button className="btn-primary" onClick={handleAddClick} disabled={showForm}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M11 19v-6H5v-2h6V5h2v6h6v2h-6v6z"></path></svg>
                        Adicionar Aviso
                    </button>
                }
            </div>

            {error && <p className="avisos-message avisos-error">{error}</p>}
            {success && <p className="avisos-message avisos-success">{success}</p>}

            {/* --- Formulário de Adicionar/Editar --- */}
            {showForm && (
                <div className="avisos-form-container">
                    <h2 className="form-title">{isEditing ? 'Editar Aviso' : 'Novo Aviso'}</h2>
                    <form onSubmit={handleFormSubmit} className="avisos-form">
                        <label>
                            Título:
                            <input name="titulo" type="text" value={formData.titulo} onChange={handleFormChange} required maxLength={100} />
                        </label>
                        <label>
                            Descrição:
                            <textarea name="descricao" value={formData.descricao} onChange={handleFormChange} required rows={4} />
                        </label>
                        <div className="form-row">
                            <label>
                                Importância:
                                <select name="importancia" value={formData.importancia} onChange={handleFormChange}>
                                    <option value={Importancia.BAIXA}>Baixa</option>
                                    <option value={Importancia.MEDIA}>Média</option>
                                    <option value={Importancia.ALTA}>Alta</option>
                                </select>
                            </label>
                            <label>
                                Destinado Para (ID Usuário, opcional):
                                <input name="destinadoPara" type="number" value={formData.destinadoPara} onChange={handleFormChange} min="1" step="1" />
                            </label>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn-primary" disabled={isSubmitting}>
                                {isSubmitting ? 'Salvando...' : (isEditing ? 'Atualizar Aviso' : 'Criar Aviso')}
                            </button>
                            <button type="button" className="btn-secondary" onClick={handleCancelForm} disabled={isSubmitting}>
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* --- Seletor de Ordenação e Lista de Avisos --- */}
            {isLoading && <p>Carregando avisos...</p>}

            {!isLoading && (
                <div className="avisos-list-container">
                    {alertas.length > 0 && (
                        <div className="sort-selector-container">
                            <label htmlFor="sort-avisos">Ordenar por:</label>
                            <select id="sort-avisos" className="sort-selector" value={sortCriteria} onChange={(e) => setSortCriteria(e.target.value as SortCriteria)}>
                                <option value="recentes">Mais Recentes</option>
                                <option value="antigos">Mais Antigos</option>
                                <option value="importancia">Importância</option>
                            </select>
                        </div>
                    )}

                    {alertas.length === 0 && !error && (
                        <p className="no-avisos-message">Nenhum aviso encontrado.</p>
                    )}

                    {sortedAlertas.length > 0 && (
                        <div className="avisos-grid">
                            {sortedAlertas.map((alerta) => (
                                <div key={alerta.id} className={`aviso-card importancia-${alerta.importancia.toLowerCase()} ${alerta.concluido ? 'concluido' : ''}`}>
                                    <div className="aviso-header">
                                        <h3 className="aviso-title">{alerta.titulo}</h3>
                                        <span className={`aviso-badge badge-${alerta.importancia.toLowerCase()}`}>{alerta.importancia}</span>
                                    </div>
                                    <p className="aviso-descricao">{alerta.descricao}</p>
                                    <div className="aviso-footer">
                                        <span className="aviso-date">
                                            Criado em: {new Date(alerta.createdAt).toLocaleDateString()}
                                            {alerta.destinadoPara && ` | Para ID: ${alerta.destinadoPara}`}
                                        </span>
                                        <div className="aviso-actions">
                                            {/* Botão Remover */}
                                            <button
                                                className="btn-aviso btn-remover"
                                                onClick={() => handleDelete(alerta.id, alerta.userId)}
                                                disabled={showForm}
                                                title="Remover Aviso"
                                            >
                                                {/* SVG removido */}
                                                <span>Remover</span>
                                            </button>
                                            {/* Botão Editar */}
                                            <button
                                                className="btn-aviso btn-editar"
                                                onClick={() => handleEditClick(alerta)}
                                                disabled={showForm || alerta.concluido}
                                                title={alerta.concluido ? "Não pode editar aviso concluído" : "Editar"}
                                            >
                                                {/* SVG removido */}
                                                <span>Editar</span>
                                            </button>
                                            {/* Botão Concluir/Reabrir */}
                                            <button
                                                className={`btn-aviso btn-toggle-status ${alerta.concluido ? 'btn-reabrir' : 'btn-concluir'}`}
                                                onClick={() => handleToggleConcluido(alerta)}
                                                title={alerta.concluido ? "Marcar como Pendente" : "Marcar como Concluído"}
                                            >
                                                {/* SVG removido */}
                                                <span>{alerta.concluido ? 'Reabrir' : 'Concluir'}</span>
                                            </button>
                                        </div>
                                    </div>
                                    {alerta.finishedAt && (
                                        <span className="aviso-finished-date">
                                            Concluído em: {new Date(alerta.finishedAt).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

