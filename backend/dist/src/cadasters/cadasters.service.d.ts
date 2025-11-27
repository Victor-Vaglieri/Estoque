import { UsuariosDbService } from '../prisma/usuarios-db.service';
import { CadastrosDbService } from '../prisma/cadastros-db.service';
import { EstoqueDbService } from '../prisma/estoque-db.service';
import { AprovarSolicitacaoDto, UpdateUserDto } from './dto/perfis.dto';
export declare class PerfisService {
    private usuariosDb;
    private cadastrosDb;
    private estoqueDb;
    constructor(usuariosDb: UsuariosDbService, cadastrosDb: CadastrosDbService, estoqueDb: EstoqueDbService);
    getLojas(): Promise<{
        nome: string;
        id: number;
    }[]>;
    getSolicitacoes(): Promise<{
        nome: string;
        id: number;
        createdAt: Date;
        login: string;
        responsavelId: number | null;
    }[]>;
    getSolicitacoesConfirmadas(): Promise<{
        responsavelNome: string;
        nome: string;
        id: number;
        createdAt: Date;
        login: string;
        responsavelId: number | null;
    }[]>;
    getUsuarios(): Promise<{
        id: number;
        nome: string;
        login: string;
        lojaId: number | null;
        role: string;
    }[]>;
    aprovarSolicitacao(adminId: number, cadastroId: number, aprovarDto: AprovarSolicitacaoDto): Promise<{
        message: string;
    }>;
    rejeitarSolicitacao(cadastroId: number): Promise<{
        message: string;
    }>;
    updateUser(userId: number, dto: UpdateUserDto): Promise<({
        funcoes: {
            id: number;
            usuarioId: number;
            funcao: import("@prisma/usuarios-client").$Enums.Funcao;
        }[];
    } & {
        nome: string;
        id: number;
        ativo: boolean;
        createdAt: Date;
        lojaId: number | null;
        login: string;
        senha: string;
    }) | null>;
    deleteUser(adminId: number, targetUserId: number): Promise<{
        message: string;
    }>;
    findAllFornecedores(): Promise<{
        nome: string;
        id: number;
    }[]>;
    createFornecedor(nome: string): Promise<{
        nome: string;
        id: number;
    }>;
    updateFornecedor(id: number, nome: string): Promise<{
        nome: string;
        id: number;
    }>;
    deleteFornecedor(id: number): Promise<{
        nome: string;
        id: number;
    }>;
}
