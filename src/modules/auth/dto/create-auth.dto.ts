import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateAuthDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'example@example.com | 078888888' })
  username: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'password' })
  password: string;
}

class ForgetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'email or Phone Number' })
  username: string;
}

class OTPDto {
  @IsNumber({
    allowNaN: false,
    allowInfinity: false,
    maxDecimalPlaces: 0,
  })
  @IsNotEmpty()
  @ApiProperty({ example: 1234 })
  otp: number;
}

class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'password' })
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'password' })
  confirmPassword: string;
}
export { ForgetPasswordDto, OTPDto, ResetPasswordDto };
