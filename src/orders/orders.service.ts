import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
  ) {}

  async crateOrder(
    customer: User,
    { restaurantId, items }: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: { id: restaurantId },
      });
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      let orderFinalPrice = 0;
      const orderItems: OrderItem[] = [];
      for (const item of items) {
        const dish = await this.dishes.findOne({ where: { id: item.dishId } });
        if (!dish) {
          return { ok: false, error: 'Dish not found' };
        }
        let dishFinalPrice = dish.price;
        for (const itemOption of item.options) {
          const dishOption = dish.options.find(
            (dishOption) => dishOption.name === itemOption.name,
          );
          if (dishOption) {
            if (dishOption.extra) {
              dishFinalPrice += dishOption.extra;
            } else {
              const dishOptionChoice = dishOption.choices.find(
                (optionChoice) => optionChoice.name === itemOption.choice,
              );
              if (dishOptionChoice) {
                if (dishOptionChoice.extra) {
                  dishFinalPrice += dishOptionChoice.extra;
                }
              }
            }
          }
        }
        orderFinalPrice = orderFinalPrice + dishFinalPrice;
        const orderItem = await this.orderItems.save(
          this.orderItems.create({
            dish,
            options: item.options,
          }),
        );
        orderItems.push(orderItem);
      }
      await this.orders.save(
        this.orders.create({
          customer,
          restaurant,
          total: orderFinalPrice,
          items: orderItems,
        }),
      );
      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'Could not create order' };
    }
  }

  async getOrders(
    user: User,
    { status }: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    try {
      let orders: Order[];
      if (user.role === UserRole.Customer) {
        orders = await this.orders.find({
          where: { customer: { id: user.id } },
          ...(status && { status }),
        });
      } else if (user.role === UserRole.Carrier) {
        orders = await this.orders.find({
          where: { driver: { id: user.id } },
          ...(status && { status }),
        });
      } else if (user.role === UserRole.Owner) {
        const restaurants = await this.restaurants.find({
          where: { owner: { id: user.id } },
          relations: ['orders'],
        });
        orders = restaurants.map((restaurant) => restaurant.orders).flat(1);
        if (status) {
          orders = orders.filter((order) => order.status === status);
        }
      }
      return {
        ok: true,
        orders,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not get orders',
      };
    }
  }

  async getOrder(
    user: User,
    { id: orderId }: GetOrderInput,
  ): Promise<GetOrderOutput> {
    try {
      const order = await this.orders.findOne({
        where: { id: orderId },
        relations: ['restaurant'],
      });
      if (!order) {
        return {
          ok: false,
          error: 'Order not found',
        };
      }
      let canSee = true;
      if (user.role === UserRole.Customer && order.customerId !== user.id) {
        canSee = false;
      }
      if (user.role === UserRole.Carrier && order.driverId !== user.id) {
        canSee = false;
      }
      if (
        user.role === UserRole.Owner &&
        order.restaurant.ownerId !== user.id
      ) {
        canSee = false;
      }
      if (!canSee) {
        return {
          ok: false,
          error: "You can't see the order that you are not involved in",
        };
      }
      if (
        order.customerId !== user.id &&
        order.driverId !== user.id &&
        order.restaurant.ownerId !== user.id
      ) {
        return {
          ok: false,
          error: "Can't see order that log ged in user not involved in",
        };
      }
      return { ok: true, order };
    } catch (error) {
      return { ok: false, error: 'Could not get order' };
    }
  }
}
