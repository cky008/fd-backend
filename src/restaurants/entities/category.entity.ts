import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Entity, Column, OneToMany } from 'typeorm';
import { Restaurant } from './restaurant.entity';

@InputType('CategoryInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Category extends CoreEntity {
  @Column()
  @Field(() => String)
  @IsString()
  @Length(5)
  name: string;

  @Column()
  @Field(() => String)
  @IsString()
  coverImg: string;

  @OneToMany(() => Restaurant, (restaurant) => restaurant.category)
  @Field(() => [Restaurant])
  restaurant: Restaurant[];
}
