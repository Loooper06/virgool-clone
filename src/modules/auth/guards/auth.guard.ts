import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { isJWT } from "class-validator";
import { Request } from "express";
import { AuthMessage } from "src/common/enums/message.enum";
import { AuthService } from "../auth.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const httpContext = context.switchToHttp();
    const request: Request = httpContext.getRequest();
    const token = this.extractAccessToken(request);
    request.user = await this.authService.validateAccessToken(token);
    return true;
  }

  protected extractAccessToken(req: Request) {
    const { authorization } = req.headers;
    if (!authorization || authorization.trim() == "")
      throw new UnauthorizedException(AuthMessage.RequiredLogin);

    const [bearer, token] = authorization.split(" ");
    if (
      !bearer ||
      bearer?.trim()?.toLowerCase() != "bearer" ||
      !token ||
      !isJWT(token)
    )
      throw new UnauthorizedException(AuthMessage.RequiredLogin);

    return token;
  }
}
