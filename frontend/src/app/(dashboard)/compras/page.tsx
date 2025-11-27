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

  // Controla qual fornecedor está enviando dados (loading state)
  const [submittingSupplier, setSubmittingSupplier] = useState<string | null>(null);

  const clearFeedback = () => {
    setError(null);
    setSuccess(null);
  };

  const fetchProductsToBuy = async () => {
    setIsLoading(true);
    clearFeedback();
    const token = sessionStorage.getItem('token');
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

  const handleBulkSubmit = async (fornecedorNome: string, products: ProductToBuy[]) => {
    clearFeedback();
    setSubmittingSupplier(fornecedorNome);

    const token = sessionStorage.getItem('token');
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

    // REMOVIDO: Validação de preços (não é mais necessário)

    try {
      // 2. Envia requisições em paralelo
      const promises = itemsToBuy.map((product) => {
        const payload = {
          productId: product.id,
          quantidade: product.neededQuantity,
          precoTotal: 0, // Enviando 0 pois o preço será definido no recebimento ou é irrelevante agora
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
        <h1 className="page-title-produtos">Lista de Compras (Automática)</h1>
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

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                            <div style={{ background: 'var(--background-page)', padding: '4px', borderRadius: '4px' }}>
                              <small>Atual</small><br />
                              <strong>{product.quantidadeEst}</strong>
                            </div>
                            <div style={{ background: 'var(--background-page)', padding: '4px', borderRadius: '4px' }}>
                              <small>Máximo</small><br />
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
                            <div style={{ marginTop: '1rem', borderTop: '1px dashed var(--border-color)', paddingTop: '1rem' }}>
                              <p className="compras-needed" style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
                                Comprar: <strong>{neededQuantity} {product.unidade}</strong>
                              </p>
                            </div>
                          ) : (
                            <p className="compras-waiting-message" style={{ marginTop: '1rem' }}>
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
                    Confirme o envio do pedido de reposição automática.
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