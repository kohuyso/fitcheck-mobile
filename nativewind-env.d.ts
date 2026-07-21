/// <reference types="nativewind/types" />

declare module "*.css" {
  const content: { [className: string]: string } | string | any;
  export default content;
}
