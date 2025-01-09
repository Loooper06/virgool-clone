import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { isJWT } from "class-validator";
import { AuthService } from "src/modules/auth/auth.service";

@Injectable()
export class AddUserToRequestWOV implements NestMiddleware {
  constructor(private authService: AuthService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const token = this.extractAccessToken(req);
    if (!token) return next();
    try {
      let user = await this.authService.validateAccessToken(token);
      if (user) req.user = user;
    } catch (error) {
      console.log(error);
    }
    next();
  }

  protected extractAccessToken(req: Request) {
    const { authorization } = req.headers;
    if (!authorization || authorization.trim() == "") return null;

    const [bearer, token] = authorization.split(" ");
    if (
      !bearer ||
      bearer?.trim()?.toLowerCase() != "bearer" ||
      !token ||
      !isJWT(token)
    )
      return null;

    return token;
  }
}
