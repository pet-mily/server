import { Transform } from 'class-transformer';

export function TransformNullableString() {
  return Transform(({ value }) => {
    if (value === 'null' || value === null) return null;
    return value;
  });
}

export function TransformNullableDate() {
  return Transform(({ value }) => {
    if (value === 'null' || value === null) return null;
    return new Date(value);
  });
}
