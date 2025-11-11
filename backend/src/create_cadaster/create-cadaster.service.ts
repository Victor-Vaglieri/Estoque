import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
// Importe o serviço do DB de cadastros (ajuste o caminho se necessário)
import { CadastrosDbService } from '../prisma/cadastros-db.service'; 
// Importe o tipo Prisma do cliente de cadastros
import { Prisma } from '@prisma/cadastros-client'; 
import { CreateRegistrationDto } from './dto/create-cadaster.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class RegistrationService {
    constructor(
        private cadastrosDb: CadastrosDbService
    ) {}

    async create(dto: CreateRegistrationDto) {
        const { nome, login, senha } = dto;
        const hashedPassword = await bcrypt.hash(senha, 12);
        try {
            const newRegistration = await this.cadastrosDb.cadastro.create({
                data: {
                    nome,
                    login,
                    senha: hashedPassword,
                },
            });
            return { message: 'Solicitação de cadastro enviada com sucesso.' };

        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                const target = error.meta?.target;
                let isLoginConflict = false;

                if (typeof target === 'string') {
                    isLoginConflict = target.includes('login');
                } else if (Array.isArray(target)) {
                    isLoginConflict = target.includes('login');
                }

                if (isLoginConflict) {
                     throw new ConflictException('Este login já foi solicitado ou já existe.');
                }
            }
            console.error("Erro ao salvar solicitação de cadastro:", error);
            throw new InternalServerErrorException('Erro ao salvar a solicitação.');
        }
    }
}

