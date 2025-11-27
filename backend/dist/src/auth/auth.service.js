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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const usuarios_db_service_1 = require("../prisma/usuarios-db.service");
const bcrypt = __importStar(require("bcrypt"));
let AuthService = class AuthService {
    usuariosDb;
    jwtService;
    constructor(usuariosDb, jwtService) {
        this.usuariosDb = usuariosDb;
        this.jwtService = jwtService;
    }
    async login(login, pass) {
        const user = await this.usuariosDb.usuario.findUnique({
            where: { login },
            include: { funcoes: true },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Login ou senha inválidos.');
        }
        const isPasswordMatching = await bcrypt.compare(pass, user.senha);
        if (!isPasswordMatching) {
            throw new common_1.UnauthorizedException('Login ou senha inválidos.');
        }
        if (!user.ativo) {
            throw new common_1.UnauthorizedException('Usuário inativo.');
        }
        const funcoes = user.funcoes.map((r) => r.funcao);
        const payload = {
            sub: user.id,
            username: user.login,
            nome: user.nome,
            lojaId: user.lojaId,
            funcoes: funcoes,
        };
        return {
            token: await this.jwtService.signAsync(payload),
            user: {
                id: user.id,
                nome: user.nome,
                lojaId: user.lojaId,
                funcoes: funcoes,
            }
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [usuarios_db_service_1.UsuariosDbService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map