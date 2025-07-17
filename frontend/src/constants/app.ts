const url: string = 'https://product-decoder.vercel.app',
  name: string = 'Product Decoder',
  email: string = '',
  description: string = '';

export const app: Readonly<{
  name: string;
  email: string;
  description: string;
  keywords: string[];
  url: string;
  logo: string;
}> = {
  name: name,
  email: email,
  description: description,
  keywords: [''],
  url: url,
  logo: `${url}/`,
};
