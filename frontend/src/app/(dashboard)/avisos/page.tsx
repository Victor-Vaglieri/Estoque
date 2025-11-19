"use client";

import { useState, useEffect, FormEvent, ChangeEvent, useMemo } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

import './avisos.css';

enum Importancia {
  BAIXA = 'BAIXA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
}

interface User {
  id: number;
  nome: string;
  login: string;
  role: string;
}

// Interface atualizada conforme o novo Schema do Prisma
interface AlertaDestinatarioRelation {
  userId: number;
}

interface Alerta {
  id: number;
  titulo: string;
  descricao: string;
  importancia: Importancia;
  concluido: boolean;
  createdAt: string;
  finishedAt?: string | null;

  // Novos campos do schema
  criadorId: number;
  criadorNome: string;
  lojaId: number;

  // Relacionamento
  destinatarios: AlertaDestinatarioRelation[];
}

interface AlertaFormData {
  titulo: string;
  descricao: string;
  importancia: Importancia;
  isPublico: boolean; // Controle visual para facilitar
  destinatariosIds: number[]; // Array de IDs selecionados
}

const initialFormData: AlertaFormData = {
  titulo: '',
  descricao: '',
  importancia: Importancia.MEDIA,
  isPublico: true,
  destinatariosIds: [],
};

type SortCriteria = 'recentes' | 'antigos' | 'importancia';

export default function AvisosPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [usuariosList, setUsuariosList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [formData, setFormData] = useState<AlertaFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>('recentes');

  const clearFeedback = () => { setError(null); setSuccess(null); };

  const fetchAlertas = async () => {
    clearFeedback();
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avisos`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Falha ao carregar avisos.');
      const data: Alerta[] = await response.json();
      setAlertas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsuarios = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/perfis/usuarios`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        console.error('Falha ao carregar lista de usuários.');
        return;
      }

      const data: User[] = await response.json();
      setUsuariosList(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      if (!user.funcoes.some((f: string) => f === 'GESTOR')) {
        router.push('/inicio');
        return;
      }
    }
    fetchAlertas();
    fetchUsuarios();
  }, [user, router]);

  // --- CRUD Functions ---

  const handleAddClick = () => {
    setIsEditing(null);
    setFormData(initialFormData);
    setShowForm(true);
    clearFeedback();
  };

  const handleEditClick = (alerta: Alerta) => {
    if (alerta.concluido) {
      setError("Não é possível editar um aviso concluído.");
      window.scrollTo(0, 0);
      return;
    }

    // Mapeia os destinatários vindos do banco para o array de IDs do form
    const idsExistentes = alerta.destinatarios.map(d => d.userId);
    const isPublic = idsExistentes.length === 0;

    setIsEditing(alerta.id);
    setFormData({
      titulo: alerta.titulo,
      descricao: alerta.descricao,
      importancia: alerta.importancia,
      isPublico: isPublic,
      destinatariosIds: idsExistentes
    });
    setShowForm(true);
    clearFeedback();
    window.scrollTo(0, 0);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setIsEditing(null);
    setFormData(initialFormData);
  };

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Função específica para alternar checkboxes de usuários
  const toggleDestinatario = (userId: number) => {
    setFormData(prev => {
      const exists = prev.destinatariosIds.includes(userId);
      let newIds;
      if (exists) {
        newIds = prev.destinatariosIds.filter(id => id !== userId);
      } else {
        newIds = [...prev.destinatariosIds, userId];
      }
      return { ...prev, destinatariosIds: newIds };
    });
  };

  // Alternar entre Público e Específico
  const handlePublicToggle = (e: ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setFormData(prev => ({
      ...prev,
      isPublico: isChecked,
      destinatariosIds: isChecked ? [] : prev.destinatariosIds // Limpa IDs se for público
    }));
  };

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

    // Se for público, enviamos array vazio (assumindo lógica do backend)
    // Se não for, enviamos os IDs selecionados
    const destinatariosPayload = formData.isPublico ? [] : formData.destinatariosIds;

    if (!formData.isPublico && destinatariosPayload.length === 0) {
      setError("Selecione ao menos um usuário ou marque como 'Todos (Público)'.");
      setIsSubmitting(false);
      return;
    }

    const body = {
      titulo: formData.titulo,
      descricao: formData.descricao,
      importancia: formData.importancia,
      destinatarios: destinatariosPayload, // Enviando array de IDs
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
      setShowForm(false);
      setIsEditing(null);
      setFormData(initialFormData);
      await fetchAlertas();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    // Nota: Removido verificação de criadorId aqui para simplificar, 
    // o backend deve validar se o usuário pode deletar.
    if (!confirm("Tem certeza que deseja excluir este aviso?")) return;

    clearFeedback();
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

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
      await fetchAlertas();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro ao remover.');
    }
  };

  const handleToggleConcluido = async (alerta: Alerta) => {
    clearFeedback();
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

    const newStatus = !alerta.concluido;

    try {
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
      await fetchAlertas();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro ao atualizar status.');
    }
  };

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
        <button className="btn-primary" onClick={handleAddClick} disabled={showForm}>
          + Adicionar Aviso
        </button>
      </div>

      {error && <p className="avisos-message avisos-error">{error}</p>}
      {success && <p className="avisos-message avisos-success">{success}</p>}

      {/* --- Formulário --- */}
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
              <label style={{ flex: '0 0 150px' }}>
                Importância:
                <select name="importancia" value={formData.importancia} onChange={handleFormChange}>
                  <option value={Importancia.BAIXA}>Baixa</option>
                  <option value={Importancia.MEDIA}>Média</option>
                  <option value={Importancia.ALTA}>Alta</option>
                </select>
              </label>
            </div>

            {/* Seção de Destinatários Melhorada */}
            <div className="destinatarios-section">
              <label>Destinatários:</label>

              <div style={{ marginBottom: '0.5rem' }}>
                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={formData.isPublico}
                    onChange={handlePublicToggle}
                  />
                  Todos (Aviso Público da Loja)
                </label>
              </div>

              {!formData.isPublico && (
                <div className="users-checklist">
                  {usuariosList.map((usuario) => (
                    <label key={usuario.id} className="user-checkbox-item">
                      <input
                        type="checkbox"
                        checked={formData.destinatariosIds.includes(usuario.id)}
                        onChange={() => toggleDestinatario(usuario.id)}
                      />
                      {usuario.nome}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar')}
              </button>
              <button type="button" className="btn-secondary" onClick={handleCancelForm} disabled={isSubmitting}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- Lista --- */}
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
              {sortedAlertas.map((alerta) => {
                const isPublic = !alerta.destinatarios || alerta.destinatarios.length === 0;
                return (
                  <div key={alerta.id} className={`aviso-card importancia-${alerta.importancia.toLowerCase()} ${alerta.concluido ? 'concluido' : ''}`}>
                    <div className="aviso-header">
                      <h3 className="aviso-title">{alerta.titulo}</h3>
                      <span className={`aviso-badge badge-${alerta.importancia.toLowerCase()}`}>{alerta.importancia}</span>
                    </div>

                    <p className="aviso-descricao">{alerta.descricao}</p>

                    <div className="aviso-footer">
                      <div className="aviso-meta">
                        <span className="aviso-creator">Por: <strong>{alerta.criadorNome}</strong></span>
                        <span className="aviso-date">{new Date(alerta.createdAt).toLocaleDateString()}</span>
                        <div className="aviso-targets" style={{ fontSize: '0.8rem', marginTop: '4px', color: 'var(--text-secondary)' }}>
                          {isPublic ? (
                            <span>🌍 Para: Todos (Público)</span>
                          ) : (
                            <span>👥 Para: {alerta.destinatarios.length} pessoa(s)</span>
                          )}
                        </div>
                      </div>

                      <div className="aviso-actions">
                        <button
                          className="btn-aviso btn-remover"
                          onClick={() => handleDelete(alerta.id)}
                          disabled={showForm}
                        >
                          Remover
                        </button>
                        <button
                          className="btn-aviso btn-editar"
                          onClick={() => handleEditClick(alerta)}
                          disabled={showForm || alerta.concluido}
                        >
                          Editar
                        </button>
                        <button
                          className={`btn-aviso btn-toggle-status ${alerta.concluido ? 'btn-reabrir' : 'btn-concluir'}`}
                          onClick={() => handleToggleConcluido(alerta)}
                        >
                          {alerta.concluido ? 'Reabrir' : 'Concluir'}
                        </button>
                      </div>
                    </div>
                    {alerta.finishedAt && (
                      <span className="aviso-finished-date">
                        Concluído em: {new Date(alerta.finishedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
}