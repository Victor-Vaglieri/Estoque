import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class UpdateLoginDto {
  @IsString({ message: 'O login deve ser um texto.' })
  @IsNotEmpty({ message: 'O login não pode estar vazio.' })
  @MinLength(3, { message: 'O login deve ter pelo menos 3 caracteres.' })
  login: string;
}
