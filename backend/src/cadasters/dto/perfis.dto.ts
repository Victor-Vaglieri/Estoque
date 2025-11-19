import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

import { Funcao } from '@prisma/usuarios-client';

export class AprovarSolicitacaoDto {
  @IsArray()
  @IsEnum(Funcao, { each: true, message: 'Função inválida fornecida.' })
  funcoes: Funcao[];

  @IsNumber({}, { message: 'ID da loja deve ser um número.' })
  @IsNotEmpty({ message: 'A loja é obrigatória.' })
  lojaId: number;
}

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  nome: string;

  @IsString()
  @IsNotEmpty({ message: 'O login é obrigatório.' })
  login: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
  senha?: string; 

  @IsNumber({}, { message: 'ID da loja deve ser um número.' })
  @IsNotEmpty({ message: 'A loja é obrigatória.' })
  lojaId: number;

  @IsArray()
  @IsEnum(Funcao, { each: true, message: 'Função inválida fornecida.' })
  funcoes: Funcao[];
}