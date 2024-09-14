import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsNullableDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNullableDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return value === null || value instanceof Date;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be either null or a Date instance`;
        },
      },
    });
  };
}

export function IsNullableString(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNullableString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return (
            value === null || (typeof value === 'string' && value.trim() !== '')
          );
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be either null or a non-empty string`;
        },
      },
    });
  };
}
