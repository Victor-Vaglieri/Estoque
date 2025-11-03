import { PartialType } from '@nestjs/mapped-types';
import { CreateSaidaDto } from './create-saida.dto';

/**
 * Valida os dados para ATUALIZAR (PATCH) uma Saída.
 * Todos os campos de CreateSaidaDto são opcionais.
 */
export class UpdateSaidaDto extends PartialType(CreateSaidaDto) {}
