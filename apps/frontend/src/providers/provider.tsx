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

"use client";

import { TooltipProvider } from '@/components/ui/tooltip';
import { ClerkProvider } from "@clerk/nextjs";
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createQueryClient, Providers } from '.';
export const Provider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <Providers
      providers={[
        [QueryClientProvider, { client: createQueryClient() }],
        [TooltipProvider, {}],
        [ClerkProvider, {
          publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || (() => { throw Error("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY not set") })(),
          signInUrl: '/login',
          signUpUrl: '/signup'
        }]
      ]}
    >
      {children}
      <ReactQueryDevtools buttonPosition={`bottom-right`} />
    </Providers>
  );
};

Provider.displayName = 'Provider';
export default Provider;
