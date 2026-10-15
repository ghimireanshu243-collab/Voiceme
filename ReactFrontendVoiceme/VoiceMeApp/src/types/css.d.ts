// Lets TypeScript accept stylesheet imports (e.g. global.css and the web-only
// *.module.css files); Metro handles the actual CSS at bundle time.
declare module '*.module.css' {
  const classes: { readonly [className: string]: string };
  export default classes;
}

declare module '*.css';
