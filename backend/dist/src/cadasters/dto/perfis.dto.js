"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserDto = exports.AprovarSolicitacaoDto = void 0;
const class_validator_1 = require("class-validator");
const usuarios_client_1 = require("@prisma/usuarios-client");
class AprovarSolicitacaoDto {
    funcoes;
    lojaId;
}
exports.AprovarSolicitacaoDto = AprovarSolicitacaoDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(usuarios_client_1.Funcao, { each: true, message: 'Função inválida fornecida.' }),
    __metadata("design:type", Array)
], AprovarSolicitacaoDto.prototype, "funcoes", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'ID da loja deve ser um número.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'A loja é obrigatória.' }),
    __metadata("design:type", Number)
], AprovarSolicitacaoDto.prototype, "lojaId", void 0);
class UpdateUserDto {
    nome;
    login;
    senha;
    lojaId;
    funcoes;
}
exports.UpdateUserDto = UpdateUserDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'O nome é obrigatório.' }),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "nome", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'O login é obrigatório.' }),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "login", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6, { message: 'A senha deve ter no mínimo 6 caracteres.' }),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "senha", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'ID da loja deve ser um número.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'A loja é obrigatória.' }),
    __metadata("design:type", Number)
], UpdateUserDto.prototype, "lojaId", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(usuarios_client_1.Funcao, { each: true, message: 'Função inválida fornecida.' }),
    __metadata("design:type", Array)
], UpdateUserDto.prototype, "funcoes", void 0);
//# sourceMappingURL=perfis.dto.js.map