import {
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service.js';
import { AdminGuard } from '../common/guards/admin.guard.js';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Payments')
@UseGuards(AdminGuard)
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ApiOperation({ summary: 'Mark a payment as paid' })
  @ApiParam({
    name: 'id',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the payment',
    required: true,
  })
  @Patch(':id/paid')
  async markAsPaid(@Param('id', ParseUUIDPipe) id: string) {
    const payment = await this.paymentService.markAsPaid(id);

    return {
      message: 'Payment marked as paid successfully',
      payment,
    };
  }
}
