/* eslint-disable import/export */ // necessary for ts
declare module '*.css' {
  const content: {[className: string]: string};
  export default content;
}
declare module '*.png' {
  const content: string;
  export default content;
}
declare module '*.svg' {
  const content: React.StatelessComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}
