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


/**
 * Example component demonstrating the enhanced upload components.
 *
 * This component shows how to:
 * 1. Use the enhanced AI analysis pipeline
 * 2. Configure upload settings and validation
 * 3. Handle different upload scenarios
 */

import type React from "react";
import { SecureImageUpload } from "./index";
const UploadExample: React.FC = () => {
	return (
		<div className="min-h-screen bg-[var(--background)] p-0 pt-8 container">
			<div className="w-full h-full max-w-3xl mx-auto p-4 border rounded-lg bg-[var(--card)] shadow-sm">
					<SecureImageUpload
						maxFiles={10}
						maxSize={10 * 1024 * 1024}
						acceptedFormats={["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]}
						useEnhancedAnalysis={true}
						showHeader={false}
						onUpload={(files) => console.log("Files uploaded:", files)}
						onError={(errors) => console.error("Upload errors:", errors)}
					/>
				</div>
			</div>
	);
};

export default UploadExample;
