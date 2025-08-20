import * as React from "react";

export const UploadCloudIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none" {...props}>
    <path d="M16 17.333V28" stroke="#5865F2" strokeWidth="2.6667" strokeLinecap="round" strokeLinejoin="round" />
    <path
      d="M5.333 19.865c-2.74-2.78-2.45-7.26.65-9.87A9.33 9.33 0 0 1 20.947 10.667h2.387c2.65 0 4.96 1.82 5.742 4.258.784 2.438-.048 5.12-2.41 6.731"
      stroke="#5865F2"
      strokeWidth="2.6667"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M10.667 22.667 16 17.333l5.333 5.334" stroke="#5865F2" strokeWidth="2.6667" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" fill="none" {...props}>
    <rect width="60" height="60" rx="30" fill="#FFD671" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M39 24c0 5.0-4.03 9-9 9s-9-4-9-9 4.03-9 9-9 9 4 9 9Zm-3 0c0 3.314-2.686 6-6 6s-6-2.686-6-6 2.686-6 6-6 6 2.686 6 6Z"
      fill="#5865F2"
    />
    <path
      d="M30 37.5c-9.711 0-17.986 5.743-21.138 13.788a33.6 33.6 0 0 0 2.423 2.66C13.632 46.062 20.995 40.5 30 40.5s16.368 5.561 18.715 12.948a33.6 33.6 0 0 0 2.423-2.66C47.986 43.243 39.712 37.5 30 37.5Z"
      fill="#5865F2"
    />
  </svg>
);

export const FolderIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
    <path
      d="M13.333 13.333c.354 0 .693-.14.943-.39.25-.25.391-.59.391-.943V5.333a1.333 1.333 0 0 0-1.333-1.333H8.067a1.333 1.333 0 0 1-1.14-.757l-.54-.8A1.333 1.333 0 0 0 5.287 2H2.667A1.333 1.333 0 0 0 1.333 3.333V12c0 .354.14.693.39.943.25.25.59.39.943.39h10.667Z"
      stroke="white"
      strokeWidth="1.333"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
