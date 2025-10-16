import sqlite3
import random
from faker import Faker # Usaremos o Faker apenas para nomes de empresas/fornecedores
from datetime import datetime, timedelta
import os


def limpar_tabela():
    """Apaga todos os registros da tabela 'Alertas'."""
    if not os.path.exists(DB_FILE):
        print(f"O arquivo do banco de dados '{DB_FILE}' não foi encontrado.")
        return

    try:
        # Conecta ao banco de dados
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()

        print("Limpando a tabela 'Alertas'...")
        
        # 1. Executa os comandos de exclusão
        cursor.execute("DELETE FROM Alertas;")
        cursor.execute("DELETE FROM sqlite_sequence WHERE name='Alertas';")
        
        # 2. --- CORREÇÃO AQUI ---
        # Finaliza a transação ANTES de chamar o VACUUM
        conn.commit()
        
        # 3. Agora executa o VACUUM fora de uma transação
        print("Otimizando o arquivo do banco de dados...")
        cursor.execute("VACUUM;")
        
        print("Tabela 'Alertas' limpa e otimizada com sucesso!")

    except sqlite3.Error as e:
        print(f"Ocorreu um erro ao limpar o banco de dados: {e}")
    finally:
        # Garante que a conexão seja fechada, não precisa de outro commit aqui.
        if conn:
            conn.close()


# --- Configurações ---
DB_FILE = "alertas.db"
NUM_ALERTAS = 50

# O Faker ainda é útil para gerar nomes de fornecedores realistas.
fake = Faker('pt_BR')
print(f"Verificação do Faker para fornecedores: {fake.company()}")

# --- NOVIDADE AQUI: Listas para gerar alertas realistas ---

# Listas de palavras para compor os alertas
ACOES_TITULO = [
    "Verificação Urgente", "Atenção ao Estoque", "Pedido de Compra Necessário",
    "Alerta de Validade", "Revisão de Fornecedor", "Manutenção Agendada"
]
ITENS_EXEMPLO = [
    "Parafuso Sextavado M8", "Placa de Circuito T-800", "Chip de Memória DDR5",
    "Cabo de Rede Cat6", "Motor Elétrico 5cv", "Rolamento Axial 6203", "Fonte de Alimentação 500W"
]
PROBLEMAS_DESCRICAO = [
    "atingiu o nível mínimo de reposição", "está com data de validade próxima",
    "apresentou falha no último lote recebido", "sofreu avaria durante o transporte",
    "está em falta no fornecedor principal"
]

# --- Fim da novidade ---

importancias = ["BAIXA", "MEDIA", "ALTA"]

def criar_tabela_se_nao_existir(conn):
    """Cria a tabela 'Alertas' se ela ainda não existir."""
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS Alertas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        descricao TEXT NOT NULL,
        importancia TEXT CHECK(importancia IN ('BAIXA', 'MEDIA', 'ALTA')) NOT NULL,
        concluido BOOLEAN NOT NULL DEFAULT 0,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        destinadoPara INTEGER,
        finishedAt DATETIME
    );
    """)
    conn.commit()
    print("Tabela 'Alertas' verificada/criada com sucesso.")

def popular_banco():
    """Função principal para gerar e inserir os dados."""
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        criar_tabela_se_nao_existir(conn)

        alertas_para_inserir = []
        for _ in range(NUM_ALERTAS):
            
            # --- LÓGICA DE GERAÇÃO DE TEXTO ALTERADA ---
            item_selecionado = random.choice(ITENS_EXEMPLO)
            acao_selecionada = random.choice(ACOES_TITULO)
            problema_selecionado = random.choice(PROBLEMAS_DESCRICAO)
            
            # Cria um título relevante
            titulo = f"{acao_selecionada}: {item_selecionado}"
            
            # Cria uma descrição relevante
            unidades = random.randint(1, 50)
            fornecedor = fake.company()
            descricao = (
                f"O item '{item_selecionado}' {problema_selecionado}. "
                f"Estoque atual: {unidades} unidades. "
                f"Último contato com o fornecedor '{fornecedor}' foi há {random.randint(2, 30)} dias. Ação imediata é necessária."
            )
            # --- Fim da alteração ---

            importancia = random.choice(importancias)
            concluido = random.choice([True, False])
            createdAt = fake.date_time_between(start_date="-1y", end_date="now")
            finishedAt = None
            if concluido:
                finishedAt = createdAt + timedelta(days=random.randint(1, 30))

            destinadoPara = random.choice([None, 1,2])

            alertas_para_inserir.append((
                titulo, descricao, importancia, concluido,
                createdAt, destinadoPara, finishedAt
            ))

        cursor.executemany("""
            INSERT INTO Alertas (titulo, descricao, importancia, concluido, createdAt, destinadoPara, finishedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, alertas_para_inserir)

        conn.commit()
        print(f"\n{NUM_ALERTAS} alertas REALISTAS foram inseridos com sucesso no banco de dados '{DB_FILE}'!")

    except sqlite3.Error as e:
        print(f"Ocorreu um erro ao interagir com o banco de dados: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    limpar_tabela()
    popular_banco()