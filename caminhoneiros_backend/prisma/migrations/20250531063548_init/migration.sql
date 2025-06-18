-- CreateTable
CREATE TABLE "Cadastro" (
    "id" SERIAL NOT NULL,
    "transportadora" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "placa" TEXT NOT NULL,
    "destino" TEXT NOT NULL,
    "dataCadastro" TEXT NOT NULL,

    CONSTRAINT "Cadastro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Foto" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "cadastroId" INTEGER NOT NULL,

    CONSTRAINT "Foto_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Foto" ADD CONSTRAINT "Foto_cadastroId_fkey" FOREIGN KEY ("cadastroId") REFERENCES "Cadastro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
