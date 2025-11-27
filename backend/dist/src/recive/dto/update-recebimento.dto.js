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
exports.UpdateRecebimentoDto = void 0;
const class_validator_1 = require("class-validator");
const estoque_client_1 = require("@prisma/estoque-client");
class UpdateRecebimentoDto {
    status;
    precoConfirmado;
}
exports.UpdateRecebimentoDto = UpdateRecebimentoDto;
__decorate([
    (0, class_validator_1.IsEnum)(estoque_client_1.EstadoEntrada, { message: 'Status inválido.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'O status é obrigatório.' }),
    __metadata("design:type", String)
], UpdateRecebimentoDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'O preço confirmado deve ser um número.' }),
    (0, class_validator_1.Min)(0, { message: 'O preço confirmado não pode ser negativo.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'O preço confirmado é obrigatório.' }),
    __metadata("design:type", Number)
], UpdateRecebimentoDto.prototype, "precoConfirmado", void 0);
//# sourceMappingURL=update-recebimento.dto.js.map