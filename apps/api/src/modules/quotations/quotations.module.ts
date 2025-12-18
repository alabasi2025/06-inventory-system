import { Module } from '@nestjs/common';
import { QuotationsService } from './quotations.service';
import { QuotationsController } from './quotations.controller';
import { SequenceService } from '../../common/services/sequence.service';

@Module({
  controllers: [QuotationsController],
  providers: [QuotationsService, SequenceService],
  exports: [QuotationsService],
})
export class QuotationsModule {}
