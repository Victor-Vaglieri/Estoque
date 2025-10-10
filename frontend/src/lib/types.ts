// Tipos baseados no seu ENUM Funcao do Prisma
export type Funcao = 'CADASTRO' | 'COMPRAS' | 'RECEBIMENTO' | 'FUNCIONARIO' | 'EMPREGADA' | 'GESTOR';

export interface UserData {
  userId: number;
  login: string;
  funcoes: Funcao[];
}

export interface AuthContextType {
  user: UserData | null;
  isAuthenticated: boolean;
  isLoading: boolean; 
  login: (token: string) => void; 
  logout: () => void;
}