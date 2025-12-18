import { Module } from '@nestjs/common';
import { PurchaseRequestsService } from './purchase-requests.service';
import { PurchaseRequestsController } from './purchase-requests.controller';
import { SequenceService } from '../../common/services/sequence.service';

@Module({
  controllers: [PurchaseRequestsController],
  providers: [PurchaseRequestsService, SequenceService],
  exports: [PurchaseRequestsService],
})
export class PurchaseRequestsModule {}
