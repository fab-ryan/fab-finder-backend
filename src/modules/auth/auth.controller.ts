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
  ResetPasswordDto,
} from './dto/create-auth.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Public } from '@/decorators';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/login')
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }
  @Public()
  @Post('/refresh-token')
  refreshToken(@Body('token') token: string) {
    return this.authService.renewToken(token);
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
  googleCallback(@Req() req: Request) {
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
}
