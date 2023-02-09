import { Injectable, NestMiddleware } from '@nestjs/common';
import { UserService } from 'src/users/users.service';
import { JwtService } from './jwt.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}
  async use(req: any, res: any, next: (error?: any) => void) {
    if (req.headers['x-jwt']) {
      const token = req.headers['x-jwt'];
      try {
        const decoded = this.jwtService.verify(token.toString());
        if (typeof decoded === 'object' && decoded.hasOwnProperty('userID')) {
          const { user } = await this.userService.findById(decoded['userID']);
          req['user'] = user;
        }
      } catch (error) {
        // console.log(error);
      }
    }
    next();
  }
}
