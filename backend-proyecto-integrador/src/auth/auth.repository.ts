import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";


//TODO: revisar el tema del tipado de las clases del repository
//TODO: auth no deberia tener repository, deberia ser user.

@Injectable()
export class AuthRepository{
  constructor(private readonly prisma: PrismaService,) {}

}