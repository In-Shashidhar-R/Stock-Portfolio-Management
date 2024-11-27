// src/typings.d.ts

declare module 'd3' {
  export * from 'd3-shape';
  export * from 'd3-scale';
  export * from 'd3-selection';
  export type CurveFactory = any; // Replace 'any' with the appropriate type if known
  export type ScaleBand<T> = any;  // Same here
  export type ScaleLinear<X, Y> = any; // Same here
  export type BaseType = any; // Same here
  export type ScaleTime<X, Y> = any; // Same here
  export type ScalePoint<T> = any; // Same here
}
