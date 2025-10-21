// Global type declarations for the project

import * as React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
    interface Element extends React.ReactElement<any, any> {}
    interface ElementClass extends React.Component<any, any> {}
    interface ElementAttributesProperty { props: {}; }
    interface ElementChildrenAttribute { children: {}; }
  }
}

declare module 'react' {
  interface FormEvent<T = Element> {
    preventDefault(): void;
    stopPropagation(): void;
    target: EventTarget & T;
  }
}

declare module 'framer-motion' {
  export const motion: any;
  export const AnimatePresence: any;
  export interface MotionProps {
    initial?: any;
    animate?: any;
    exit?: any;
    transition?: any;
    variants?: any;
    whileHover?: any;
    whileTap?: any;
    className?: string;
    children?: React.ReactNode;
    onClick?: (event: any) => void;
    onSubmit?: (event: any) => void;
    style?: React.CSSProperties;
  }
}

// UI component types will be inferred from actual implementations

declare module 'lucide-react' {
  interface IconProps {
    className?: string;
    size?: number | string;
  }
  export const Mail: React.FC<IconProps>;
  export const Calendar: React.FC<IconProps>;
  export const Bell: React.FC<IconProps>;
  export const LogOut: React.FC<IconProps>;
  export const Search: React.FC<IconProps>;
  export const Sparkles: React.FC<IconProps>;
  export const CheckCircle2: React.FC<IconProps>;
  export const AlertCircle: React.FC<IconProps>;
  export const Clock: React.FC<IconProps>;
  export const Zap: React.FC<IconProps>;
  export const Sun: React.FC<IconProps>;
  export const Moon: React.FC<IconProps>;
  export const ArrowRight: React.FC<IconProps>;
  export const Filter: React.FC<IconProps>;
  export const BarChart3: React.FC<IconProps>;
  export const X: React.FC<IconProps>;
  export const ExternalLink: React.FC<IconProps>;
  export const UserIcon: React.FC<IconProps>;
  export const Tag: React.FC<IconProps>;
}

export {};
