import sqlite3
import datetime
import os
import random
import subprocess

# --- CONFIGURAÇÃO ---
DB_PATH = 'prisma/estoque.db' 

def get_iso_date(days_offset=0):
    """Gera data no formato ISO para o SQLite"""
    date = datetime.datetime.now() + datetime.timedelta(days=days_offset)
    return date.isoformat() + "Z"

def ensure_database_structure():
    print("🔨 Recriando estrutura do banco ESTOQUE via Prisma...")
    # Usa o schema padrão (schema.prisma)
    command = "npx prisma db push --accept-data-loss" 
    result = os.system(command)
    if result != 0:
        print("⚠️  Aviso: 'npx prisma db push' falhou. Tentando continuar...")
    else:
        print("✅ Estrutura garantida.")

def run_seed():
    ensure_database_structure()

    print(f"🔌 Conectando em: {DB_PATH}")
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
    except sqlite3.OperationalError:
         if os.path.exists('estoque.db'):
            conn = sqlite3.connect('estoque.db')
            cursor = conn.cursor()
         else:
            print(f"❌ Banco não encontrado em '{DB_PATH}'.")
            return

    print("🌱 Iniciando inserção MASSIVA de dados no ESTOQUE...")

    try:
        # 1. LIMPEZA
        tables = [
            'CompraDistribuicao', 'HistoricoCompra', 'HistoricoPreco', 
            'Entrada', 'Saida', 'EstoqueLoja', 'LojaNecessitaProduto', 
            'Produto', 'Fornecedor', 'Loja'
        ]
        for table in tables:
            try:
                cursor.execute(f"DELETE FROM {table}")
                cursor.execute(f"DELETE FROM sqlite_sequence WHERE name='{table}'")
            except:
                pass
        print("🧹 Tabelas limpas.")

        # 2. DADOS BASE (Lojas e Fornecedores)
        lojas = [
            (1, 'Matriz - Centro'),
            (2, 'Filial - Shopping'),
            (3, 'Depósito - Zona Norte')
        ]
        cursor.executemany("INSERT INTO Loja (id, nome) VALUES (?, ?)", lojas)

        fornecedores_nomes = [
            'Tecidos & Cia', 'Casa dos Botões', 'Importadora Alpha', 
            'Têxtil Santa Maria', 'Aviamentos Brasil', 'Malharia Fio Nobre'
        ]
        for i, nome in enumerate(fornecedores_nomes):
            cursor.execute("INSERT INTO Fornecedor (id, nome) VALUES (?, ?)", (i+1, nome))

        # 3. PRODUTOS (Gerar 50 produtos variados)
        categorias = ['Camisetas', 'Calças', 'Vestidos', 'Aviamentos', 'Acessórios']
        marcas = ['Hering', 'Nike', 'Adidas', 'Corrente', 'Zorba', 'Lupo', 'Generico']
        unidades = ['UN', 'PCT', 'RL', 'KG', 'MT']
        
        produtos_ids = []

        print("📦 Criando 50 produtos...")
        for i in range(1, 51):
            cat = random.choice(categorias)
            marca = random.choice(marcas)
            tipo = f"{cat} Tipo {random.choice(['A', 'B', 'C', 'Premium', 'Basic'])}"
            nome = f"{tipo} - {marca} {random.randint(100, 999)}"
            codigo = f"PROD-{i:03d}"
            unidade = random.choice(unidades)
            
            # Alguns produtos de produção própria, outros revenda
            producao = 1 if random.random() > 0.7 else 0 
            
            qtd_min = random.randint(5, 50)
            qtd_max = qtd_min * random.randint(3, 6)
            forn_id = random.randint(1, len(fornecedores_nomes))

            cursor.execute("""
                INSERT INTO Produto (id, nome, codigo, unidade, quantidadeMin, quantidadeMax, marca, categoria, fornecedorId, ativo, producao, updatedAt, createdAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
            """, (i, nome, codigo, unidade, qtd_min, qtd_max, marca, cat, forn_id, producao, get_iso_date(), get_iso_date(-180)))
            
            produtos_ids.append(i)

            # Inicializa Estoque zerado ou aleatório para as lojas
            for loja_id, _ in lojas:
                qtd_inicial = random.randint(0, int(qtd_max * 0.8))
                cursor.execute("""
                    INSERT INTO EstoqueLoja (produtoId, lojaId, quantidadeEst) 
                    VALUES (?, ?, ?)
                """, (i, loja_id, qtd_inicial))

        # 4. HISTÓRICO DE PREÇOS (Para valorização do estoque)
        print("💲 Gerando histórico de preços...")
        for pid in produtos_ids:
            preco_base = random.uniform(5.0, 150.0)
            # 2 preços por produto (um antigo, um atual)
            cursor.execute("INSERT INTO HistoricoPreco (produtoId, preco, data) VALUES (?, ?, ?)", (pid, round(preco_base * 0.9, 2), get_iso_date(-100)))
            cursor.execute("INSERT INTO HistoricoPreco (produtoId, preco, data) VALUES (?, ?, ?)", (pid, round(preco_base, 2), get_iso_date(-10)))

        # 5. MOVIMENTAÇÕES (ENTRADAS E SAÍDAS) - Últimos 6 meses
        print("📉 Gerando histórico de movimentação (6 meses)...")
        
        # Gerar 300 entradas aleatórias
        for _ in range(300):
            pid = random.choice(produtos_ids)
            lid = random.choice([1, 2, 3])
            qtd = random.randint(10, 100)
            # Preço pago varia um pouco
            preco_pago = round(random.uniform(5.0, 100.0), 2)
            # Data aleatória nos últimos 180 dias
            dias_atras = random.randint(1, 180)
            
            cursor.execute("""
                INSERT INTO Entrada (produtoId, quantidade, precoPago, lojaId, responsavelId, data)
                VALUES (?, ?, ?, ?, 1, ?)
            """, (pid, qtd, preco_pago, lid, get_iso_date(-dias_atras)))

            # Atualiza o estoque atual (simulação simples, soma)
            cursor.execute("UPDATE EstoqueLoja SET quantidadeEst = quantidadeEst + ? WHERE produtoId = ? AND lojaId = ?", (qtd, pid, lid))

        # Gerar 500 saídas aleatórias (Vendas)
        for _ in range(500):
            pid = random.choice(produtos_ids)
            lid = random.choice([1, 2, 3])
            qtd = random.randint(1, 20)
            dias_atras = random.randint(1, 180)
            motivo = random.choice(['Venda', 'Venda', 'Venda', 'Consumo Interno', 'Avaria'])

            cursor.execute("""
                INSERT INTO Saida (produtoId, quantidade, motivo, lojaId, responsavelId, data)
                VALUES (?, ?, ?, ?, 1, ?)
            """, (pid, qtd, motivo, lid, get_iso_date(-dias_atras)))

            # Atualiza o estoque atual (subtrai)
            cursor.execute("UPDATE EstoqueLoja SET quantidadeEst = quantidadeEst - ? WHERE produtoId = ? AND lojaId = ?", (qtd, pid, lid))

        # 6. COMPRAS (Algumas antigas, algumas pendentes)
        print("truck: Gerando histórico de compras...")
        for _ in range(50):
            pid = random.choice(produtos_ids)
            qtd = random.randint(50, 200)
            total = round(qtd * random.uniform(5, 50), 2)
            forn = random.randint(1, len(fornecedores_nomes))
            dias_atras = random.randint(0, 60) # Compras mais recentes
            
            cursor.execute("""
                INSERT INTO HistoricoCompra (produtoId, quantidade, precoTotal, fornecedorId, responsavelId, data)
                VALUES (?, ?, ?, ?, 1, ?)
            """, (pid, qtd, total, forn, get_iso_date(-dias_atras)))
            
            compra_id = cursor.lastrowid
            
            # Distribui para as lojas
            # Se for compra MUITO recente (0-2 dias), deixa PENDENTE para testar o recebimento
            status = 'PENDENTE' if dias_atras <= 2 else 'CONFIRMADO'
            
            cursor.execute("""
                INSERT INTO CompraDistribuicao (historicoCompraId, lojaId, quantidade, confirmadoEntrada)
                VALUES (?, 1, ?, ?)
            """, (compra_id, int(qtd/2), status))
            cursor.execute("""
                INSERT INTO CompraDistribuicao (historicoCompraId, lojaId, quantidade, confirmadoEntrada)
                VALUES (?, 2, ?, ?)
            """, (compra_id, int(qtd/2), status))

        conn.commit()
        print("✅ Seed ESTOQUE finalizado com SUCESSO!")
        print(f"📊 Estatísticas:")
        print(f"   - 3 Lojas")
        print(f"   - {len(fornecedores_nomes)} Fornecedores")
        print(f"   - 50 Produtos")
        print(f"   - ~300 Entradas e ~500 Saídas (últimos 6 meses)")
        print(f"   - Compras recentes marcadas como PENDENTE para teste.")

    except sqlite3.Error as e:
        print(f"❌ Erro SQL: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == '__main__':
    run_seed()