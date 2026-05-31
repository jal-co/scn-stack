import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" {...props}>
      <path fillRule="evenodd" clipRule="evenodd" d="M13.12 5.37C13.6 4.88 14.4 4.88 14.88 5.37L20.63 11.12C20.87 11.35 21 11.67 21 12C21 12.33 20.87 12.65 20.63 12.88L14.88 18.63C14.4 19.12 13.6 19.12 13.12 18.63C12.63 18.15 12.63 17.35 13.12 16.87L16.73 13.25H4.25C3.56 13.25 3 12.69 3 12C3 11.31 3.56 10.75 4.25 10.75H16.73L13.12 7.13C12.63 6.65 12.63 5.85 13.12 5.37Z" fill="currentColor" />
    </svg>
  );
}
