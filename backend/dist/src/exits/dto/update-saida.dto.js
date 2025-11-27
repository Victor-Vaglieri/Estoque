"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSaidaDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_saida_dto_1 = require("./create-saida.dto");
class UpdateSaidaDto extends (0, mapped_types_1.PartialType)(create_saida_dto_1.CreateSaidaDto) {
}
exports.UpdateSaidaDto = UpdateSaidaDto;
//# sourceMappingURL=update-saida.dto.js.map