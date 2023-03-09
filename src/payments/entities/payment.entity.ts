import { ObjectType, Field, Int, InputType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, Column, ManyToOne, RelationId } from 'typeorm';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Payment extends CoreEntity {
  @Column()
  @Field(() => String)
  transactionId: string;

  @ManyToOne(() => User, (user) => user.payments)
  @Field(() => User)
  user: User;

  @RelationId((payment: Payment) => payment.user)
  userId: number;

  @ManyToOne(() => Restaurant)
  @Field(() => Restaurant)
  restaurant: Restaurant;

  @Field(() => Int)
  @RelationId((payment: Payment) => payment.restaurant)
  restaurantId: number;
}
