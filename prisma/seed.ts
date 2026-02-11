import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

const now = new Date();

async function clean() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.draftLayoutItemImage.deleteMany();
  await prisma.draftLayoutItem.deleteMany();
  await prisma.draftSelectedOption.deleteMany();
  await prisma.draft.deleteMany();
  await prisma.uploadedImage.deleteMany();
  await prisma.userAddress.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.templateLayoutItem.deleteMany();
  await prisma.productTemplate.deleteMany();
  await prisma.productOptionValue.deleteMany();
  await prisma.productOptionType.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();
}

async function main() {
  let customerRole = await prisma.role.findFirst({ where: { type: 'customer' } });
  if (!customerRole) {
    customerRole = await prisma.role.create({
      data: {
        id: randomUUID(),
        type: 'customer',
        createdAt: now,
        updatedAt: now,
      },
    });
  }

  let adminRole = await prisma.role.findFirst({ where: { type: 'admin' } });
  if (!adminRole) {
    adminRole = await prisma.role.create({
      data: {
        id: randomUUID(),
        type: 'admin',
        createdAt: now,
        updatedAt: now,
      },
    });
  }

  let user = await prisma.user.findFirst({ where: { clerkId: 'user_test_seed_user' } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: randomUUID(),
        clerkId: 'user_test_seed_user',
        email: 'test@example.com',
        roleId: customerRole.id,
        createdAt: now,
        updatedAt: now,
      },
    });
  }

  let category = await prisma.productCategory.findFirst({ where: { name: 'Calendars' } });
  if (!category) {
    category = await prisma.productCategory.create({
      data: {
        id: randomUUID(),
        name: 'Calendars',
        status: 'active',
        description: 'Photo calendars',
        createdAt: now,
        updatedAt: now,
      },
    });
  }

  let product = await prisma.product.findFirst({ where: { name: 'Photo Calendar' } });
  if (!product) {
    product = await prisma.product.create({
      data: {
        id: randomUUID(),
        categoryId: category.id,
        name: 'Photo Calendar',
        description: '12-month photo calendar',
        basePrice: 500,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      },
    });
  }

  let template = await prisma.productTemplate.findFirst({
    where: {
      productId: product.id,
      name: 'Default Calendar Template',
    },
  });
  if (!template) {
    template = await prisma.productTemplate.create({
      data: {
        id: randomUUID(),
        productId: product.id,
        name: 'Default Calendar Template',
        description: '12 pages, 1 image per page',
        status: 'active',
        createdAt: now,
        updatedAt: now,
      },
    });
  }

  const constraintsJson = {
    max_images: 1,
    aspect_ratio: '4:5',
  };

  // Cover slot (layoutIndex: 0)
  const coverLayoutItem = await prisma.templateLayoutItem.findFirst({
    where: {
      templateId: template.id,
      layoutIndex: 0,
    },
  });
  if (!coverLayoutItem) {
    await prisma.templateLayoutItem.create({
      data: {
        id: randomUUID(),
        templateId: template.id,
        layoutIndex: 0,
        type: 'image',
        editable: true,
        constraintsJson: {
          max_images: 1,
          aspect_ratio: '3:4',
        },
        createdAt: now,
        updatedAt: now,
      },
    });
  }

  // Month slots (layoutIndex: 1-12)
  for (let i = 0; i < 12; i++) {
    const layoutIndex = i + 1;
    const existingItem = await prisma.templateLayoutItem.findFirst({
      where: {
        templateId: template.id,
        layoutIndex,
      },
    });
    if (!existingItem) {
      await prisma.templateLayoutItem.create({
        data: {
          id: randomUUID(),
          templateId: template.id,
          layoutIndex,
          type: 'image',
          editable: true,
          constraintsJson,
          createdAt: now,
          updatedAt: now,
        },
      });
    }
  }
}

async function runSeed(shouldClean = false) {
  if (shouldClean) {
    console.log('Cleaning database...');
    await clean();
    console.log('Database cleaned.');
  }

  console.log('Seeding database...');
  await main();
  console.log('Database seeded successfully.');
}

const shouldClean = process.argv.includes('--clean') || process.env.CLEAN === 'true';

runSeed(shouldClean)
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
