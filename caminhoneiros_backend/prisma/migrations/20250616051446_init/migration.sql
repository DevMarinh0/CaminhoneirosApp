-- DropForeignKey
ALTER TABLE "Foto" DROP CONSTRAINT "Foto_cadastroId_fkey";

-- AddForeignKey
ALTER TABLE "Foto" ADD CONSTRAINT "Foto_cadastroId_fkey" FOREIGN KEY ("cadastroId") REFERENCES "Cadastro"("id") ON DELETE CASCADE ON UPDATE CASCADE;
