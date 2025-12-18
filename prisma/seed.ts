import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 بدء تحميل البيانات الأولية...');

  // ═══════════════════════════════════════════════════
  // وحدات القياس - Units
  // ═══════════════════════════════════════════════════
  console.log('📏 إضافة وحدات القياس...');
  const units = await Promise.all([
    prisma.invUnit.upsert({
      where: { code: 'PCS' },
      update: {},
      create: { code: 'PCS', name: 'قطعة', nameEn: 'Piece' }
    }),
    prisma.invUnit.upsert({
      where: { code: 'MTR' },
      update: {},
      create: { code: 'MTR', name: 'متر', nameEn: 'Meter' }
    }),
    prisma.invUnit.upsert({
      where: { code: 'KG' },
      update: {},
      create: { code: 'KG', name: 'كيلوجرام', nameEn: 'Kilogram' }
    }),
    prisma.invUnit.upsert({
      where: { code: 'LTR' },
      update: {},
      create: { code: 'LTR', name: 'لتر', nameEn: 'Liter' }
    }),
    prisma.invUnit.upsert({
      where: { code: 'BOX' },
      update: {},
      create: { code: 'BOX', name: 'صندوق', nameEn: 'Box' }
    }),
    prisma.invUnit.upsert({
      where: { code: 'SET' },
      update: {},
      create: { code: 'SET', name: 'طقم', nameEn: 'Set' }
    }),
    prisma.invUnit.upsert({
      where: { code: 'ROLL' },
      update: {},
      create: { code: 'ROLL', name: 'لفة', nameEn: 'Roll' }
    }),
    prisma.invUnit.upsert({
      where: { code: 'PACK' },
      update: {},
      create: { code: 'PACK', name: 'عبوة', nameEn: 'Pack' }
    }),
  ]);
  console.log(`✅ تم إضافة ${units.length} وحدة قياس`);

  // ═══════════════════════════════════════════════════
  // التصنيفات - Categories
  // ═══════════════════════════════════════════════════
  console.log('📁 إضافة التصنيفات...');
  
  // التصنيفات الرئيسية
  const catElectrical = await prisma.invCategory.upsert({
    where: { code: 'ELEC' },
    update: {},
    create: { 
      code: 'ELEC', 
      name: 'مواد كهربائية', 
      nameEn: 'Electrical Materials',
      description: 'جميع المواد والمعدات الكهربائية'
    }
  });

  const catMechanical = await prisma.invCategory.upsert({
    where: { code: 'MECH' },
    update: {},
    create: { 
      code: 'MECH', 
      name: 'مواد ميكانيكية', 
      nameEn: 'Mechanical Materials',
      description: 'المواد والمعدات الميكانيكية'
    }
  });

  const catSafety = await prisma.invCategory.upsert({
    where: { code: 'SAFE' },
    update: {},
    create: { 
      code: 'SAFE', 
      name: 'معدات السلامة', 
      nameEn: 'Safety Equipment',
      description: 'معدات الأمان والسلامة'
    }
  });

  const catTools = await prisma.invCategory.upsert({
    where: { code: 'TOOL' },
    update: {},
    create: { 
      code: 'TOOL', 
      name: 'أدوات وعدد', 
      nameEn: 'Tools',
      description: 'الأدوات والعدد اليدوية والكهربائية'
    }
  });

  const catOffice = await prisma.invCategory.upsert({
    where: { code: 'OFFC' },
    update: {},
    create: { 
      code: 'OFFC', 
      name: 'مستلزمات مكتبية', 
      nameEn: 'Office Supplies',
      description: 'المستلزمات والأدوات المكتبية'
    }
  });

  // التصنيفات الفرعية للمواد الكهربائية
  await prisma.invCategory.upsert({
    where: { code: 'ELEC-CBL' },
    update: {},
    create: { 
      code: 'ELEC-CBL', 
      name: 'كابلات', 
      nameEn: 'Cables',
      parentId: catElectrical.id,
      description: 'الكابلات والأسلاك الكهربائية'
    }
  });

  await prisma.invCategory.upsert({
    where: { code: 'ELEC-SWT' },
    update: {},
    create: { 
      code: 'ELEC-SWT', 
      name: 'مفاتيح وقواطع', 
      nameEn: 'Switches & Breakers',
      parentId: catElectrical.id,
      description: 'المفاتيح والقواطع الكهربائية'
    }
  });

  await prisma.invCategory.upsert({
    where: { code: 'ELEC-TRF' },
    update: {},
    create: { 
      code: 'ELEC-TRF', 
      name: 'محولات', 
      nameEn: 'Transformers',
      parentId: catElectrical.id,
      description: 'المحولات الكهربائية'
    }
  });

  await prisma.invCategory.upsert({
    where: { code: 'ELEC-LGT' },
    update: {},
    create: { 
      code: 'ELEC-LGT', 
      name: 'إضاءة', 
      nameEn: 'Lighting',
      parentId: catElectrical.id,
      description: 'مواد ومعدات الإضاءة'
    }
  });

  // التصنيفات الفرعية للمواد الميكانيكية
  await prisma.invCategory.upsert({
    where: { code: 'MECH-PMP' },
    update: {},
    create: { 
      code: 'MECH-PMP', 
      name: 'مضخات', 
      nameEn: 'Pumps',
      parentId: catMechanical.id,
      description: 'المضخات بأنواعها'
    }
  });

  await prisma.invCategory.upsert({
    where: { code: 'MECH-VLV' },
    update: {},
    create: { 
      code: 'MECH-VLV', 
      name: 'صمامات', 
      nameEn: 'Valves',
      parentId: catMechanical.id,
      description: 'الصمامات والمحابس'
    }
  });

  await prisma.invCategory.upsert({
    where: { code: 'MECH-PIP' },
    update: {},
    create: { 
      code: 'MECH-PIP', 
      name: 'أنابيب', 
      nameEn: 'Pipes',
      parentId: catMechanical.id,
      description: 'الأنابيب والوصلات'
    }
  });

  const categories = await prisma.invCategory.count();
  console.log(`✅ تم إضافة ${categories} تصنيف`);

  // ═══════════════════════════════════════════════════
  // المستودعات - Warehouses
  // ═══════════════════════════════════════════════════
  console.log('🏭 إضافة المستودعات...');
  const warehouses = await Promise.all([
    prisma.invWarehouse.upsert({
      where: { code: 'WH-MAIN' },
      update: {},
      create: { 
        code: 'WH-MAIN', 
        name: 'المستودع الرئيسي', 
        nameEn: 'Main Warehouse',
        type: 'main',
        address: 'المنطقة الصناعية - الرياض',
        phone: '0112345678'
      }
    }),
    prisma.invWarehouse.upsert({
      where: { code: 'WH-EAST' },
      update: {},
      create: { 
        code: 'WH-EAST', 
        name: 'مستودع المنطقة الشرقية', 
        nameEn: 'Eastern Region Warehouse',
        type: 'sub',
        address: 'الدمام - المنطقة الصناعية الثانية',
        phone: '0132345678'
      }
    }),
    prisma.invWarehouse.upsert({
      where: { code: 'WH-WEST' },
      update: {},
      create: { 
        code: 'WH-WEST', 
        name: 'مستودع المنطقة الغربية', 
        nameEn: 'Western Region Warehouse',
        type: 'sub',
        address: 'جدة - المنطقة الصناعية',
        phone: '0122345678'
      }
    }),
    prisma.invWarehouse.upsert({
      where: { code: 'WH-TRANS' },
      update: {},
      create: { 
        code: 'WH-TRANS', 
        name: 'مستودع الترانزيت', 
        nameEn: 'Transit Warehouse',
        type: 'transit',
        address: 'الرياض - منطقة الشحن',
        phone: '0112345679'
      }
    }),
  ]);
  console.log(`✅ تم إضافة ${warehouses.length} مستودع`);

  // ═══════════════════════════════════════════════════
  // الموردين - Suppliers
  // ═══════════════════════════════════════════════════
  console.log('🏢 إضافة الموردين...');
  const suppliers = await Promise.all([
    prisma.invSupplier.upsert({
      where: { code: 'SUP-001' },
      update: {},
      create: { 
        code: 'SUP-001', 
        name: 'شركة الكابلات السعودية', 
        nameEn: 'Saudi Cables Company',
        type: 'local',
        category: 'A',
        taxNumber: '300012345600003',
        phone: '0112223344',
        email: 'info@saudicables.com',
        city: 'جدة',
        country: 'SA',
        paymentTerms: 30,
        creditLimit: 500000
      }
    }),
    prisma.invSupplier.upsert({
      where: { code: 'SUP-002' },
      update: {},
      create: { 
        code: 'SUP-002', 
        name: 'مؤسسة المعدات الكهربائية', 
        nameEn: 'Electrical Equipment Est.',
        type: 'local',
        category: 'B',
        taxNumber: '300012345600004',
        phone: '0113334455',
        email: 'sales@elec-equip.com',
        city: 'الرياض',
        country: 'SA',
        paymentTerms: 45,
        creditLimit: 200000
      }
    }),
    prisma.invSupplier.upsert({
      where: { code: 'SUP-003' },
      update: {},
      create: { 
        code: 'SUP-003', 
        name: 'شركة ABB العالمية', 
        nameEn: 'ABB International',
        type: 'international',
        category: 'A',
        phone: '+41584585858',
        email: 'orders@abb.com',
        city: 'زيورخ',
        country: 'CH',
        paymentTerms: 60,
        creditLimit: 1000000
      }
    }),
    prisma.invSupplier.upsert({
      where: { code: 'SUP-004' },
      update: {},
      create: { 
        code: 'SUP-004', 
        name: 'مصنع المضخات الوطني', 
        nameEn: 'National Pumps Factory',
        type: 'local',
        category: 'B',
        taxNumber: '300012345600005',
        phone: '0114445566',
        email: 'info@nationalpumps.sa',
        city: 'الدمام',
        country: 'SA',
        paymentTerms: 30,
        creditLimit: 300000
      }
    }),
  ]);
  console.log(`✅ تم إضافة ${suppliers.length} مورد`);

  console.log('');
  console.log('🎉 تم تحميل جميع البيانات الأولية بنجاح!');
  console.log('═══════════════════════════════════════════════════');
}

main()
  .catch((e) => {
    console.error('❌ خطأ في تحميل البيانات:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
