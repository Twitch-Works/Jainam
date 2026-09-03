// Metro resolves static image imports to an asset id (number). Expo's bundled
// types don't declare these, so we do.
declare module "*.png" {
  const src: number;
  export default src;
}

declare module "*.jpg" {
  const src: number;
  export default src;
}
