import sqlite3
import random
from datetime import datetime, timezone, timedelta # <-- 1. IMPORTE O TIMEDELTA
from faker import Faker

# --- Configuração ---
DB_PATH = 'controle.db' 
fake = Faker('pt_BR')

# --- Funções de Criação ---

def create_costura(cur, rol):
    sql_registro = """
    INSERT INTO CosturaRegistro 
    (rol, cliente, meio_de_contato_inicial, data_de_entrada, previsao_de_entrega, metodo_de_entrega, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """
    
    # MUDANÇA (CORREÇÃO): Definir os limites de data manualmente
    end_utc = datetime.now(timezone.utc)
    start_utc = end_utc - timedelta(days=365) # Substitui '-1y'
    
    data_entrada_dt = fake.date_time_between(
        start_date=start_utc, 
        end_date=end_utc, 
        tzinfo=timezone.utc
    )
    
    previsao_end_utc = data_entrada_dt + timedelta(days=30) # Substitui '+30d'
    data_previsao_dt = fake.date_time_between(
        start_date=data_entrada_dt, 
        end_date=previsao_end_utc, 
        tzinfo=timezone.utc
    )
    now_dt = datetime.now(timezone.utc)

    # Converte para string ISO
    data_entrada_str = data_entrada_dt.isoformat()
    data_previsao_str = data_previsao_dt.isoformat()
    now_str = now_dt.isoformat()
    
    cur.execute(sql_registro, (
        rol,
        fake.name(),
        random.choice(['WhatsApp', 'Telefone', 'Loja']),
        data_entrada_str,
        data_previsao_str,
        random.choice(['Retirada', 'Entrega']),
        now_str,
        now_str
    ))
    
    # ... Itens (não mudou) ...
    registro_id = cur.lastrowid
    sql_item = "INSERT INTO CosturaItem (ticket, peca, descricao_do_servico, custo, cobrado, registroId) VALUES (?, ?, ?, ?, ?, ?)"
    for _ in range(random.randint(1, 3)):
        custo = fake.pyfloat(left_digits=2, right_digits=2, min_value=5, max_value=30)
        cobrado = custo + fake.pyfloat(left_digits=2, right_digits=2, min_value=5, max_value=50)
        cur.execute(sql_item, (str(fake.random_number(digits=6)), random.choice(['Calça', 'Camisa', 'Vestido']), 'Ajuste', round(custo, 2), round(cobrado, 2), registro_id))

def create_tingimento(cur, rol):
    sql_registro = """
    INSERT INTO TingimentoRegistro 
    (rol, cliente, data_de_entrada, previsao_de_entrega, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?)
    """
    
    # MUDANÇA (CORREÇÃO): Definir os limites de data manualmente
    end_utc = datetime.now(timezone.utc)
    start_utc = end_utc - timedelta(days=365)
    
    data_entrada_dt = fake.date_time_between(
        start_date=start_utc, 
        end_date=end_utc, 
        tzinfo=timezone.utc
    )
    
    previsao_end_utc = data_entrada_dt + timedelta(days=30)
    data_previsao_dt = fake.date_time_between(
        start_date=data_entrada_dt, 
        end_date=previsao_end_utc, 
        tzinfo=timezone.utc
    )
    now_dt = datetime.now(timezone.utc)

    data_entrada_str = data_entrada_dt.isoformat()
    data_previsao_str = data_previsao_dt.isoformat()
    now_str = now_dt.isoformat()
    
    cur.execute(sql_registro, (
        rol,
        fake.name(),
        data_entrada_str,
        data_previsao_str,
        now_str,
        now_str
    ))
    
    # ... Itens (não mudou) ...
    registro_id = cur.lastrowid
    sql_item = "INSERT INTO TingimentoItem (strip_tag, numero_washtec, peca, cor_desejada, valor_washtec, valor_cobrado, registroId) VALUES (?, ?, ?, ?, ?, ?, ?)"
    for _ in range(random.randint(1, 3)):
        valor_washtec = fake.pyfloat(left_digits=2, right_digits=2, min_value=20, max_value=50)
        valor_cobrado = valor_washtec + fake.pyfloat(left_digits=2, right_digits=2, min_value=10, max_value=60)
        cur.execute(sql_item, (f"T{fake.random_number(digits=5)}", f"W{fake.random_number(digits=4)}", 'Toalha', fake.safe_color_name(), round(valor_washtec, 2), round(valor_cobrado, 2), registro_id))

def create_tapete(cur, rol):
    sql_registro = """
    INSERT INTO TapeteRegistro 
    (rol, os_master, cliente, data_de_entrada, previsao_de_entrega, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """
    
    # MUDANÇA (CORREÇÃO): Definir os limites de data manualmente
    end_utc = datetime.now(timezone.utc)
    start_utc = end_utc - timedelta(days=365)
    
    data_entrada_dt = fake.date_time_between(
        start_date=start_utc, 
        end_date=end_utc, 
        tzinfo=timezone.utc
    )
    
    previsao_end_utc = data_entrada_dt + timedelta(days=30)
    data_previsao_dt = fake.date_time_between(
        start_date=data_entrada_dt, 
        end_date=previsao_end_utc, 
        tzinfo=timezone.utc
    )
    now_dt = datetime.now(timezone.utc)

    data_entrada_str = data_entrada_dt.isoformat()
    data_previsao_str = data_previsao_dt.isoformat()
    now_str = now_dt.isoformat()
    
    cur.execute(sql_registro, (
        rol,
        f"OS{fake.random_number(digits=5)}",
        fake.name(),
        data_entrada_str,
        data_previsao_str,
        now_str,
        now_str
    ))
    
    # ... Itim (não mudou) ...
    registro_id = cur.lastrowid
    sql_item = "INSERT INTO TapeteItem (strip_tag_dryclean, strip_tag_master, valor_master, valor_cobrado, registroId) VALUES (?, ?, ?, ?, ?)"
    for _ in range(random.randint(1, 2)):
        valor_master = fake.pyfloat(left_digits=3, right_digits=2, min_value=50, max_value=150)
        valor_cobrado = valor_master + fake.pyfloat(left_digits=2, right_digits=2, min_value=20, max_value=100)
        cur.execute(sql_item, (f"D{fake.random_number(digits=5)}", f"M{fake.random_number(digits=5)}", round(valor_master, 2), round(valor_cobrado, 2), registro_id))

# --- Função Principal (Não muda) ---
def main():
    print(f"Conectando ao banco de dados: {DB_PATH}")
    con = None 
    try:
        con = sqlite3.connect(DB_PATH)
        cur = con.cursor()
        cur.execute("PRAGMA foreign_keys = ON")

        print("Limpando dados antigos (onDelete: Cascade deve funcionar)...")
        cur.execute("DELETE FROM CosturaRegistro")
        cur.execute("DELETE FROM TingimentoRegistro")
        cur.execute("DELETE FROM TapeteRegistro")
        cur.execute("DELETE FROM sqlite_sequence WHERE name IN ('CosturaRegistro', 'CosturaItem', 'TingimentoRegistro', 'TingimentoItem', 'TapeteRegistro', 'TapeteItem')")
        
        print("Iniciando a criação de novos dados...")
        
        num_registros = 10
        for i in range(num_registros):
            create_costura(cur, 1000 + i)
            create_tingimento(cur, 2000 + i)
            create_tapete(cur, 3000 + i)

        con.commit()
        
        print(f"\nSucesso! O banco de dados foi populado com {num_registros * 3} registros principais e seus itens.")
        
    except sqlite3.Error as e:
        print(f"\nOcorreu um erro: {e}")
        print("As mudanças foram revertidas (rollback).")
        if con:
            con.rollback()
            
    finally:
        if con:
            con.close()
            print("Conexão com o banco de dados fechada.")

if __name__ == "__main__":
    main()