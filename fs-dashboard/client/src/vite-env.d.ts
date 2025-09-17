/// <reference types="vite/client" />

declare const __API_URL__: string;

declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.svg?url" {
  const content: string;
  export default content;
}
