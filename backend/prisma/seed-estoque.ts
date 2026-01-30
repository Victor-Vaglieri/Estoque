import { PrismaClient } from '@prisma/estoque-client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Semeando banco ESTOQUE (Neon/Postgres)...');

  // ------------------------------------------------------------
  // 1. LIMPEZA DE DADOS
  // ------------------------------------------------------------
  console.log('🧹 Limpando tabelas e resetando IDs...');

  const tablenames = [
    'CompraDistribuicao',
    'HistoricoCompra',
    'HistoricoPreco',
    'Entrada',
    'Saida',
    'EstoqueLoja',
    'LojaNecessitaProduto',
    'Produto',
    'Fornecedor',
    'Loja',
  ];

  for (const table of tablenames) {
    try {
      // O comando TRUNCATE ... RESTART IDENTITY reseta os IDs auto-increment para 1
      await prisma.$executeRawUnsafe(
        `TRUNCATE TABLE "estoque"."${table}" RESTART IDENTITY CASCADE;`
      );
    } catch (error) {
      console.log(`⚠️ Erro ao limpar ${table}: ${error}`);
    }
  }

  console.log('✨ Banco limpo e IDs zerados.');

  // ------------------------------------------------------------
  // 2. CRIAÇÃO DE LOJAS E FORNECEDORES
  // ------------------------------------------------------------

  const lojasIds: number[] = [];
  console.log('🏪 Criando 4 Lojas...');
  for (let i = 1; i <= 4; i++) {
    const loja = await prisma.loja.create({
      data: { nome: `Loja ${i}` },
    });
    lojasIds.push(loja.id);
  }

  const fornecedoresIds: number[] = [];
  console.log('🚚 Criando 4 Fornecedores...');
  for (let i = 1; i <= 4; i++) {
    const forn = await prisma.fornecedor.create({
      data: { nome: `Fornecedor ${i}` },
    });
    fornecedoresIds.push(forn.id);
  }

  // ------------------------------------------------------------
  // 3. CRIAÇÃO DE 4 PRODUTOS "STANDARD" COM ESTOQUE ZERADO
  // ------------------------------------------------------------
  console.log('📦 Criando 4 Produtos Padrão e inicializando estoques zerados...');

  const itensStandard = [
    { nome: 'Item Padrão A', codigo: 'STD-001', marca: 'Marca Alpha', unidade: 'UN' },
    { nome: 'Item Padrão B', codigo: 'STD-002', marca: 'Marca Beta', unidade: 'KG' },
    { nome: 'Item Padrão C', codigo: 'STD-003', marca: 'Marca Gamma', unidade: 'MT' },
    { nome: 'Item Padrão D', codigo: 'STD-004', marca: 'Marca Delta', unidade: 'PC' },
  ];

  for (let i = 0; i < itensStandard.length; i++) {
    const itemInfo = itensStandard[i];
    // Distribui fornecedores sequencialmente (0, 1, 2, 3)
    const fornecedorId = fornecedoresIds[i % 4]; 
    
    // Cria o produto
    const produto = await prisma.produto.create({
      data: {
        nome: itemInfo.nome,
        codigo: itemInfo.codigo,
        unidade: itemInfo.unidade,
        marca: itemInfo.marca,
        corredor: `C-0${i + 1}`,
        producao: false, // Produtos padrão geralmente comprados
        quantidadeMin: 10,
        quantidadeMax: 100,
        ativo: true,
        observacoes: 'Item padrão de teste inicial.',
        fornecedorId: fornecedorId,
      },
    });

    // Cria um preço inicial histórico (obrigatório para lógica de compras/valor)
    await prisma.historicoPreco.create({
      data: {
        produtoId: produto.id,
        preco: 20.00, // Preço fixo inicial
        data: new Date(),
      }
    });

    // Cria a relação de estoque para TODAS as lojas com quantidade 0
    for (const lojaId of lojasIds) {
      await prisma.estoqueLoja.create({
        data: {
          produtoId: produto.id,
          lojaId: lojaId,
          quantidadeEst: 0, // <--- AQUI ESTÁ O "LIMPO E RESETADO"
        },
      });
    }
  }

  console.log('✅ Seed ESTOQUE finalizado: 4 Lojas, 4 Fornecedores, 4 Itens (Estoques zerados).');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });