import { Module } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { SequenceService } from '../../common/services/sequence.service';

@Module({
  controllers: [PurchaseOrdersController],
  providers: [PurchaseOrdersService, SequenceService],
  exports: [PurchaseOrdersService],
})
export class PurchaseOrdersModule {}
