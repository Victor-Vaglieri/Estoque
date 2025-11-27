"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationService = void 0;
const common_1 = require("@nestjs/common");
const cadastros_db_service_1 = require("../prisma/cadastros-db.service");
const cadastros_client_1 = require("@prisma/cadastros-client");
const bcrypt = __importStar(require("bcrypt"));
let RegistrationService = class RegistrationService {
    cadastrosDb;
    constructor(cadastrosDb) {
        this.cadastrosDb = cadastrosDb;
    }
    async create(dto) {
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
        }
        catch (error) {
            if (error instanceof cadastros_client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                const target = error.meta?.target;
                let isLoginConflict = false;
                if (typeof target === 'string') {
                    isLoginConflict = target.includes('login');
                }
                else if (Array.isArray(target)) {
                    isLoginConflict = target.includes('login');
                }
                if (isLoginConflict) {
                    throw new common_1.ConflictException('Este login já foi solicitado ou já existe.');
                }
            }
            console.error("Erro ao salvar solicitação de cadastro:", error);
            throw new common_1.InternalServerErrorException('Erro ao salvar a solicitação.');
        }
    }
};
exports.RegistrationService = RegistrationService;
exports.RegistrationService = RegistrationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cadastros_db_service_1.CadastrosDbService])
], RegistrationService);
//# sourceMappingURL=create-cadaster.service.js.map