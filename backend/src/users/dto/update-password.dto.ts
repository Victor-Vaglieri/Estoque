import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'A senha atual é obrigatória.' })
  currentPassword: string;

  @IsString()
  @IsNotEmpty({ message: 'A nova senha é obrigatória.' })
  @MinLength(4, { message: 'A nova senha deve ter pelo menos 4 caracteres.' })
  newPassword: string;
}
