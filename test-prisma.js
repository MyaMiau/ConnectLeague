const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function test() {
    const replies = await prisma.reply.findMany();
    console.log(replies);
}
test();