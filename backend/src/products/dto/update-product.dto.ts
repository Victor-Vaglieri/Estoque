import { PartialType } from '@nestjs/mapped-types';
import { CreateProdutoDto } from './create-product.dto';

/**
 * MUDANÇA: O UpdateDTO agora usa PartialType.
 * Isso torna TODOS os campos do CreateProdutoDto opcionais,
 * o que é perfeito para o método PATCH, pois o frontend
 * pode enviar apenas os campos que mudaram.
 */
export class UpdateProdutoDto extends PartialType(CreateProdutoDto) {}