import {
    Injectable,
    NotFoundException,
    ConflictException,
    InternalServerErrorException,
    BadRequestException,
} from '@nestjs/common';
import { Prisma as PrismaUsuarios } from '@prisma/usuarios-client';
import { Prisma as PrismaCadastros } from '@prisma/cadastros-client';
import { UsuariosDbService } from '../prisma/usuarios-db.service';
import { CadastrosDbService } from '../prisma/cadastros-db.service';

import { EstoqueDbService } from '../prisma/estoque-db.service';
import { AprovarSolicitacaoDto, UpdateUserDto } from './dto/perfis.dto';

@Injectable()
export class PerfisService {
    constructor(
        private usuariosDb: UsuariosDbService,
        private cadastrosDb: CadastrosDbService,
        private estoqueDb: EstoqueDbService,
    ) { }


    async getLojas() {
        return this.estoqueDb.loja.findMany({
            select: {
                id: true,
                nome: true,
            },
            orderBy: { nome: 'asc' },
        });
    }

    async getSolicitacoes() {
        return this.cadastrosDb.cadastro.findMany({
            where: {
                responsavelId: null,
                ativo: true,
            },
            orderBy: { createdAt: 'asc' },
            select: {
                id: true,
                nome: true,
                login: true,
                responsavelId: true,
                createdAt: true,
            },
        });
    }

    async getSolicitacoesConfirmadas() {
        const solicitacoes = await this.cadastrosDb.cadastro.findMany({
            where: {
                responsavelId: { not: null },
                ativo: true,
            },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                nome: true,
                login: true,
                responsavelId: true,
                createdAt: true,
            },
        });

        if (solicitacoes.length === 0) {
            return [];
        }

        const responsavelIds = [
            ...new Set(
                solicitacoes
                    .map((s) => s.responsavelId)
                    .filter((id) => id !== null) as number[],
            ),
        ];

        const aprovadores = await this.usuariosDb.usuario.findMany({
            where: { id: { in: responsavelIds } },
            select: { id: true, nome: true },
        });

        const aprovadorMap = new Map(aprovadores.map((a) => [a.id, a.nome]));

        return solicitacoes.map((solicitacao) => {
            const responsavelNome = solicitacao.responsavelId
                ? aprovadorMap.get(solicitacao.responsavelId)
                : null;

            return {
                ...solicitacao,
                responsavelNome: responsavelNome || 'ID Desconhecido',
            };
        });
    }


    async getUsuarios() {
        const usuarios = await this.usuariosDb.usuario.findMany({
            select: {
                id: true,
                nome: true,
                login: true,
                lojaId: true,
                funcoes: {
                    select: { funcao: true },
                },
            },
            orderBy: { nome: 'asc' },
        });

        return usuarios.map((u) => ({
            id: u.id,
            nome: u.nome,
            login: u.login,
            lojaId: u.lojaId,
            role: u.funcoes.map((f) => f.funcao).join(', ') || 'N/D',
        }));
    }

    async aprovarSolicitacao(
        adminId: number,
        cadastroId: number,
        aprovarDto: AprovarSolicitacaoDto,
    ) {
        if (!adminId) {
            throw new BadRequestException("ID do administrador inválido.");
        }
        const cadastro = await this.cadastrosDb.cadastro.findUnique({
            where: { id: cadastroId, responsavelId: null },
        });

        if (!cadastro) {
            throw new NotFoundException(
                `Solicitação de cadastro pendente com ID ${cadastroId} não encontrada.`,
            );
        }

        const existingUser = await this.usuariosDb.usuario.findUnique({
            where: { login: cadastro.login },
        });

        if (existingUser) {
            await this.rejeitarSolicitacao(cadastroId);
            throw new ConflictException(
                `Login '${cadastro.login}' já existe. A solicitação foi rejeitada.`,
            );
        }

        try {

            await this.usuariosDb.$transaction(async (prismaTx) => {
                const newUser = await prismaTx.usuario.create({
                    data: {
                        nome: cadastro.nome,
                        login: cadastro.login,
                        senha: cadastro.senha,
                        ativo: true,
                        lojaId: aprovarDto.lojaId,
                    },
                });

                if (!aprovarDto.funcoes || aprovarDto.funcoes.length === 0) {
                    throw new BadRequestException('Pelo menos uma função é necessária.');
                }

                await prismaTx.usuarioFuncao.createMany({
                    data: aprovarDto.funcoes.map((funcao) => ({
                        usuarioId: newUser.id,
                        funcao: funcao,
                    })),
                });
            });
        } catch (error) {
            console.error('Erro ao criar utilizador:', error);
            if (error instanceof PrismaUsuarios.PrismaClientKnownRequestError) {

            }
            throw new InternalServerErrorException(
                'Falha ao criar o utilizador. A solicitação não foi atualizada.',
            );
        }


        try {
            await this.cadastrosDb.cadastro.update({
                where: { id: cadastroId },
                data: { responsavelId: adminId },
            });
        } catch (error) {
            console.error('Erro ao atualizar solicitação:', error);
            throw new InternalServerErrorException(
                'Utilizador criado, mas falha ao atualizar a solicitação.',
            );
        }

        return { message: `Utilizador '${cadastro.login}' criado com sucesso.` };
    }

    async rejeitarSolicitacao(cadastroId: number) {
        try {
            await this.cadastrosDb.cadastro.delete({
                where: { id: cadastroId },
            });
            return { message: 'Solicitação rejeitada e removida com sucesso.' };
        } catch (error) {
            if (
                error instanceof PrismaCadastros.PrismaClientKnownRequestError &&
                error.code === 'P2025'
            ) {
                throw new NotFoundException(
                    `Solicitação com ID ${cadastroId} não encontrada.`,
                );
            }
            throw error;
        }
    }

    async updateUser(userId: number, dto: UpdateUserDto) {
        const { funcoes, senha, ...data } = dto;

        const updateData: any = {
            ...data,
        };

        return await this.usuariosDb.$transaction(async (prismaTx) => {

            await prismaTx.usuario.update({
                where: { id: userId },
                data: updateData,
            });


            await prismaTx.usuarioFuncao.deleteMany({
                where: { usuarioId: userId },
            });

            if (funcoes && funcoes.length > 0) {
                await prismaTx.usuarioFuncao.createMany({
                    data: funcoes.map((funcao) => ({
                        usuarioId: userId,
                        funcao: funcao,
                    })),
                });
            }

            return prismaTx.usuario.findUnique({
                where: { id: userId },
                include: { funcoes: true },
            });
        });
    }

    async deleteUser(adminId: number, targetUserId: number) {
        let userLogin: string;
        try {
            const user = await this.usuariosDb.usuario.findUniqueOrThrow({
                where: { id: targetUserId },
                select: { login: true },
            });
            userLogin = user.login;
        } catch (error) {
            throw new NotFoundException(`Utilizador com ID ${targetUserId} não encontrado.`);
        }

        try {

            await this.usuariosDb.$transaction(async (prismaTx) => {
                await prismaTx.usuarioFuncao.deleteMany({
                    where: { usuarioId: targetUserId },
                });
                return await prismaTx.usuario.delete({
                    where: { id: targetUserId },
                });
            });
        } catch (error) {
            throw new InternalServerErrorException('Erro ao remover utilizador.');
        }


        try {
            await this.cadastrosDb.cadastro.updateMany({
                where: { login: userLogin },
                data: { ativo: false },
            });
        } catch (error) {
            console.warn(
                `AVISO: Falha na limpeza do 'cadastros.db' para ${userLogin}.`,
            );
        }

        return {
            message: `Utilizador ${userLogin} removido com sucesso.`,
        };
    }

    async findAllFornecedores() {
        return this.estoqueDb.fornecedor.findMany({ orderBy: { nome: 'asc' } });
    }

    async createFornecedor(nome: string) {
        if (!nome) throw new BadRequestException("Nome é obrigatório");
        return this.estoqueDb.fornecedor.create({ data: { nome } });
    }

    async updateFornecedor(id: number, nome: string) {
        if (!nome) throw new BadRequestException("Nome é obrigatório");
        return this.estoqueDb.fornecedor.update({
            where: { id },
            data: { nome }
        });
    }
    async deleteFornecedor(id: number) {
        const produtosVinculados = await this.estoqueDb.produto.count({
            where: { fornecedorId: id },
        });
        if (produtosVinculados > 0) {
            throw new BadRequestException(
                `Não é possível remover este fornecedor pois ele possui ${produtosVinculados} produtos cadastrados.`,
            );
        }
        return this.estoqueDb.fornecedor.delete({
            where: { id },
        });
    }
}