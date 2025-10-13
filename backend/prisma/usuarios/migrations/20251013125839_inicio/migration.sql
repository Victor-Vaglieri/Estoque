/*
  Warnings:

  - You are about to drop the column `funcao` on the `Usuario` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "UsuarioFuncao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER NOT NULL,
    "funcao" TEXT NOT NULL,
    CONSTRAINT "UsuarioFuncao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Usuario" ("ativo", "createdAt", "id", "login", "nome", "senha") SELECT "ativo", "createdAt", "id", "login", "nome", "senha" FROM "Usuario";
DROP TABLE "Usuario";
ALTER TABLE "new_Usuario" RENAME TO "Usuario";
CREATE UNIQUE INDEX "Usuario_login_key" ON "Usuario"("login");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
