"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

import './compras.css';

interface ProductToBuy {
  nome: string;
  id: number;
  unidade: string;
  marca: string | null;
  quantidadeMin: number;
  quantidadeEst: number;
  quantidadeMax: number;
  quantidadePendenteFaltante: number;
  fornecedor: {
    id: number;
    nome: string;
  };
}

type GroupedProducts = Record<string, ProductToBuy[]>;

export default function ComprasPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [productsToBuy, setProductsToBuy] = useState<GroupedProducts>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Armazena os preços digitados: { [produtoId]: "15.50" }
  const [priceInputs, setPriceInputs] = useState<Record<number, string>>({});

  // Controla qual fornecedor está enviando dados (loading state)
  const [submittingSupplier, setSubmittingSupplier] = useState<string | null>(null);

  const clearFeedback = () => {
    setError(null);
    setSuccess(null);
  };

  const fetchProductsToBuy = async () => {
    setIsLoading(true);
    clearFeedback();
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/compras/lista`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Falha ao carregar a lista de compras.');

      const data: GroupedProducts = await response.json();
      setProductsToBuy(data);
      setPriceInputs({}); // Limpa inputs ao recarregar
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      if (!user.funcoes.some((f: string) => f === 'LISTA' || f === 'GESTOR')) {
        router.push('/inicio');
        return;
      }
    }
    fetchProductsToBuy();
  }, [user, router]);

  const handlePriceChange = (productId: number, value: string) => {
    setPriceInputs((prev) => ({ ...prev, [productId]: value }));
  };

  const handleBulkSubmit = async (fornecedorNome: string, products: ProductToBuy[]) => {
    clearFeedback();
    setSubmittingSupplier(fornecedorNome);

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // 1. Filtra apenas o que precisa ser comprado
    const itemsToBuy = products
      .map((p) => {
        const needed = Math.max(0, p.quantidadeMax - p.quantidadeEst - p.quantidadePendenteFaltante);
        return { ...p, neededQuantity: needed };
      })
      .filter((p) => p.neededQuantity > 0);

    if (itemsToBuy.length === 0) {
      setError('Não há itens com necessidade de reposição para este fornecedor.');
      setSubmittingSupplier(null);
      return;
    }

    // 2. Valida se os preços foram preenchidos
    const missingPrices = itemsToBuy.filter(
      (p) => !priceInputs[p.id] || parseFloat(priceInputs[p.id]) <= 0
    );

    if (missingPrices.length > 0) {
      setError(
        `Por favor, preencha o preço para: ${missingPrices.map((p) => p.nome).join(', ')}`
      );
      setSubmittingSupplier(null);
      return;
    }

    try {
      // 3. Envia requisições em paralelo
      const promises = itemsToBuy.map((product) => {
        const payload = {
          productId: product.id,
          quantidade: product.neededQuantity,
          precoTotal: parseFloat(priceInputs[product.id]),
        };

        return fetch(`${process.env.NEXT_PUBLIC_API_URL}/compras/registrar`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).then(async (res) => {
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || `Erro em ${product.nome}`);
          }
          return res.json();
        });
      });

      await Promise.all(promises);

      setSuccess(`Pedido para ${fornecedorNome} enviado com sucesso!`);
      await fetchProductsToBuy();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Ocorreu um erro ao processar o pedido em massa.'
      );
    } finally {
      setSubmittingSupplier(null);
    }
  };

  const hasProductsToBuy = useMemo(
    () => Object.keys(productsToBuy).length > 0,
    [productsToBuy]
  );

  return (
    <>
      <div className="page-header-produtos">
        <h1 className="page-title-produtos">Lista de Compras (Cotação)</h1>
      </div>

      {error && <p className="compras-message compras-error">{error}</p>}
      {success && <p className="compras-message compras-success">{success}</p>}

      {isLoading && <p>Carregando lista...</p>}

      {!isLoading && !hasProductsToBuy && (
        <div className="compras-container" style={{ textAlign: 'center' }}>
          <h2 className="compras-title">Estoque Completo!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Nenhum produto precisa ser comprado no momento.
          </p>
        </div>
      )}

      {!isLoading && hasProductsToBuy && (
        <div className="fornecedor-sections-container">
          {Object.entries(productsToBuy).map(([fornecedorNome, products]) => {
            // Verifica se há itens compráveis para habilitar o botão
            const hasItemsToBuy = products.some(
              (p) => p.quantidadeMax - p.quantidadeEst - p.quantidadePendenteFaltante > 0
            );

            return (
              <section key={fornecedorNome} className="fornecedor-section">
                <h2 className="fornecedor-title">{fornecedorNome}</h2>

                <div className="compras-grid">
                  {products.map((product) => {
                    const neededQuantity = Math.max(
                      0,
                      product.quantidadeMax - product.quantidadeEst - product.quantidadePendenteFaltante
                    );

                    return (
                      <div key={product.id} className="compras-container">
                        <h2 className="compras-title">{product.nome}</h2>
                        
                        <div className="compras-details">
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            <span>Marca: {product.marca || '-'}</span>
                            <span>Un: {product.unidade}</span>
                          </div>

                          <div className="info-grid">
                            <div className="info-box">
                              <small>Atual</small>
                              <strong>{product.quantidadeEst}</strong>
                            </div>
                            <div className="info-box">
                              <small>Máximo</small>
                              <strong>{product.quantidadeMax}</strong>
                            </div>
                          </div>

                          <div className="compras-pending-info">
                            {product.quantidadePendenteFaltante > 0 && (
                              <p style={{ color: '#eab308', fontWeight: 'bold', fontSize: '0.8rem' }}>
                                (Pendente: {product.quantidadePendenteFaltante})
                              </p>
                            )}
                          </div>

                          {neededQuantity > 0 ? (
                            <div className="compras-action-area">
                              <p className="compras-needed">
                                Comprar: <strong>{neededQuantity} {product.unidade}</strong>
                              </p>
                              
                              <label className="price-label">Preço Total (R$):</label>
                              <input
                                type="number"
                                className="price-input"
                                placeholder="0.00"
                                value={priceInputs[product.id] || ''}
                                onChange={(e) => handlePriceChange(product.id, e.target.value)}
                                min="0"
                                step="0.01"
                              />
                            </div>
                          ) : (
                            <p className="compras-waiting-message">
                              Aguardando entrega.
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* BOTÃO GERAL DO FORNECEDOR */}
                <div className="fornecedor-footer">
                  <div className="summary-text">
                    Preencha os preços unitários acima e confirme o envio.
                  </div>
                  <button
                    className="btn-primary btn-large"
                    onClick={() => handleBulkSubmit(fornecedorNome, products)}
                    disabled={!hasItemsToBuy || submittingSupplier === fornecedorNome}
                  >
                    {submittingSupplier === fornecedorNome
                      ? 'Enviando...'
                      : `Confirmar Pedido (${fornecedorNome})`}
                  </button>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}