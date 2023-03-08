import { Mutation, Args, Query, Subscription, Resolver } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User } from 'src/users/entities/user.entity';
import { CreateOrderOutput, CreateOrderInput } from './dtos/create-order.dto';
import { EditOrderOutput, EditOrderInput } from './dtos/edit-order.dto';
import { GetOrderOutput, GetOrderInput } from './dtos/get-order.dto';
import { GetOrdersOutput, GetOrdersInput } from './dtos/get-orders.dto';
import { OrderService } from './orders.service';
import { PUB_SUB } from 'src/common/common.constants';
import { Inject } from '@nestjs/common';
import { Order } from './entities/order.entity';

@Resolver(() => Order)
export class OrderResolver {
  constructor(
    private readonly orderService: OrderService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  @Mutation(() => CreateOrderOutput)
  @Role(['Customer'])
  async createOrder(
    @AuthUser() customer: User,
    @Args('input') createOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    return this.orderService.createOrder(customer, createOrderInput);
  }

  @Query(() => GetOrdersOutput)
  @Role(['Any'])
  async getOrders(
    @AuthUser() user: User,
    @Args('input') getOrdersInput: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    return this.orderService.getOrders(user, getOrdersInput);
  }

  @Query(() => GetOrderOutput)
  @Role(['Any'])
  async getOrder(
    @AuthUser() user: User,
    @Args('input') getOrderInput: GetOrderInput,
  ): Promise<GetOrderOutput> {
    return this.orderService.getOrder(user, getOrderInput);
  }

  @Mutation(() => EditOrderOutput)
  @Role(['Any'])
  async editOrder(
    @AuthUser() user: User,
    @Args('input') editOrderInput: EditOrderInput,
  ): Promise<EditOrderOutput> {
    return this.orderService.editOrder(user, editOrderInput);
  }

  @Mutation(() => Boolean)
  elsaLoveAnna(@Args('times') times: number) {
    this.pubSub.publish('elsa', {
      elsaAnna: times,
    });
    return true;
  }

  @Subscription(() => String, {
    filter: ({ elsaAnna }, { times }, context) => {
      return elsaAnna === times;
    },
    resolve: ({ elsaAnna }) => `Elsa loves Anna ${elsaAnna} times.`,
  })
  @Role(['Any'])
  elsaAnna(@Args('times') times: number) {
    return this.pubSub.asyncIterator('elsa');
  }
}
