import { IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * Define a estrutura de dados e regras de validação para o corpo (body)
 * da requisição POST /cadastrar_usuario.
 */
export class CreateRegistrationDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome não pode estar vazio.' })
  nome: string;

  @IsString()
  @IsNotEmpty({ message: 'O login não pode estar vazio.' })
  login: string;

  @IsString()
  @IsNotEmpty({ message: 'A senha não pode estar vazia.' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
  senha: string;
}
