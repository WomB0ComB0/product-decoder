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

import { FileImage, X } from "lucide-react";
import type React from "react";
import { useCallback, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface FileListHeaderProps {
	/** Number of files currently uploaded */
	fileCount: number;
	/** Maximum number of files allowed */
	maxFiles: number;
	/** Callback when clear all button is clicked */
	onClearAll: () => void;
	/** Custom title text */
	title?: string;
	/** Custom subtitle text */
	subtitle?: string;
	/** Custom clear button text */
	clearButtonText?: string;
	/** Whether to show the file count badge */
	showFileCount?: boolean;
	/** Whether to show the clear all button */
	showClearButton?: boolean;
	/** Additional CSS classes */
	className?: string;
}

const FileListHeader: React.FC<FileListHeaderProps> = ({
	fileCount,
	maxFiles,
	onClearAll,
	title = "Uploaded Images",
	subtitle,
	clearButtonText = "Clear All",
	showFileCount = true,
	showClearButton = true,
	className = "",
}) => {
	// Memoized click handler
	const handleClearAll = useCallback(() => {
		onClearAll();
	}, [onClearAll]);

	// Memoized subtitle text
	const subtitleText = useMemo(() => {
		if (subtitle) return subtitle;
		return `${fileCount} of ${maxFiles} images ready for analysis`;
	}, [subtitle, fileCount, maxFiles]);

	// Memoized file count badge
	const fileCountBadge = useMemo(() => {
		if (!showFileCount) return null;

		return (
			<Badge
				variant="secondary"
				className="ml-4 px-4 py-2 text-base font-semibold"
				aria-label={`${fileCount} out of ${maxFiles} files uploaded`}
			>
				{fileCount}/{maxFiles}
			</Badge>
		);
	}, [fileCount, maxFiles, showFileCount]);

	// Memoized clear button
	const clearButton = useMemo(() => {
		if (!showClearButton) return null;

		return (
			<Button
				variant="outline"
				size="lg"
				onClick={handleClearAll}
				className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30 font-medium bg-transparent"
				aria-label={`Clear all ${fileCount} uploaded files`}
			>
				<X className="w-4 h-4 mr-2" />
				{clearButtonText}
			</Button>
		);
	}, [showClearButton, handleClearAll, fileCount, clearButtonText]);

	// Memoized header content
	const headerContent = useMemo(
		() => (
			<div className="flex items-center gap-4">
				<div className="p-3 bg-accent/10 rounded-full">
					<FileImage className="w-6 h-6 text-accent" aria-label="File icon" />
				</div>
				<div>
					<h3 className="text-xl font-bold text-foreground">{title}</h3>
					<p className="text-muted-foreground">{subtitleText}</p>
				</div>
				{fileCountBadge}
			</div>
		),
		[title, subtitleText, fileCountBadge],
	);

	return (
		<div
			className={`flex items-center justify-between p-6 bg-gradient-to-r from-card to-muted/30 rounded-xl border shadow-sm ${className}`}
		>
			{headerContent}
			{clearButton}
		</div>
	);
};

export default FileListHeader;
