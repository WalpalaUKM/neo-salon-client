import { PrismaClient, Prisma } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const userData: Prisma.UserCreateInput[] = [
  {
      email: "admin@salon.com",
      password: "$2a$12$hJbcEBOF3CQ3E23D1.Emd.FAu0QTw.ylTtweoceYhbOCPRDGb1x8y",
      firstName: "Admin",
      lastName: "Neo",
      role: "ADMIN",
      privileges:[]
  },
  {
      email: "JohnD@gamil.com",
      password:"$2a$12$v2FYvjrdbw8LiQO1owjVgOwlOPfw3bmrz9MOvUGSJf1GMtLyO1fdi",
      firstName: "John",
      lastName: "Doe",
      role: "USER",
      privileges: []
  },
  {
        email: "kalanaa@yahoo.com",
        password: "$2a$12$ZI2ovZFoCgDzi5c08ZIjmOzJdmSsj2cTHra7VrFRelTxYn1LanuL.",  
        firstName: "Kalana",
        lastName: "Achintha",
        role: "USER",
        privileges: [] 
  }

];

export async function main() {
  for (const u of userData) {
    await prisma.user.create({ data: u });
  }
}

main();