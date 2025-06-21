import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  HttpException,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { CreateCheckinDto } from "./dto/checkin.dto";

@ApiTags("users")
@Controller("api/users")
@UseGuards(ThrottlerGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: "Create a new user" })
  @ApiResponse({ status: 201, description: "User created successfully" })
  async createUser(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.usersService.create(createUserDto);
    } catch (error) {
      throw new HttpException(
        "Failed to create user",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(":id")
  @ApiOperation({ summary: "Get user by ID" })
  async getUser(@Param("id") id: string) {
    try {
      const user = await this.usersService.findById(id);
      if (!user) {
        throw new HttpException("User not found", HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        "Failed to fetch user",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(":id")
  @ApiOperation({ summary: "Update user" })
  async updateUser(
    @Param("id") id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      return await this.usersService.update(id, updateUserDto);
    } catch (error) {
      throw new HttpException(
        "Failed to update user",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(":id/dashboard")
  @ApiOperation({ summary: "Get user dashboard data" })
  async getDashboard(@Param("id") id: string) {
    try {
      return await this.usersService.getDashboardData(id);
    } catch (error) {
      throw new HttpException(
        "Failed to fetch dashboard data",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(":id/checkin")
  @ApiOperation({ summary: "Store daily checkin data" })
  @ApiResponse({ status: 201, description: "Checkin data stored successfully" })
  async storeCheckin(
    @Param("id") userId: string,
    @Body() checkinDto: CreateCheckinDto,
  ) {
    try {
      return await this.usersService.storeCheckin(userId, checkinDto);
    } catch (error) {
      throw new HttpException(
        "Failed to store checkin data",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
