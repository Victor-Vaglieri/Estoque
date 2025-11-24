import sqlite3
import datetime
import os
import random
import subprocess

# --- CONFIGURAÇÃO ---
DB_PATH = 'prisma/controle.db' 

def get_iso_date(days_offset=0):
    """Gera data no formato ISO para o SQLite"""
    date = datetime.datetime.now() + datetime.timedelta(days=days_offset)
    return date.isoformat() + "Z"

def ensure_database_structure():
    """
    Força o Prisma a criar o arquivo .db e as tabelas para o schema 'controle'.
    """
    print("🔨 Recriando estrutura do banco CONTROLE via Prisma...")
    
    command = "npx prisma db push --accept-data-loss" 
    
    result = os.system(command)
    
    if result != 0:
        print("⚠️  Aviso: 'npx prisma db push' retornou erro ou não foi encontrado.")
        print("   Se o banco 'controle.db' já existir com as tabelas, o seed continuará.")
    else:
        print("✅ Estrutura do banco garantida.")

def run_seed():
    # 1. Garante estrutura
    ensure_database_structure()

    # 2. Conecta no banco
    print(f"🔌 Conectando em: {DB_PATH}")
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
    except sqlite3.OperationalError:
         if os.path.exists('controle.db'):
            conn = sqlite3.connect('controle.db')
            cursor = conn.cursor()
         else:
            print(f"❌ Não foi possível encontrar o banco em '{DB_PATH}'.")
            return

    print("🌱 Iniciando inserção de dados de CONTROLE...")

    try:
        # 3. LIMPEZA
        tables = [
            'MalaItem', 'MalaRegistro',
            'TapeteItem', 'TapeteRegistro',
            'TingimentoItem', 'TingimentoRegistro',
            'CosturaItem', 'CosturaRegistro'
        ]
        
        for table in tables:
            try:
                cursor.execute(f"DELETE FROM {table}")
                cursor.execute(f"DELETE FROM sqlite_sequence WHERE name='{table}'")
            except sqlite3.OperationalError:
                print(f"   (Tabela {table} talvez não exista ou erro ao limpar)")

        print("🧹 Tabelas limpas.")

        # Dados para aleatoriedade
        nomes = ["Maria Silva", "João Souza", "Pedro Viagem", "Ana Costa", "Carlos Lima", "Beatriz Rocha", "Fernanda Alves", "Lucas Pereira", "Juliana Santos", "Roberto Dias"]
        meios_contato = ["GOOGLE", "REDE_SOCIAL", "AMIGOS", "LOJA", "OUTROS"]
        pecas_costura = ["Calça Jeans", "Camisa Social", "Vestido", "Saia", "Blazer", "Casaco"]
        servicos_costura = ["Barra Original", "Ajustar Lateral", "Trocar Zíper", "Ajustar Cintura", "Bainha"]
        pecas_tingimento = ["Vestido Longo", "Camiseta", "Calça", "Toalha de Mesa", "Lençol"]
        cores = ["Preto", "Azul Marinho", "Vermelho", "Verde", "Amarelo"]

        # 4. INSERIR DADOS - COSTURA (MUITOS DADOS)
        rol_base = 1000
        for i in range(50): # Criando 50 registros de costura
            rol = rol_base + i + 1
            nome = random.choice(nomes)
            contato = random.choice(meios_contato)
            data_rec = get_iso_date(-random.randint(1, 30))
            data_ent = get_iso_date(random.randint(1, 10))
            
            cursor.execute("""
                INSERT INTO CosturaRegistro (rol, nome_cliente, meio_de_contato_inicial, data_recebimento, data_da_entrega, lojaId, createdAt, updatedAt)
                VALUES (?, ?, ?, ?, ?, 1, ?, ?)
            """, (rol, nome, contato, data_rec, data_ent, data_rec, data_rec))
            
            reg_id = cursor.lastrowid
            
            # Adicionando 1 a 3 itens por registro
            for j in range(random.randint(1, 3)):
                peca = random.choice(pecas_costura)
                servico = random.choice(servicos_costura)
                custo = round(random.uniform(10.0, 50.0), 2)
                cobrado = round(custo * random.uniform(1.5, 2.5), 2)
                ticket = f'T-{rol}-{j+1}'
                
                cursor.execute("INSERT INTO CosturaItem (registroId, ticket, peca, descricao_do_servico, custo, cobrado) VALUES (?, ?, ?, ?, ?, ?)", 
                               (reg_id, ticket, peca, servico, custo, cobrado))

        print("✅ 50 Registros de Costura inseridos.")

        # 5. INSERIR DADOS - TINGIMENTO (MUITOS DADOS)
        rol_base = 2000
        for i in range(30): # Criando 30 registros de tingimento
            rol = rol_base + i + 1
            nome = random.choice(nomes)
            contato = random.choice(meios_contato)
            data_rec = get_iso_date(-random.randint(5, 40))
            envio = get_iso_date(-random.randint(1, 5))
            data_ent = get_iso_date(random.randint(5, 15))
            
            cursor.execute("""
                INSERT INTO TingimentoRegistro (rol, nome_cliente, meio_de_contato_inicial, data_recebimento, envio_a_washtec, data_da_entrega, lojaId, createdAt, updatedAt)
                VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
            """, (rol, nome, contato, data_rec, envio, data_ent, data_rec, data_rec))
            
            reg_id = cursor.lastrowid
            
            peca = random.choice(pecas_tingimento)
            cor = random.choice(cores)
            valor_washtec = round(random.uniform(20.0, 60.0), 2)
            valor_cobrado = round(valor_washtec * random.uniform(2.0, 3.0), 2)
            strip_tag = f'TAG-{rol}'

            cursor.execute("""
                INSERT INTO TingimentoItem (registroId, strip_tag, peca, cor_desejada, valor_washtec, valor_cobrado) 
                VALUES (?, ?, ?, ?, ?, ?)
            """, (reg_id, strip_tag, peca, cor, valor_washtec, valor_cobrado))

        print("✅ 30 Registros de Tingimento inseridos.")

        # 6. INSERIR DADOS - TAPETE (MUITOS DADOS)
        rol_base = 3000
        for i in range(20): # Criando 20 registros de tapete
            rol = rol_base + i + 1
            nome = random.choice(nomes)
            contato = random.choice(meios_contato)
            data_rec = get_iso_date(-random.randint(2, 20))
            envio = get_iso_date(-random.randint(1, 2))
            
            cursor.execute("""
                INSERT INTO TapeteRegistro (rol, nome_cliente, meio_de_contato_inicial, data_recebimento, os_master, envio_a_master, lojaId, createdAt, updatedAt)
                VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
            """, (rol, nome, contato, data_rec, f'OS-{rol}', envio, data_rec, data_rec))
            
            reg_id = cursor.lastrowid
            valor_master = round(random.uniform(50.0, 150.0), 2)
            valor_cobrado = round(valor_master * 2, 2)
            strip_tag = f'TAP-{rol}'

            cursor.execute("""
                INSERT INTO TapeteItem (registroId, strip_tag_dryclean, valor_master, valor_cobrado) 
                VALUES (?, ?, ?, ?)
            """, (reg_id, strip_tag, valor_master, valor_cobrado))

        print("✅ 20 Registros de Tapete inseridos.")

        # 7. INSERIR DADOS - MALA (MUITOS DADOS)
        rol_base = 4000
        for i in range(15): # Criando 15 registros de mala
            rol = rol_base + i + 1
            nome = random.choice(nomes)
            contato = random.choice(meios_contato)
            data_rec = get_iso_date(-random.randint(10, 50))
            data_ent = get_iso_date(random.randint(1, 10))
            
            cursor.execute("""
                INSERT INTO MalaRegistro (rol, nome_cliente, meio_de_contato_inicial, data_recebimento, data_da_entrega, lojaId, createdAt, updatedAt)
                VALUES (?, ?, ?, ?, ?, 1, ?, ?)
            """, (rol, nome, contato, data_rec, data_ent, data_rec, data_rec))
            
            reg_id = cursor.lastrowid
            valor_master = round(random.uniform(40.0, 100.0), 2)
            valor_cobrado = round(valor_master * 2.5, 2)
            strip_tag = f'MAL-{rol}'
            strip_tag_master = f'MST-{rol}'

            cursor.execute("""
                INSERT INTO MalaItem (registroId, strip_tag_dryclean, strip_tag_master, valor_master, valor_cobrado) 
                VALUES (?, ?, ?, ?, ?)
            """, (reg_id, strip_tag, strip_tag_master, valor_master, valor_cobrado))

        print("✅ 15 Registros de Mala inseridos.")

        conn.commit()
        print("✅ Seed CONTROLE finalizado com SUCESSO!")

    except sqlite3.Error as e:
        print(f"❌ Erro SQL: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == '__main__':
    run_seed()