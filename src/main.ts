import { PrismaClient as EstoqueClient } from '@prisma/estoque-client';
import { PrismaClient as UsuariosClient } from '@prisma/usuarios-client';

const estoque = new EstoqueClient();
const usuarios = new UsuariosClient();

