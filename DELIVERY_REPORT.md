# تقرير تسليم نظام إدارة المخزون والمشتريات

## نظرة عامة

تم بناء نظام إدارة المخزون والمشتريات الكامل باستخدام التقنيات التالية:
- **Backend**: NestJS + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **API Documentation**: Swagger/OpenAPI

## الوحدات المنفذة

### 1. البيانات الأساسية (Master Data)

| الوحدة | الوصف | APIs |
|--------|-------|------|
| التصنيفات | إدارة تصنيفات الأصناف بشكل هرمي | CRUD + Tree |
| وحدات القياس | إدارة وحدات القياس (قطعة، كيلو، لتر...) | CRUD |
| المستودعات | إدارة المستودعات والمخازن | CRUD |
| الأصناف | إدارة الأصناف مع الحد الأدنى والأقصى | CRUD + Stock Info |

### 2. إدارة الموردين

| الوحدة | الوصف | APIs |
|--------|-------|------|
| الموردين | إدارة بيانات الموردين | CRUD + Rating |
| العقود | إدارة عقود الموردين | CRUD + Status |

### 3. حركات المخزون

| نوع الحركة | الوصف | الحالات |
|------------|-------|---------|
| استلام (Receipt) | استلام بضائع من الموردين | draft → confirmed |
| صرف (Issue) | صرف مواد للأقسام | draft → confirmed |
| تحويل (Transfer) | تحويل بين المستودعات | draft → confirmed |
| تسوية (Adjustment) | تسوية فروقات الجرد | draft → confirmed |

### 4. دورة المشتريات الكاملة

```
طلب شراء → عروض أسعار → مقارنة → أمر شراء → محضر استلام
```

| المرحلة | الحالات |
|---------|---------|
| طلب الشراء | draft → submitted → approved/rejected → converted |
| عرض السعر | pending → received → accepted/rejected |
| أمر الشراء | draft → approved → sent → partial/received |
| محضر الاستلام | draft → confirmed |

### 5. التقارير

| التقرير | الوصف |
|---------|-------|
| لوحة التحكم | ملخص شامل للنظام |
| تقرير المخزون | أرصدة المخزون حسب المستودع |
| الأصناف تحت الحد الأدنى | تنبيهات إعادة الطلب |
| حركات المخزون | تقرير الحركات بفترة |
| الأصناف المنتهية الصلاحية | تنبيهات الصلاحية |
| تقرير المشتريات | تحليل المشتريات |
| أداء الموردين | تقييم الموردين |

## هيكل قاعدة البيانات

### الجداول الرئيسية

```
inv_categories          - التصنيفات
inv_units               - وحدات القياس
inv_warehouses          - المستودعات
inv_items               - الأصناف
inv_warehouse_items     - أرصدة المخزون
inv_suppliers           - الموردين
inv_supplier_contracts  - عقود الموردين
inv_movements           - حركات المخزون
inv_movement_items      - تفاصيل الحركات
inv_purchase_requests   - طلبات الشراء
inv_purchase_request_items - تفاصيل طلبات الشراء
inv_quotations          - عروض الأسعار
inv_quotation_items     - تفاصيل عروض الأسعار
inv_purchase_orders     - أوامر الشراء
inv_purchase_order_items - تفاصيل أوامر الشراء
inv_goods_receipts      - محاضر الاستلام
inv_goods_receipt_items - تفاصيل محاضر الاستلام
inv_sequences           - الأرقام التسلسلية
```

## نقاط API الرئيسية

### التصنيفات
- `GET /api/categories` - جلب التصنيفات
- `POST /api/categories` - إنشاء تصنيف
- `GET /api/categories/tree` - الشجرة الهرمية

### الأصناف
- `GET /api/items` - جلب الأصناف
- `POST /api/items` - إنشاء صنف
- `GET /api/items/:id/stock` - رصيد الصنف

### حركات المخزون
- `POST /api/movements` - إنشاء حركة
- `POST /api/movements/:id/confirm` - تأكيد الحركة

### طلبات الشراء
- `POST /api/purchase-requests` - إنشاء طلب
- `POST /api/purchase-requests/:id/submit` - تقديم الطلب
- `POST /api/purchase-requests/:id/approve` - الموافقة

### عروض الأسعار
- `POST /api/quotations` - إنشاء عرض
- `GET /api/quotations/compare/:requestId` - مقارنة العروض
- `POST /api/quotations/:id/accept` - قبول العرض

### أوامر الشراء
- `POST /api/purchase-orders` - إنشاء أمر
- `POST /api/purchase-orders/from-quotation/:id` - من عرض سعر
- `POST /api/purchase-orders/:id/send` - إرسال للمورد

### محاضر الاستلام
- `POST /api/goods-receipts` - إنشاء محضر
- `POST /api/goods-receipts/:id/confirm` - تأكيد وتحديث المخزون

### التقارير
- `GET /api/reports/dashboard` - لوحة التحكم
- `GET /api/reports/stock` - تقرير المخزون
- `GET /api/reports/stock/low` - الأصناف تحت الحد الأدنى
- `GET /api/reports/purchases` - تقرير المشتريات
- `GET /api/reports/suppliers/performance` - أداء الموردين

## الميزات التقنية

### إدارة المخزون
- حساب التكلفة المتوسطة المرجحة (Weighted Average Cost)
- تتبع الكميات المتاحة والمحجوزة
- دعم أرقام الدفعات والأرقام التسلسلية
- تتبع تواريخ الصلاحية

### الأرقام التسلسلية
- توليد تلقائي بصيغة: `PREFIX-YYYY-NNNNNN`
- مثال: `PR-2025-000001` لطلبات الشراء

### التحقق والأمان
- التحقق من صحة البيانات (Validation)
- منع التعديل على المستندات المؤكدة
- تتبع المستخدم المنشئ والمعدل

## تشغيل النظام

```bash
# تثبيت التبعيات
pnpm install

# إعداد قاعدة البيانات
npx prisma db push

# تشغيل الخادم
pnpm nx serve api
```

## الوصول للتوثيق

- **Swagger UI**: http://localhost:3000/api/docs
- **API Base URL**: http://localhost:3000/api

## المستودع

- **GitHub**: https://github.com/alabasi2025/06-inventory-system

---

تم التنفيذ بتاريخ: 2025-12-18
