import { InputType, OmitType } from '@nestjs/graphql';
import { Restaurant } from '../entities/restaurant.enetity';

@InputType()
export class CreateRestaurantDto extends OmitType(
  Restaurant,
  ['id'],
  InputType,
) {}
