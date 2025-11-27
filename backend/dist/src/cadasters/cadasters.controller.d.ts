import { PerfisService } from './cadasters.service';
import { AprovarSolicitacaoDto, UpdateUserDto } from './dto/perfis.dto';
export declare class PerfisController {
    private readonly perfisService;
    constructor(perfisService: PerfisService);
    private checkGestor;
    private getUserId;
    getSolicitacoes(req: any): Promise<{
        nome: string;
        id: number;
        createdAt: Date;
        login: string;
        responsavelId: number | null;
    }[]>;
    getUsuarios(req: any): Promise<{
        id: number;
        nome: string;
        login: string;
        lojaId: number | null;
        role: string;
    }[]>;
    getSolicitacoesConfirmadas(req: any): Promise<{
        responsavelNome: string;
        nome: string;
        id: number;
        createdAt: Date;
        login: string;
        responsavelId: number | null;
    }[]>;
    getLojas(req: any): Promise<{
        nome: string;
        id: number;
    }[]>;
    aprovarSolicitacao(id: number, dto: AprovarSolicitacaoDto, req: any): Promise<{
        message: string;
    }>;
    rejeitarSolicitacao(id: number, req: any): Promise<{
        message: string;
    }>;
    updateUser(id: number, dto: UpdateUserDto, req: any): Promise<({
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
    deleteUser(id: number, req: any): Promise<{
        message: string;
    }>;
    findAllFornecedores(req: any): Promise<{
        nome: string;
        id: number;
    }[]>;
    createFornecedor(req: any, body: {
        nome: string;
    }): Promise<{
        nome: string;
        id: number;
    }>;
    updateFornecedor(req: any, id: string, body: {
        nome: string;
    }): Promise<{
        nome: string;
        id: number;
    }>;
    deleteFornecedor(req: any, id: string): Promise<{
        nome: string;
        id: number;
    }>;
}
