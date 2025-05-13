import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'pk_orders' })
  id: string;

  @Column({ name: 'public_id', type: 'text' })
  @Index('idx_orders_public_id_unique', ['public_id'], { unique: true })
  publicId: string;

  @Column({ name: 'order_number', type: 'text' })
  @Index('idx_orders_order_number_unique', ['order_number'], { unique: true })
  orderNumber: string;

  @Column({ name: 'payment_description', type: 'text' })
  paymentDescription: string;

  @Column({ name: 'street_address', type: 'text' })
  streetAddress: string;

  @Column({ type: 'text' })
  town: string;

  @Column({ type: 'text' })
  country: string;

  @Column({ type: 'text' })
  currency: string;

  @Column('integer')
  amount: number;

  @Column({ name: 'payment_due_date', type: 'timestamp with time zone' })
  paymentDueDate: Date;

  @CreateDateColumn({ name: 'create_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'update_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
