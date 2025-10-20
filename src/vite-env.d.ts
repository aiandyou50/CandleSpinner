declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

// TMA 타입 선언
declare global {
  interface Window {
    Telegram?: {
      WebApp?: any;
    };
  }
}

export {};
