import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user-dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ){}
  
  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      })
      await this.userRepository.save(user)
      delete user.password;
      return user;
    } catch (error) {
      console.log(error)
      this.handleDBErrors(error)
    }
  }

  private handleDBErrors (error: any): never {
    if(error.code === '23505') {
      throw new BadRequestException(error.detail)
    }
    console.log(error)
    throw new InternalServerErrorException('check server logs')
  }
}
