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

import { FileImage, Sparkles, Upload } from "lucide-react";
import type React from "react";
import { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export interface EmptyStateProps {
	/** Callback when upload button is clicked */
	onUploadClick: () => void;
	/** Custom title text */
	title?: string;
	/** Custom description text */
	description?: string;
	/** Custom button text */
	buttonText?: string;
	/** Whether to show the sparkle animation */
	showSparkle?: boolean;
	/** Custom icon component */
	icon?: React.ReactNode;
	/** Additional CSS classes */
	className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
	onUploadClick,
	title = "Ready to Analyze",
	description = "Upload your first image to experience our AI-powered analysis pipeline. Get instant insights on objects, nutrition, news, and more.",
	buttonText = "Get Started",
	showSparkle = true,
	icon,
	className = "",
}) => {
	// Memoized click handler
	const handleClick = useCallback(() => {
		onUploadClick();
	}, [onUploadClick]);

	// Memoized icon container
	const iconContainer = useMemo(() => {
		const defaultIcon = <FileImage className="w-12 h-12 text-accent" />;
		const iconToShow = icon || defaultIcon;

		return (
			<div className="relative">
				<div className="p-6 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full animate-float">
					{iconToShow}
				</div>
				{showSparkle && (
					<div className="absolute -top-2 -right-2 p-2 bg-accent rounded-full animate-pulse">
						<Sparkles className="w-4 h-4 text-white" />
					</div>
				)}
			</div>
		);
	}, [icon, showSparkle]);

	// Memoized content section
	const contentSection = useMemo(
		() => (
			<div className="space-y-4 max-w-md">
				<h3 className="text-2xl font-bold text-foreground">{title}</h3>
				<p className="text-muted-foreground leading-relaxed">{description}</p>
			</div>
		),
		[title, description],
	);

	// Memoized upload button
	const uploadButton = useMemo(
		() => (
			<Button
				size="lg"
				onClick={handleClick}
				className="bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
				aria-label="Start uploading images"
			>
				<Upload className="w-5 h-5 mr-2" />
				{buttonText}
			</Button>
		),
		[handleClick, buttonText],
	);

	return (
		<Card
			className={`border-2 border-dashed border-border/50 bg-gradient-to-br from-card to-muted/20 shadow-lg ${className}`}
		>
			<CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-6">
				{iconContainer}
				{contentSection}
				{uploadButton}
			</CardContent>
		</Card>
	);
};

export default EmptyState;
