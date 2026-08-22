import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanTokens() {
  const before = await prisma.refreshToken.count();
  console.log(`Total refresh tokens in DB before: ${before}`);

  // Delete all expired tokens
  const expired = await prisma.refreshToken.deleteMany({
    where: { expiresAt: { lt: new Date() } }
  });
  console.log(`Deleted ${expired.count} expired tokens.`);

  // Keep only the most recent 1 token per user
  const users = await prisma.user.findMany({ select: { id: true, email: true } });
  let cleanedDuplicates = 0;

  for (const u of users) {
    const tokens = await prisma.refreshToken.findMany({
      where: { userId: u.id },
      orderBy: { createdAt: 'desc' }
    });

    if (tokens.length > 1) {
      const toDelete = tokens.slice(1).map(t => t.id);
      await prisma.refreshToken.deleteMany({
        where: { id: { in: toDelete } }
      });
      cleanedDuplicates += toDelete.length;
      console.log(`- Cleaned ${toDelete.length} old tokens for ${u.email}`);
    }
  }

  const after = await prisma.refreshToken.count();
  console.log(`Cleaned ${cleanedDuplicates} duplicate session tokens.`);
  console.log(`Total refresh tokens in DB now: ${after}`);

  await prisma.$disconnect();
}

cleanTokens().catch(err => {
  console.error(err);
  process.exit(1);
});
