// Tipos baseados no seu ENUM Funcao do Prisma
export type Funcao = 'CADASTRO' | 'COMPRAS' | 'RECEBIMENTO' | 'FUNCIONARIO' | 'EMPREGADA' | 'GESTOR';

export interface UserData {
  sub: number;       // ✅ ADICIONADO: O ID do usuário (padrão JWT "subject")
  login: string;     // O login/username do usuário
  funcoes: Funcao[]; // As permissões do usuário
  exp?: number;      // Opcional: timestamp de expiração do token
  iat?: number;      // Opcional: timestamp de criação do token
}

export interface AuthContextType {
  user: UserData | null;
  isAuthenticated: boolean;
  loading: boolean; // <-- MUDANÇA AQUI: de 'isLoading' para 'loading'
  login: (token: string) => void;
  logout: () => void;
}
