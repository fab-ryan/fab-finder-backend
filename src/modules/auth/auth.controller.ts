import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  CreateAuthDto,
  ForgetPasswordDto,
  OTPDto,
  RefreshTokenDto,
  ResetPasswordDto,
} from './dto/create-auth.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser, Public } from '@/decorators';
import express from 'express';
import * as types from '@/types';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/login')
  login(@Body() createAuthDto: CreateAuthDto, @Req() req: express.Request) {
    return this.authService.create(createAuthDto, req);
  }
  @Public()
  @Post('/refresh-token')
  refreshToken(@Body() token: RefreshTokenDto) {
    return this.authService.renewToken(token.token);
  }

  @Public()
  @Get('/google')
  @UseGuards(AuthGuard('google'))
  google() {
    return this.authService.loginWithGoogle();
  }
  @Public()
  @Get('/google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(@Req() req: express.Request) {
    return this.authService.googleLogin(req);
  }
  @Public()
  @Post('/forget-password')
  forgetPassword(@Body() forgetPasswordDto: ForgetPasswordDto) {
    return this.authService.forgotPassword(forgetPasswordDto);
  }
  @Public()
  @Post('/verify-otp/:token')
  verifyOtp(@Param('token') token: string, @Body() forgetPasswordDto: OTPDto) {
    return this.authService.verifyOtp(forgetPasswordDto, token);
  }

  @Public()
  @Post('/reset-password/:token')
  resetPassword(
    @Param('token') token: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(resetPasswordDto, token);
  }

  @Get('/sessions')
  @ApiBearerAuth()
  userSessions(@CurrentUser() currentUser: types.AuthenticatedUser) {
    return this.authService.userSessions(currentUser.id);
  }
}
