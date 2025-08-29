/**
 * Copyright 2025 Product Decoder
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
