const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    await prisma.usuarios.create({
        data: {
            nome: "Teste User",
            email: "teste@email.com",
            senha: "123456",
            tipo: "jogador"
        }
    });

    console.log("Usuário cadastrado com sucesso!");
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
