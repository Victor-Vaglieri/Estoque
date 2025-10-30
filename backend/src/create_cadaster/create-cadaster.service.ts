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
        // Injete o serviço de DB correto
        private cadastrosDb: CadastrosDbService
    ) {}

    /**
     * Cria uma nova solicitação de cadastro no cadastros.db
     */
    async create(dto: CreateRegistrationDto) {
        const { nome, login, senha } = dto;

        // 1. Fazer o hash da senha antes de salvar
        const hashedPassword = await bcrypt.hash(senha, 10);

        try {
            // 2. Criar a nova entrada no banco de dados 'cadastros'
            const newRegistration = await this.cadastrosDb.cadastro.create({
                data: {
                    nome,
                    login,
                    senha: hashedPassword,
                    // responsavelId é opcional (Nullable), então será 'null' por padrão
                },
            });
            
            // Retorna uma mensagem de sucesso, sem expor dados sensíveis
            return { message: 'Solicitação de cadastro enviada com sucesso.' };

        } catch (error) {
            // 3. Tratar erro de login duplicado
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                
                // --- CORREÇÃO AQUI ---
                // Verificamos com segurança se 'target' existe e se é um array (ou string)
                // que contém o campo 'login'
                const target = error.meta?.target;
                let isLoginConflict = false;

                if (typeof target === 'string') {
                    isLoginConflict = target.includes('login');
                } else if (Array.isArray(target)) {
                    isLoginConflict = target.includes('login');
                }
                // --- FIM DA CORREÇÃO ---

                if (isLoginConflict) {
                     throw new ConflictException('Este login já foi solicitado ou já existe.');
                }
            }
            
            // Log do erro para depuração
            console.error("Erro ao salvar solicitação de cadastro:", error);
            // Lança um erro genérico
            throw new InternalServerErrorException('Erro ao salvar a solicitação.');
        }
    }
}

