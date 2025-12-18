import { Module } from '@nestjs/common';
import { GoodsReceiptsService } from './goods-receipts.service';
import { GoodsReceiptsController } from './goods-receipts.controller';
import { SequenceService } from '../../common/services/sequence.service';
import { StockService } from '../../common/services/stock.service';

@Module({
  controllers: [GoodsReceiptsController],
  providers: [GoodsReceiptsService, SequenceService, StockService],
  exports: [GoodsReceiptsService],
})
export class GoodsReceiptsModule {}
