import { Module } from '@nestjs/common';
import { MovementsService } from './movements.service';
import { MovementsController } from './movements.controller';
import { SequenceService } from '../../common/services/sequence.service';
import { StockService } from '../../common/services/stock.service';

@Module({
  controllers: [MovementsController],
  providers: [MovementsService, SequenceService, StockService],
  exports: [MovementsService, SequenceService, StockService],
})
export class MovementsModule {}
