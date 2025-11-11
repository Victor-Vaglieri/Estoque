"use client";

import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
// Importa o CSS 
import './legacy.css';
// import { useAuth } from '@/app/context/AuthContext'; // Descomente quando integrar
// import { useRouter } from 'next/navigation'; // Descomente quando integrar

// --- Constantes (do seu script.js) ---
const CAMPOS_FIXOS = {
    "Costura": ["ROL", "Cliente", "Meio de Contato Inicial", "Data de Entrada", "Data de Confirmação", "Previsão de entrega", "Data da entrega", "Método de Entrega"],
    "Tingimento": ["ROL", "Cliente", "Meio de Contato Inicial", "Data de Entrada", "Data de Confirmação", "Previsão de entrega", "Data da entrega", "Método de Entrega"],
    "Tapete": ["ROL", "O.S. Master", "Cliente", "Meio de Contato Inicial", "Data de Entrada", "Data de Confirmação", "Previsão de entrega", "Data da entrega", "Método de Entrega"]
};

const CAMPOS_MULTIPLOS = {
    "Costura": ["Ticket", "Peça", "Descrição do serviço", "Custo", "Cobrado"],
    "Tingimento": ["Strip Tag", "Número Washtec", "Peça", "Cor desejada", "Valor Washtec", "Valor cobrado"],
    "Tapete": ["Strip Tag Dryclean", "Strip Tag Master", "Valor Master", "Valor cobrado"]
};

type TipoServico = 'Costura' | 'Tingimento' | 'Tapete';
type RecordString = Record<string, string | number>; // Permite números para ROL, etc.
type RegistroCompleto = {
    id: number;
    rol: number;
    cliente: string;
    data_de_entrada: string;
    previsao_de_entrega: string; // Adicionado para a tabela
    [key: string]: any;
};


// --- Funções Auxiliares (Melhor Prática) ---

const normalizeKey = (label: string): string => {
    return label
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9_ ]/g, '')
        .trim()
        .replace(/\s+/g, '_');
};

const getInitialFixedState = (tipo: TipoServico): RecordString => {
    return CAMPOS_FIXOS[tipo].reduce((acc, label) => {
        acc[normalizeKey(label)] = '';
        return acc;
    }, {} as RecordString);
};

const getInitialMultipleRow = (tipo: TipoServico): RecordString => {
    return CAMPOS_MULTIPLOS[tipo].reduce((acc, label) => {
        acc[normalizeKey(label)] = '';
        return acc;
    }, {} as RecordString);
};

// --- Componente de Navegação ---
interface LegacyNavProps {
    tipoAtual: TipoServico;
    onTipoChange: (tipo: TipoServico) => void;
    onToggleMenu: () => void;
    isMenuOpen: boolean;
}

const LegacyNav: React.FC<LegacyNavProps> = ({ tipoAtual, onTipoChange, onToggleMenu, isMenuOpen }) => {
    return (
        <nav className="opcoes">
            <button className="burger" aria-label="Menu" onClick={onToggleMenu}>
                &#9776;
            </button>
            <div className={`menu ${isMenuOpen ? 'show' : ''}`}>
                {(['Costura', 'Tingimento', 'Tapete'] as TipoServico[]).map((tipo) => (
                    <button
                        key={tipo}
                        type="button"
                        onClick={() => onTipoChange(tipo)}
                        className={`tipo-btn ${tipoAtual === tipo ? 'ativo' : ''}`}
                    >
                        {tipo}
                    </button>
                ))}
            </div>
        </nav>
    );
};


// --- Componente Principal da Página ---
export default function LegacyFormPage() {

    // --- Estados ---
    const [tipoAtual, setTipoAtual] = useState<TipoServico>('Costura');
    const [fixedData, setFixedData] = useState<RecordString>(() => getInitialFixedState(tipoAtual));
    const [multipleData, setMultipleData] = useState<RecordString[]>(() => [getInitialMultipleRow(tipoAtual)]);
    
    // --- NOVOS ESTADOS ---
    const [allRegistros, setAllRegistros] = useState<RegistroCompleto[]>([]); // Lista para a tabela
    const [isListLoading, setIsListLoading] = useState(false); // Loading da tabela

    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Loading da pesquisa
    const [isSaving, setIsSaving] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // --- Handlers de Ações ---

    const resetForm = useCallback(() => {
        setFixedData(getInitialFixedState(tipoAtual));
        setMultipleData([getInitialMultipleRow(tipoAtual)]);
        setIsEditing(false);
        setIsMenuOpen(false);
    }, [tipoAtual]);

    const handleFixedChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFixedData(prev => ({ ...prev, [name]: value }));
    };

    const handleMultipleChange = (e: ChangeEvent<HTMLInputElement>, rowIndex: number) => {
        const { name, value } = e.target;
        setMultipleData(prev =>
            prev.map((row, i) =>
                i === rowIndex ? { ...row, [name]: value } : row
            )
        );
    };

    const adicionarLinha = () => {
        setMultipleData(prev => [...prev, getInitialMultipleRow(tipoAtual)]);
    };

    const removerLinha = (rowIndex: number) => {
        setMultipleData(prev => prev.filter((_, i) => i !== rowIndex));
    };

    // --- NOVA FUNÇÃO ---
    /**
     * Busca todos os registros para o tipo atual (para preencher a tabela)
     */
    const fetchAllRegistros = useCallback(async (tipo: TipoServico) => {
        setIsListLoading(true);
        // Garante que o tipo esteja em minúsculas para a URL
        const url = `${process.env.NEXT_PUBLIC_API_URL}/legacy/${tipo.toLowerCase()}`;
        try {
            // const token = localStorage.getItem('token');
            const res = await fetch(url, {
                headers: { 
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}` 
                },
            });
            if (!res.ok) throw new Error('Falha ao buscar registros');
            
            // Assume que a API (sem ROL) retorna um array de registros
            const data: RegistroCompleto[] = await res.json(); 
            setAllRegistros(data);
        } catch (err) {
            alert(`Erro ao carregar lista: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsListLoading(false);
        }
    }, []); // Dependência vazia, mas será chamado pelo useEffect

    // --- Efeitos ---
    useEffect(() => {
        resetForm();
        fetchAllRegistros(tipoAtual); // ATUALIZADO: Busca a lista ao trocar de tipo
    }, [tipoAtual, resetForm, fetchAllRegistros]);


    // --- ⭐️ NOVA FEATURE: Auto-incremento do ROL ---
    // Este efeito roda DEPOIS que a lista de registros é carregada
    useEffect(() => {
        
        // Só executa se NÃO estivermos editando e DEPOIS que a lista terminar de carregar
        if (!isEditing && !isListLoading) {
            
            // 1. Encontra o ROL máximo na lista
            // Usamos reduce. Se a lista estiver vazia, maxRol será 0.
            const maxRol = allRegistros.reduce((max, r) => (r.rol > max ? r.rol : max), 0);
            
            // 2. Calcula o próximo ROL (será 1 se a lista estiver vazia)
            const nextRol = maxRol + 1;
            
            // 3. Define o ROL no estado do formulário
            const rolKey = normalizeKey("ROL");
            
            // Atualiza o ROL no estado
            setFixedData(prev => {
                // Evita um re-render desnecessário se o valor já for o correto
                if (prev[rolKey] !== nextRol) {
                    return { ...prev, [rolKey]: nextRol };
                }
                return prev;
            });
        }
    // Depende da lista, do modo de edição e do status de carregamento
    }, [allRegistros, isEditing, isListLoading]);


    // --- Handlers de API (Fetch) ---

    // --- LÓGICA DE PESQUISA REATORADA ---
    /**
     * Lógica centralizada para carregar dados de um ROL no formulário
     */
    const loadRegistroByRol = async (rolToSearch: string | number) => {
        if (!rolToSearch) {
            alert("ROL inválido.");
            return;
        }

        setIsLoading(true);
        const url = `${process.env.NEXT_PUBLIC_API_URL}/legacy/${tipoAtual.toLowerCase()}?rol=${rolToSearch}`;

        try {
            // const token = localStorage.getItem('token');
            const res = await fetch(url, {
                headers: { 'Content-Type': 'application/json', /* 'Authorization': `Bearer ${token}` */ },
            });

            if (!res.ok) {
                if (res.status === 404) {
                    alert("ROL não encontrado. Você pode criar um novo.");
                    setIsEditing(false);
                } else {
                    throw new Error(`Erro ${res.status}: ${await res.text()}`);
                }
                return; // Importante parar aqui se não encontrou
            }

            const data = await res.json(); // API retorna { fixos: {}, multiplos: [{}] }
            
            // --- ⭐️ CORREÇÃO DO BUG DA DATA AQUI ⭐️ ---

            // 1. Pega as chaves dos campos que são datas
            const dateKeys = CAMPOS_FIXOS[tipoAtual]
                .filter(label => label.includes("Data") || label.includes("Previsão"))
                .map(label => normalizeKey(label)); // ex: ['data_de_entrada', 'previsao_de_entrega', ...]

            // 2. Cria uma cópia dos dados fixos para formatar
            const formattedFixos = { ...data.fixos };

            // 3. Itera sobre as chaves de data e formata a string
            for (const key of dateKeys) {
                const isoString = formattedFixos[key] as string;
                
                if (isoString) { // Verifica se a data não é nula ou vazia
                    try {
                        // Converte "2025-11-04T00:00:00.000Z" para "2025-11-04"
                        formattedFixos[key] = new Date(isoString).toISOString().split('T')[0];
                    } catch (e) {
                        console.error(`Formato de data inválido para ${key}: ${isoString}`);
                        formattedFixos[key] = ''; // Define como vazio se a data for inválida
                    }
                } else {
                    formattedFixos[key] = ''; // Garante que valores nulos virem string vazia
                }
            }
            // --- Fim da Correção ---

            // 4. Salva os dados JÁ FORMATADOS no estado
            setFixedData(formattedFixos);
            setMultipleData(data.multiplos.length > 0 ? data.multiplos : [getInitialMultipleRow(tipoAtual)]);
            setIsEditing(true);
            alert("Registro carregado para edição.");
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Rola para o topo

        } catch (err) {
            alert(`Erro ao pesquisar: ${err instanceof Error ? err.message : String(err)}`);
            setIsEditing(false);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Ação do botão "Pesquisar"
     */
    const handleSearch = () => {
        const rolKey = normalizeKey("ROL");
        const rol = fixedData[rolKey];
        loadRegistroByRol(rol as string);
    };

    /**
     * Salva um registro (novo ou editado) no backend
     */
    const handleSave = async () => {
        setIsSaving(true);
        const url = `${process.env.NEXT_PUBLIC_API_URL}/legacy/${tipoAtual.toLowerCase()}`;
        const method = isEditing ? 'PUT' : 'POST';

        const multiplosFiltrados = multipleData.filter(row =>
            Object.values(row).some(cell => String(cell).trim() !== '')
        );

        const payload = {
            fixos: fixedData,
            multiplos: multiplosFiltrados,
        };

        try {
            // const token = localStorage.getItem('token'); 
            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Erro desconhecido ao salvar");

            alert(`Dados ${isEditing ? 'editados' : 'salvos'} com sucesso!`);
            resetForm(); 
        } catch (err) {
            alert(`Erro ao salvar: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsSaving(false);
            fetchAllRegistros(tipoAtual); // ATUALIZADO: Recarrega a lista após salvar
        }
    };

    // --- Renderização ---
    const currentFixedLabels = CAMPOS_FIXOS[tipoAtual];
    const currentMultipleLabels = CAMPOS_MULTIPLOS[tipoAtual];
    
    // Formata data para a tabela
    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        try {
            // Assegura que a data seja tratada como UTC
            return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        } catch (e) {
            return dateString;
        }
    };

    return (
        <section className="parent">
            <LegacyNav
                tipoAtual={tipoAtual}
                onTipoChange={setTipoAtual}
                isMenuOpen={isMenuOpen}
                onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
            />

            {/* --- Card de Campos Fixos --- */}
            <section className="div-fixos">
                <h2 className="section-title">
                    {isEditing ? `Editando ROL: ${fixedData.rol}` : 'Criar Novo Registro'}
                </h2>
                <div className="linha-fixos">
                    {currentFixedLabels.map((label) => {
                        const key = normalizeKey(label);
                        const isDateField = label.includes("Data") || label.includes("Previsão");
                        const isRolField = label.includes("ROL");

                        if (isRolField) {
                            return (
                                <div key={key} className="div-rol">
                                    <label htmlFor={key}>{label}:</label>
                                    <input
                                        type="number"
                                        id={key}
                                        name={key}
                                        value={fixedData[key] || ''}
                                        onChange={handleFixedChange}
                                        disabled={isLoading || isEditing} // Desabilita se estiver editando
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSearch}
                                        disabled={isLoading}
                                        className="button-rol"
                                    >
                                        {isLoading ? '...' : 'Pesquisar'}
                                    </button>
                                </div>
                            );
                        }

                        return (
                            <div key={key} className="campo-fixo">
                                <label htmlFor={key}>{label}:</label>
                                <input
                                    type={isDateField ? 'date' : 'text'}
                                    id={key}
                                    name={key}
                                    value={fixedData[key] || ''}
                                    onChange={handleFixedChange}
                                />
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* --- Card de Campos Múltiplos --- */}
            <section className="div-multiplos">
                <h2 className="section-title">Itens do Registro</h2>
                <div className="table-wrapper">
                    <table id="tabelaMultiplos">
                        <thead>
                            <tr>
                                {currentMultipleLabels.map((label) => (
                                    <th key={label}>{label}</th>
                                ))}
                                <th className="col-acao"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {multipleData.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {currentMultipleLabels.map((label) => {
                                        const key = normalizeKey(label);
                                        const isNumeric = label.includes("Custo") || label.includes("Cobrado") || label.includes("Valor") || label.includes("Ticket");
                                        return (
                                            <td key={key} data-label={label}>
                                                <input
                                                    type={isNumeric ? 'number' : 'text'}
                                                    step={isNumeric ? '0.01' : undefined}
                                                    name={key}
                                                    placeholder={isNumeric ? '0,00' : label}
                                                    value={row[key] || ''}
                                                    onChange={(e) => handleMultipleChange(e, rowIndex)}
                                                />
                                            </td>
                                        );
                                    })}
                                    <td className="col-acao" data-label="Ação">
                                        {multipleData.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removerLinha(rowIndex)}
                                                title="Remover linha"
                                                className="button-remover"
                                            >
                                                X
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div className="form-actions">
                    <button type="button" id="addLinha" onClick={adicionarLinha}>
                        + Adicionar Linha
                    </button>

                    <button
                        type="button"
                        id="salvar"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Salvando...' : (isEditing ? 'Atualizar Registro' : 'Salvar Novo Registro')}
                    </button>
                </div>
            </section>

            {/* --- NOVA SEÇÃO: LISTA DE REGISTROS --- */}
            <section className="div-multiplos div-lista">
                <h2 className="section-title">Registros Salvos ({tipoAtual})</h2>
                <div className="table-wrapper">
                    <table id="tabelaRegistros">
                        <thead>
                            <tr>
                                <th>ROL</th>
                                <th>Cliente</th>
                                <th>Data Entrada</th>
                                <th>Previsão Entrega</th>
                                <th className="col-acao">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isListLoading ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center' }}>Carregando...</td>
                                </tr>
                            ) : allRegistros.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center' }}>Nenhum registro encontrado.</td>
                                </tr>
                            ) : (
                                allRegistros.map((reg) => (
                                    <tr key={reg.id}>
                                        <td data-label="ROL">{reg.rol}</td>
                                        <td data-label="Cliente">{reg.cliente || '-'}</td>
                                        <td data-label="Data Entrada">{formatDate(reg.data_de_entrada)}</td>
                                        <td data-label="Previsão Entrega">{formatDate(reg.previsao_de_entrega)}</td>
                                        <td className="col-acao" data-label="Ação">
                                            <button
                                                type="button"
                                                className="button-editar"
                                                onClick={() => loadRegistroByRol(reg.rol)}
                                                disabled={isLoading || isSaving}
                                            >
                                                Editar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </section>
    );
}