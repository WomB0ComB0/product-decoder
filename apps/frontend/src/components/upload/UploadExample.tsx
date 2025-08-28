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

import type React from "react";
import { SecureImageUpload } from "./index";

/**
 * Example component demonstrating the enhanced upload components.
 *
 * This component shows how to:
 * 1. Use the enhanced AI analysis pipeline
 * 2. Configure upload settings and validation
 * 3. Handle different upload scenarios
 */
const UploadExample: React.FC = () => {
	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="text-center mb-12">
					<h1 className="text-4xl font-bold text-gray-900 mb-4">
						AI-Powered Image Analysis Demo
					</h1>
					<p className="text-lg text-gray-600 max-w-2xl mx-auto">
						Upload images and experience our enhanced AI analysis pipeline.
						Features include intelligent processing, real-time progress
						tracking, and comprehensive insights.
					</p>
				</div>

				{/* Upload Component */}
				<SecureImageUpload
					maxFiles={10}
					maxSize={10 * 1024 * 1024} // 10MB
					acceptedFormats={[
						"image/jpeg",
						"image/jpg",
						"image/png",
						"image/webp",
						"image/gif",
					]}
					title="Enhanced AI Image Analysis"
					description="Experience the power of intelligent image analysis with real-time processing, comprehensive insights, and beautiful results."
					useEnhancedAnalysis={true}
					onUpload={(files) => {
						console.log("Files uploaded:", files);
					}}
					onError={(errors) => {
						console.error("Upload errors:", errors);
					}}
					className="bg-white rounded-2xl shadow-xl p-8"
				/>

				{/* Features Section */}
				<div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
					<div className="bg-white rounded-xl p-6 shadow-lg">
						<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
							<svg
								className="w-6 h-6 text-blue-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M13 10V3L4 14h7v7l9-11h-7z"
								/>
							</svg>
						</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-2">
							Intelligent Processing
						</h3>
						<p className="text-gray-600">
							Advanced AI pipeline automatically detects objects, categories,
							and provides comprehensive analysis.
						</p>
					</div>

					<div className="bg-white rounded-xl p-6 shadow-lg">
						<div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
							<svg
								className="w-6 h-6 text-green-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
								/>
							</svg>
						</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-2">
							Real-time Progress
						</h3>
						<p className="text-gray-600">
							Real-time progress tracking and status updates keep users informed
							throughout the analysis process.
						</p>
					</div>

					<div className="bg-white rounded-xl p-6 shadow-lg">
						<div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
							<svg
								className="w-6 h-6 text-purple-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
								/>
							</svg>
						</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-2">
							Comprehensive Insights
						</h3>
						<p className="text-gray-600">
							Get detailed insights including news, web results, YouTube videos,
							and nutritional information.
						</p>
					</div>
				</div>

				{/* Technical Details */}
				<div className="mt-16 bg-white rounded-2xl shadow-xl p-8">
					<h2 className="text-2xl font-bold text-gray-900 mb-6">
						Technical Implementation
					</h2>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						<div>
							<h3 className="text-lg font-semibold text-gray-900 mb-4">
								Enhanced Architecture
							</h3>
							<ul className="space-y-2 text-gray-600">
								<li>• React hooks for state management</li>
								<li>• Custom hooks for reusable logic</li>
								<li>• Error boundaries and graceful degradation</li>
								<li>• Optimized rendering with memoization</li>
								<li>• TypeScript for type safety</li>
							</ul>
						</div>
						<div>
							<h3 className="text-lg font-semibold text-gray-900 mb-4">
								AI Analysis Pipeline
							</h3>
							<ul className="space-y-2 text-gray-600">
								<li>• Reverse image search for object detection</li>
								<li>• Category-based analysis (Food, Tech, Clothes, Drugs)</li>
								<li>• News aggregation and web search results</li>
								<li>• YouTube video recommendations</li>
								<li>• Nutritional analysis for food items</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default UploadExample;
