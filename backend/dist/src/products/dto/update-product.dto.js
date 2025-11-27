"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProdutoDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_product_dto_1 = require("./create-product.dto");
class UpdateProdutoDto extends (0, mapped_types_1.PartialType)(create_product_dto_1.CreateProdutoDto) {
}
exports.UpdateProdutoDto = UpdateProdutoDto;
//# sourceMappingURL=update-product.dto.js.map