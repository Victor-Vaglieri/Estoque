import { IsNotEmpty, IsObject, IsArray, IsString } from 'class-validator';

export class LegacyPayloadDto {
  @IsObject()
  @IsNotEmpty()
  fixos: Record<string, any>;

  @IsArray()
  multiplos: Record<string, any>[];
}

export class TipoParamDto {
  @IsString()
  @IsNotEmpty()
  tipo: 'costura' | 'tingimento' | 'tapete';
}