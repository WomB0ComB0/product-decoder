/**
 * Copyright 2025 Mike Odnis
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

/**
 * Parses the code path and returns a formatted string with the location and function name.
 *
 * @param {any} context - The context to include in the formatted string.
 * @param {Function} fnName - The function to include in the formatted string.
 * @returns {string} - The formatted string with the location and function name.
 */
export const parseCodePath = (context: any, fnName: Function): string =>
	`location: ${process.cwd()}${__filename} @${fnName.name}: ${context}`;
