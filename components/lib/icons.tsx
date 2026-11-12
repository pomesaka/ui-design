import type { SVGProps } from "react";

// Small stroke icons shared by the components. They inherit color and size
// from the text, and are decorative unless the caller supplies a label.
type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const CheckIcon = (props: IconProps) => <Icon {...props}><path d="m3.5 8.5 3 3 6-7" /></Icon>;
export const MinusIcon = (props: IconProps) => <Icon {...props}><path d="M4 8h8" /></Icon>;
export const ChevronDownIcon = (props: IconProps) => <Icon {...props}><path d="m4.5 6.5 3.5 3.5 3.5-3.5" /></Icon>;
export const ChevronLeftIcon = (props: IconProps) => <Icon {...props}><path d="m9.5 4.5-3.5 3.5 3.5 3.5" /></Icon>;
export const ChevronRightIcon = (props: IconProps) => <Icon {...props}><path d="m6.5 4.5 3.5 3.5-3.5 3.5" /></Icon>;
/** For links that leave the product. Pair with text such as "(新しいタブ)" when the link opens one. */
export const ExternalLinkIcon = (props: IconProps) => <Icon {...props}><path d="M9.5 2.5h4v4M13.5 2.5 7.5 8.5M11.5 9.5v3a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3" /></Icon>;
export const ChevronsUpDownIcon = (props: IconProps) => <Icon {...props}><path d="m5 6 3-3 3 3M5 10l3 3 3-3" /></Icon>;
export const XIcon = (props: IconProps) => <Icon {...props}><path d="m4.5 4.5 7 7m0-7-7 7" /></Icon>;
export const InfoIcon = (props: IconProps) => <Icon {...props}><circle cx="8" cy="8" r="6" /><path d="M8 7.25v3.5M8 5v.01" /></Icon>;
export const SuccessIcon = (props: IconProps) => <Icon {...props}><circle cx="8" cy="8" r="6" /><path d="m5.5 8.25 1.75 1.75 3.25-3.75" /></Icon>;
export const WarningIcon = (props: IconProps) => <Icon {...props}><path d="M8 2.25 14.25 13.5H1.75Z" /><path d="M8 6.5v3M8 11.5v.01" /></Icon>;
export const ErrorIcon = (props: IconProps) => <Icon {...props}><circle cx="8" cy="8" r="6" /><path d="m6 6 4 4m0-4-4 4" /></Icon>;
