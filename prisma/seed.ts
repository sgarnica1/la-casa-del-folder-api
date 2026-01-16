import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SEED_USER_ID = '00000000-0000-0000-0000-000000000000';
const CALENDARS_CATEGORY_ID = '00000000-0000-0000-0000-000000000001';
const PHOTO_CALENDAR_PRODUCT_ID = '00000000-0000-0000-0000-000000000002';
const DEFAULT_TEMPLATE_ID = '00000000-0000-0000-0000-000000000003';

const SEED_TIMESTAMP = new Date('2024-01-01T00:00:00.000Z');

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
  await prisma.templateLayoutItem.deleteMany();
  await prisma.productTemplate.deleteMany();
  await prisma.productOptionValue.deleteMany();
  await prisma.productOptionType.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();
}

async function main() {
  const user = await prisma.user.upsert({
    where: { id: SEED_USER_ID },
    update: {},
    create: {
      id: SEED_USER_ID,
      clerkId: 'user_test_seed_user',
      email: 'test@example.com',
      createdAt: SEED_TIMESTAMP,
      updatedAt: SEED_TIMESTAMP,
    },
  });

  const category = await prisma.productCategory.upsert({
    where: { id: CALENDARS_CATEGORY_ID },
    update: {},
    create: {
      id: CALENDARS_CATEGORY_ID,
      name: 'Calendars',
      status: 'active',
      description: 'Photo calendars',
      createdAt: SEED_TIMESTAMP,
      updatedAt: SEED_TIMESTAMP,
    },
  });

  const product = await prisma.product.upsert({
    where: { id: PHOTO_CALENDAR_PRODUCT_ID },
    update: {},
    create: {
      id: PHOTO_CALENDAR_PRODUCT_ID,
      categoryId: category.id,
      name: 'Photo Calendar',
      description: '12-month photo calendar',
      basePrice: 2999,
      status: 'active',
      createdAt: SEED_TIMESTAMP,
      updatedAt: SEED_TIMESTAMP,
    },
  });

  const template = await prisma.productTemplate.upsert({
    where: { id: DEFAULT_TEMPLATE_ID },
    update: {},
    create: {
      id: DEFAULT_TEMPLATE_ID,
      productId: product.id,
      name: 'Default Calendar Template',
      description: '12 pages, 1 image per page',
      status: 'active',
      createdAt: SEED_TIMESTAMP,
      updatedAt: SEED_TIMESTAMP,
    },
  });

  const constraintsJson = {
    max_images: 1,
    aspect_ratio: '4:5',
  };

  const layoutItemIds = [
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000012',
    '00000000-0000-0000-0000-000000000013',
    '00000000-0000-0000-0000-000000000014',
    '00000000-0000-0000-0000-000000000015',
    '00000000-0000-0000-0000-000000000016',
    '00000000-0000-0000-0000-000000000017',
    '00000000-0000-0000-0000-000000000018',
    '00000000-0000-0000-0000-000000000019',
    '00000000-0000-0000-0000-00000000001a',
    '00000000-0000-0000-0000-00000000001b',
  ];

  for (let i = 0; i < 12; i++) {
    await prisma.templateLayoutItem.upsert({
      where: { id: layoutItemIds[i] },
      update: {},
      create: {
        id: layoutItemIds[i],
        templateId: template.id,
        layoutIndex: i + 1,
        type: 'image',
        editable: true,
        constraintsJson,
        createdAt: SEED_TIMESTAMP,
        updatedAt: SEED_TIMESTAMP,
      },
    });
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
