"use client";

import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

import './legacy.css';

const CAMPOS_FIXOS = {
    "Costura": ["ROL", "Nome Cliente", "Meio de Contato", "Data Recebimento", "Data da entrega"],
    "Tingimento": ["ROL", "Nome Cliente", "Meio de Contato", "Data Recebimento", "Envio a Washtec", "Retorno da Washtec", "Data da entrega"],
    "Tapete": ["ROL", "Nome Cliente", "Meio de Contato", "Data Recebimento", "O.S. Master", "Envio a Master", "Retorno da Master", "Data da entrega"],
    "Mala": ["ROL", "Nome Cliente", "Meio de Contato", "Data Recebimento", "O.S. Master", "Envio a Master", "Retorno da Master", "Data da entrega"]
};

const CAMPOS_MULTIPLOS = {
    "Costura": ["Ticket", "Peça", "Descrição do serviço", "Custo", "Cobrado"],
    "Tingimento": ["Strip Tag", "Número Washtec", "Peça", "Cor desejada", "Valor Washtec", "Valor cobrado"],
    "Tapete": ["Strip Tag Dryclean", "Strip Tag Master", "Valor Master", "Valor cobrado"],
    "Mala": ["Strip Tag Dryclean", "Strip Tag Master", "Valor Master", "Valor cobrado"]
};

type TipoServico = 'Costura' | 'Tingimento' | 'Tapete' | 'Mala';
type RecordString = Record<string, string | number>;

type RegistroCompleto = {
    id: number;
    rol: number;
    nome_cliente: string;
    data_recebimento: string;
    data_da_entrega: string;
    [key: string]: any;
};

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
                { }
                {(['Costura', 'Tingimento', 'Tapete', 'Mala'] as TipoServico[]).map((tipo) => (
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



export default function LegacyFormPage() {


    const [tipoAtual, setTipoAtual] = useState<TipoServico>('Costura');
    const [fixedData, setFixedData] = useState<RecordString>(() => getInitialFixedState(tipoAtual));
    const [multipleData, setMultipleData] = useState<RecordString[]>(() => [getInitialMultipleRow(tipoAtual)]);

    const [allRegistros, setAllRegistros] = useState<RegistroCompleto[]>([]);
    const [isListLoading, setIsListLoading] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const { user } = useAuth();
    const router = useRouter();



    const resetForm = useCallback(() => {
        setFixedData(getInitialFixedState(tipoAtual));
        setMultipleData([getInitialMultipleRow(tipoAtual)]);
        setIsEditing(false);
        setIsMenuOpen(false);
    }, [tipoAtual]);

    const handleFixedChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    
    

    const fetchAllRegistros = useCallback(async (tipo: TipoServico) => {
        setIsListLoading(true);

        const url = `${process.env.NEXT_PUBLIC_API_URL}/legacy/${tipo.toLowerCase()}`;
        try {
            
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            const res = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            if (!res.ok) throw new Error('Falha ao buscar registros');


            const data: RegistroCompleto[] = await res.json();
            setAllRegistros(data);
        } catch (err) {
            alert(`Erro ao carregar lista: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsListLoading(false);
        }
    }, [router]); 

    useEffect(() => {
        if (user) {
            if (!user.funcoes.some((f: string) => f === 'TERCEIROS' || f === 'GESTOR')) {
                router.push('/inicio');
                return;
            }
        }
        resetForm();
        fetchAllRegistros(tipoAtual);
    }, [tipoAtual, resetForm, fetchAllRegistros, user, router]); 


    useEffect(() => {


        if (!isEditing && !isListLoading) {
            const maxRol = allRegistros.reduce((max, r) => (r.rol > max ? r.rol : max), 0);
            const nextRol = maxRol + 1;
            const rolKey = normalizeKey("ROL");

            setFixedData(prev => {

                if (prev[rolKey] !== nextRol) {
                    return { ...prev, [rolKey]: nextRol };
                }
                return prev;
            });
        }

    }, [allRegistros, isEditing, isListLoading]);


    const loadRegistroByRol = async (rolToSearch: string | number) => {
        if (!rolToSearch) {
            alert("ROL inválido.");
            return;
        }

        setIsLoading(true);
        const url = `${process.env.NEXT_PUBLIC_API_URL}/legacy/${tipoAtual.toLowerCase()}?rol=${rolToSearch}`;

        try {
            
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }
            
            const res = await fetch(url, {
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            });

            if (!res.ok) {
                if (res.status === 404) {
                    alert("ROL não encontrado. Você pode criar um novo.");
                    setIsEditing(false);
                } else {
                    throw new Error(`Erro ${res.status}: ${await res.text()}`);
                }
                return;
            }
            const data = await res.json();
            const dateKeys = CAMPOS_FIXOS[tipoAtual]

                .filter(label => label.includes("Data") || label.includes("Envio") || label.includes("Retorno"))
                .map(label => normalizeKey(label));


            const formattedFixos = { ...data.fixos };

            for (const key of dateKeys) {
                const isoString = formattedFixos[key] as string;

                if (isoString) {
                    try {

                        formattedFixos[key] = new Date(isoString).toISOString().split('T')[0];
                    } catch (e) {
                        console.error(`Formato de data inválido para ${key}: ${isoString}`);
                        formattedFixos[key] = '';
                    }
                } else {
                    formattedFixos[key] = '';
                }
            }

            setFixedData(formattedFixos);
            setMultipleData(data.multiplos.length > 0 ? data.multiplos : [getInitialMultipleRow(tipoAtual)]);
            setIsEditing(true);
            alert("Registro carregado para edição.");
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (err) {
            alert(`Erro ao pesquisar: ${err instanceof Error ? err.message : String(err)}`);
            setIsEditing(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = () => {
        const rolKey = normalizeKey("ROL");
        const rol = fixedData[rolKey];
        loadRegistroByRol(rol as string);
    };

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
            
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                setIsSaving(false); 
                return;
            }
            
            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`

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
            fetchAllRegistros(tipoAtual);
        }
    };

    const currentFixedLabels = CAMPOS_FIXOS[tipoAtual];
    const currentMultipleLabels = CAMPOS_MULTIPLOS[tipoAtual];
    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        try {

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

            { }
            <section className="div-fixos">
                <h2 className="section-title">
                    {isEditing ? `Editando ROL: ${fixedData.rol}` : 'Criar Novo Registro'}
                </h2>
                <div className="linha-fixos">
                    {currentFixedLabels.map((label) => {
                        const key = normalizeKey(label);

                        const isDateField = label.includes("Data") || label.includes("Envio") || label.includes("Retorno");
                        const isRolField = label.includes("ROL");
                        const isContatoField = label.includes("Meio de Contato");

                        if (isRolField) {
                            return (
                                <div key={key} className="div-rol">
                                    <label htmlFor={key}>{label}:</label>
                                    <input
                                        type="number"
                                        id={key}
                                        name={key}
                                        onChange={handleFixedChange}
                                        disabled={isLoading || isEditing}
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

                        
                        if (isContatoField) {
                             return (
                                <div key={key} className="campo-fixo">
                                    <label htmlFor={key}>{label}:</label>
                                    <select
                                        id={key}
                                        name={key}
                                        value={fixedData[key] || ''}
                                        onChange={handleFixedChange}
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="GOOGLE">Google</option>
                                        <option value="REDE_SOCIAL">Rede Social</option>
                                        <option value="AMIGOS">Amigos</option>
                                        <option value="LOJA">Loja</option>
                                        <option value="OUTROS">Outros</option>
                                    </select>
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

            { }
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

            { }
            <section className="div-multiplos div-lista">
                <h2 className="section-title">Registros Salvos ({tipoAtual})</h2>
                <div className="table-wrapper">
                    <table id="tabelaRegistros">
                        <thead>
                            <tr>
                                <th>ROL</th>
                                <th>Cliente</th>
                                <th>Data Recebimento</th>
                                <th>Data da Entrega</th>
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
                                        <td data-label="Cliente">{reg.nome_cliente || '-'}</td>
                                        <td data-label="Data Recebimento">{formatDate(reg.data_recebimento)}</td>
                                        <td data-label="Data da Entrega">{formatDate(reg.data_da_entrega)}</td>
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