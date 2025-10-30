import { Injectable, NotFoundException, ConflictException, InternalServerErrorException, ForbiddenException, BadRequestException } from '@nestjs/common';
// Importe 'Prisma' de AMBOS os clientes
import { Prisma as PrismaUsuarios, Funcao } from '@prisma/usuarios-client';
import { Prisma as PrismaCadastros } from '@prisma/cadastros-client'; 
// Importe os DOIS serviços de DB
import { UsuariosDbService } from '../prisma/usuarios-db.service'; 
import { CadastrosDbService } from '../prisma/cadastros-db.service'; 
import * as bcrypt from 'bcrypt';
import { UpdateUserRolesDto } from './dto/update-user-roles.dto';
import { AprovarSolicitacaoDto } from './dto/aprove-user.dto';

@Injectable()
export class PerfisService {
    constructor(
        private usuariosDb: UsuariosDbService, 
        private cadastrosDb: CadastrosDbService 
    ) {}

    // --- Lógica de Solicitações (Usa cadastrosDb) ---

    async getSolicitacoes(userId: number) {
        // ... (código existente)
        return this.cadastrosDb.cadastro.findMany({
            where: {
                responsavelId: null 
            },
            orderBy: { createdAt: 'asc' }, 
            select: { 
                id: true,
                nome: true,
                login: true,
                responsavelId: true,
                createdAt: true
            }
        });
    }

    /**
     * Busca todas as solicitações que JÁ FORAM CONFIRMADAS.
     * --- AGORA INCLUI O NOME DO APROVADOR ---
     */
    async getSolicitacoesConfirmadas(userId: number) {
        // 1. Busca solicitações confirmadas
        const solicitacoes = await this.cadastrosDb.cadastro.findMany({
            where: {
                responsavelId: { 
                    not: null 
                } 
            },
            orderBy: { createdAt: 'desc' }, 
            select: { 
                id: true,
                nome: true,
                login: true,
                responsavelId: true,
                createdAt: true
            }
        });

        if (solicitacoes.length === 0) {
            return [];
        }

        // 2. Extrai os IDs dos responsáveis (aprovadores)
        const responsavelIds = [
            ...new Set(solicitacoes.map(s => s.responsavelId).filter(id => id !== null) as number[])
        ];

        // 3. Busca os nomes dos aprovadores no banco de usuários
        const aprovadores = await this.usuariosDb.usuario.findMany({
            where: {
                id: {
                    in: responsavelIds
                }
            },
            select: {
                id: true,
                nome: true
            }
        });

        // 4. Mapeia os IDs para nomes para consulta rápida
        const aprovadorMap = new Map(aprovadores.map(a => [a.id, a.nome]));

        // 5. Combina os dados
        return solicitacoes.map(solicitacao => {
            // --- CORREÇÃO AQUI ---
            // Verifica se responsavelId não é nulo ANTES de usar o Map.get
            const responsavelNome = solicitacao.responsavelId 
                ? aprovadorMap.get(solicitacao.responsavelId) 
                : null; // Se o ID for nulo (o que não deve acontecer aqui, mas o tipo permite), o nome é nulo

            return {
                ...solicitacao,
                // Adiciona o nome do aprovador ao objeto de retorno
                responsavelNome: responsavelNome || 'ID Desconhecido' // Fallback
            };
        });
    }


    async aprovarSolicitacao(adminId: number, cadastroId: number, aprovarDto: AprovarSolicitacaoDto) {
        // ... (código existente)
        const cadastro = await this.cadastrosDb.cadastro.findUnique({
            where: { 
                id: cadastroId,
                responsavelId: null 
            },
        });
        if (!cadastro) {
            throw new NotFoundException(`Solicitação de cadastro pendente com ID ${cadastroId} não encontrada.`);
        }
        const existingUser = await this.usuariosDb.usuario.findUnique({
             where: { login: cadastro.login },
        });
        if (existingUser) {
            await this.rejeitarSolicitacao(adminId, cadastroId); 
            throw new ConflictException(`Login '${cadastro.login}' já existe. A solicitação foi rejeitada.`);
        }
        const hashedPassword = cadastro.senha;
        try {
            await this.usuariosDb.$transaction(async (prismaTx) => {
                const newUser = await prismaTx.usuario.create({
                    data: {
                        nome: cadastro.nome,
                        login: cadastro.login,
                        senha: hashedPassword, 
                        ativo: true,
                    }
                });
                const { funcoes } = aprovarDto;
                if (!funcoes || funcoes.length === 0) {
                    throw new BadRequestException('Pelo menos uma função é necessária.');
                }
                await prismaTx.usuarioFuncao.createMany({
                    data: funcoes.map(funcao => ({
                        usuarioId: newUser.id,
                        funcao: funcao 
                    }))
                });
            });
        } catch (error) {
             console.error("Erro ao criar utilizador no DB principal:", error);
             if (error instanceof PrismaUsuarios.PrismaClientKnownRequestError) {
             }
             if (error instanceof BadRequestException) {
                 throw error;
             }
            throw new InternalServerErrorException("Falha ao criar o utilizador. A solicitação não foi atualizada.");
        }
        try {
             await this.cadastrosDb.cadastro.update({
                where: { id: cadastroId },
                data: {
                    responsavelId: adminId 
                }
            });
        } catch (error) {
             console.error("Erro ao ATUALIZAR solicitação (Utilizador FOI criado):", error);
             if (error instanceof PrismaCadastros.PrismaClientKnownRequestError && error.code === 'P2025') {
                 throw new NotFoundException(`Solicitação com ID ${cadastroId} não encontrada ao tentar atualizar.`);
             }
            throw new InternalServerErrorException("Utilizador criado, mas falha ao atualizar a solicitação. Verifique manualmente.");
        }
        return { message: `Utilizador '${cadastro.login}' criado com sucesso.` };
    }

    async rejeitarSolicitacao(adminId: number, cadastroId: number) {
        // ... (código existente)
        try {
            await this.cadastrosDb.cadastro.delete({
                where: { 
                    id: cadastroId,
                },
            });
            return { message: "Solicitação rejeitada e removida com sucesso." };
        } catch (error) {
            if (error instanceof PrismaCadastros.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new NotFoundException(`Solicitação com ID ${cadastroId} não encontrada.`);
            }
            throw error; 
        }
    }

    async getUsuarios(userId: number) {
         // ... (código existente)
        const usuarios = await this.usuariosDb.usuario.findMany({
            select: { 
                id: true,
                nome: true,
                login: true,
                funcoes: { 
                    select: {
                        funcao: true
                    }
                }
            },
            orderBy: { nome: 'asc' }
        });
        return usuarios.map(u => ({
            id: u.id,
            nome: u.nome,
            login: u.login,
            role: u.funcoes.map(f => f.funcao).join(', ') || 'N/D' 
        }));
    }

    async updateUserRoles(adminId: number, targetUserId: number, dto: UpdateUserRolesDto) {
        // ... (código existente)
        return await this.usuariosDb.$transaction(async (prismaTx) => {
            await prismaTx.usuarioFuncao.deleteMany({
                where: { usuarioId: targetUserId }
            });
            if (dto.funcoes && dto.funcoes.length > 0) {
                await prismaTx.usuarioFuncao.createMany({
                    data: dto.funcoes.map(funcao => ({
                        usuarioId: targetUserId,
                        funcao: funcao
                    }))
                });
            }
            return prismaTx.usuario.findUnique({
                where: { id: targetUserId },
                include: { funcoes: true }
            });
        });
    }

    async deleteUser(adminId: number, targetUserId: number) {
        // ... (código existente)
        let userLogin: string;
        try {
             const user = await this.usuariosDb.usuario.findUniqueOrThrow({
                where: { id: targetUserId },
                select: { login: true }
            });
            userLogin = user.login;
        } catch (error) {
             if (error instanceof PrismaUsuarios.PrismaClientKnownRequestError && (error.code === 'P2025' || error.code === 'P2016')) {
                throw new NotFoundException(`Utilizador com ID ${targetUserId} não encontrado.`);
            }
            throw error;
        }
        try {
            await this.usuariosDb.$transaction(async (prismaTx) => {
                await prismaTx.usuarioFuncao.deleteMany({
                    where: { usuarioId: targetUserId }
                });
                return await prismaTx.usuario.delete({
                    where: { id: targetUserId }
                });
            });
        } catch (error) {
            if (error instanceof PrismaUsuarios.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new NotFoundException(`Utilizador com ID ${targetUserId} não encontrado durante a transação.`);
            }
            throw error;
        }
        try {
            await this.cadastrosDb.cadastro.deleteMany({
                where: { login: userLogin } 
            });
        } catch (error) {
            console.warn(`AVISO: Utilizador ${userLogin} (ID: ${targetUserId}) foi removido, mas falhou a limpeza do 'cadastros.db'. Erro: ${error.message}`);
        }
        return { message: `Utilizador ${userLogin} (ID: ${targetUserId}) removido com sucesso de ambos os sistemas.` };
    }
}

