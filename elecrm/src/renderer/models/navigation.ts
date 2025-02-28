export type NavigationItem = {
  name: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
} & (
  | { path: string; isSoftphone?: never }
  | { path?: never; isSoftphone: true }
);
