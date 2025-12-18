import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SequenceService {
  constructor(private prisma: PrismaService) {}

  async getNextNumber(type: string, prefix: string): Promise<string> {
    const currentYear = new Date().getFullYear();

    // Try to find existing sequence for this type and year
    let sequence = await this.prisma.inv_sequences.findFirst({
      where: {
        type,
        year: currentYear,
      },
    });

    if (!sequence) {
      // Create new sequence for this year
      sequence = await this.prisma.inv_sequences.create({
        data: {
          type,
          prefix,
          year: currentYear,
          current_no: 1,
        },
      });
    } else {
      // Increment the sequence
      sequence = await this.prisma.inv_sequences.update({
        where: { id: sequence.id },
        data: {
          current_no: { increment: 1 },
        },
      });
    }

    // Format: PREFIX-YYYY-NNNNNN
    const paddedNumber = String(sequence.current_no).padStart(6, '0');
    return `${prefix}-${currentYear}-${paddedNumber}`;
  }
}
