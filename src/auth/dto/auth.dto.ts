import { IntersectionType } from '@nestjs/mapped-types';
import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

const passwordValidation = {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minSymbols: 1,
    minNumbers: 1,
}

const passValidationMessage = "password must be more than 8 characters and must contain an uppercase letter, a lowercase letter, a number and a special character"

export class EmailDto {
    @IsNotEmpty()
    @IsEmail({}, { message: "email is not valid" })
    email: string;
}

export class PasswordDto {
    @IsNotEmpty()
    @IsString()
    @IsStrongPassword(passwordValidation, {
        message: passValidationMessage
    })
    password: string;
}

export class UpdatePassDto extends PasswordDto {
    @IsNotEmpty()
    @IsString()
    @IsStrongPassword(passwordValidation, {
        message: passValidationMessage
    })
    newPassword: string;
}

export class AuthDto extends IntersectionType(EmailDto, PasswordDto) { }