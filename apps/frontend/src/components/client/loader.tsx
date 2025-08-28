/**
 * Copyright  
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

import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import React from "react";

/**
 * A loading spinner component with animated background and fade-in effects.
 *
 * @component
 * @description
 * Displays a centered loading spinner with multiple animated elements:
 * - An animated gradient background
 * - A fading-in container with vertical transition
 * - A circular border with scaling animation
 * - A continuously rotating Loader2 icon
 *
 * Uses Framer Motion for animations and React.memo for performance optimization.
 *
 * @example
 * ```jsx
 * // Basic usage
 * <Loader />
 * ```
 *
 * @remarks
 * - Uses 'use client' directive for Next.js client-side rendering
 * - Implements full-screen responsive layout
 * - Includes fallback memoization to prevent unnecessary re-renders
 *
 * @returns {React.JSX.Element} A memoized loading spinner component with animations
 */
export const Loader = React.memo(
  () => {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="relative">
            <motion.div
              className="w-24 h-24 border-4 rounded-full border-primary-foreground/20"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              >
                <Loader2 className="w-12 h-12 text-primary-foreground" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  },
  () => true,
);

Loader.displayName = "Loader";
