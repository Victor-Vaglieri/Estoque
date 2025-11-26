import { PrismaClient } from '@prisma/estoque-client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Semeando banco ESTOQUE (Neon/Postgres)...');

  
  
  
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
      
      
      
      
      await prisma.$executeRawUnsafe(
        `TRUNCATE TABLE "estoque"."${table}" RESTART IDENTITY CASCADE;`
      );
    } catch (error) {
      console.log(`⚠️ Erro ao limpar ${table}: ${error}`);
    }
  }

  console.log('✨ Banco limpo e IDs zerados.');

  
  
  

  
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

  
  console.log('📦 Criando 12 Produtos e distribuindo estoques...');
  
  for (let i = 1; i <= 12; i++) {
    const fornecedorId = fornecedoresIds[(i - 1) % 4];
    const isProducao = i % 3 === 0; 
    
    const produto = await prisma.produto.create({
      data: {
        nome: `Produto ${i}`,
        codigo: `PROD-${i.toString().padStart(3, '0')}`,
        unidade: 'UN',
        marca: `Marca ${(i % 2) + 1}`,
        corredor: `C-${i}`,
        producao: isProducao,
        quantidadeMin: 10,
        quantidadeMax: 100,
        ativo: true,
        observacoes: `Produto teste gerado automaticamente.`,
        fornecedorId: fornecedorId,
      },
    });

    
    await prisma.historicoPreco.create({
      data: {
        produtoId: produto.id,
        preco: Math.floor(Math.random() * 50) + 10, 
        data: new Date(),
      }
    });

    
    for (const lojaId of lojasIds) {
      
      if (Math.random() > 0.25) { 
        const qtdAleatoria = Math.floor(Math.random() * 80);
        
        await prisma.estoqueLoja.create({
          data: {
            produtoId: produto.id,
            lojaId: lojaId,
            quantidadeEst: qtdAleatoria,
          },
        });
      }
    }
  }

  console.log('✅ Seed ESTOQUE finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });