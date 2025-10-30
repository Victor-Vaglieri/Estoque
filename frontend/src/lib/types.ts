// Funções possíveis do usuário, DEVE ser igual ao Enum Funcao no Prisma
export type Funcao = 'CADASTRO' | 'COMPRAS' | 'RECEBIMENTO' | 'FUNCIONARIO' | 'EMPREGADA' | 'GESTOR';

export interface UserData {
  sub: number;
  login: string;
  funcoes: Funcao[];
  exp?: number;
  iat?: number;
}

export interface AuthContextType {
  user: UserData | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
}
