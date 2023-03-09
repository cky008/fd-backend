import { ObjectType, Field, Int } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, Column, ManyToOne, RelationId } from 'typeorm';

@ObjectType()
@Entity()
export class Payment extends CoreEntity {
  @Field(() => Int)
  @Column()
  transactionId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.payments)
  user: User;

  @RelationId((payment: Payment) => payment.user)
  userId: number;

  @Field(() => Restaurant)
  @ManyToOne(() => Restaurant)
  restaurant: Restaurant;

  @RelationId((payment: Payment) => payment.restaurant)
  restaurantId: number;
}
