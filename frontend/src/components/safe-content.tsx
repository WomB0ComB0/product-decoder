// components/SafeContent.tsx
import DOMPurify from 'dompurify';

export const SafeContent: React.FC<{ html: string }> = ({ html }) => (
  // eslint-disable-next-line @eslint-react/dom/no-dangerously-set-innerhtml
  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
);

SafeContent.displayName = "SafeContent";
export default SafeContent;