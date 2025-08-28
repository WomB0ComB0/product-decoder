import { Loader2, Upload } from "lucide-react";
import type React from "react";
import { useCallback, useMemo, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export interface ImageUploadAreaProps {
	/** Whether files are currently being uploaded */
	isUploading: boolean;
	/** Whether drag is currently active */
	dragActive: boolean;
	/** Maximum number of files allowed */
	maxFiles: number;
	/** Maximum file size in bytes */
	maxSize: number;
	/** Accepted file formats */
	acceptedFormats: string[];
	/** Callback when files are dropped */
	onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
	/** Callback when drag enters the area */
	onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
	/** Callback when drag leaves the area */
	onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
	/** Callback when files are selected via file input */
	onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
	/** Function to format file size for display */
	formatFileSize: (bytes: number) => string;
	/** Custom upload button text */
	uploadButtonText?: string;
	/** Custom drag text */
	dragText?: string;
	/** Custom processing text */
	processingText?: string;
	/** Whether to show format badges */
	showFormatBadges?: boolean;
}

const ImageUploadArea: React.FC<ImageUploadAreaProps> = ({
	isUploading,
	dragActive,
	maxFiles,
	maxSize,
	acceptedFormats,
	onDrop,
	onDragOver,
	onDragLeave,
	onFileSelect,
	formatFileSize,
	uploadButtonText = "Get Started",
	dragText = "Drop images here or click to browse",
	processingText = "Processing your images...",
	showFormatBadges = true,
}) => {
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Memoized click handler to prevent unnecessary re-renders
	const handleClick = useCallback(() => {
		fileInputRef.current?.click();
	}, []);

	// Memoized drag area classes for better performance
	const dragAreaClasses = useMemo(() => {
		const baseClasses =
			"relative p-16 text-center transition-all duration-500 cursor-pointer group";
		const dragClasses = dragActive
			? "border-accent bg-accent/5 scale-[1.02] shadow-2xl animate-pulse-glow"
			: "hover:border-accent/60 hover:bg-accent/5 hover:scale-[1.01]";
		const uploadClasses = isUploading ? "opacity-60 pointer-events-none" : "";

		return `${baseClasses} ${dragClasses} ${uploadClasses}`.trim();
	}, [dragActive, isUploading]);

	// Memoized icon container classes
	const iconContainerClasses = useMemo(() => {
		const baseClasses =
			"p-6 rounded-full transition-all duration-300 group-hover:scale-110";
		const dragClasses = dragActive
			? "bg-accent/20 animate-float"
			: "bg-gradient-to-br from-accent/10 to-primary/10 group-hover:from-accent/20 group-hover:to-primary/20";

		return `${baseClasses} ${dragClasses}`.trim();
	}, [dragActive]);

	// Memoized upload icon classes
	const uploadIconClasses = useMemo(() => {
		const baseClasses = "w-12 h-12 transition-colors duration-300";
		const colorClasses = dragActive
			? "text-accent"
			: "text-muted-foreground group-hover:text-accent";

		return `${baseClasses} ${colorClasses}`.trim();
	}, [dragActive]);

	// Memoized format badges for better performance
	const formatBadges = useMemo(() => {
		if (!showFormatBadges) return null;

		return (
			<div className="flex flex-wrap justify-center gap-2 pt-2">
				{acceptedFormats.map((format) => (
					<Badge
						key={format}
						variant="outline"
						className="text-xs font-medium px-3 py-1 bg-card/50 border-accent/30 text-accent hover:bg-accent/10 transition-colors"
					>
						{format.split("/")[1]?.toUpperCase()}
					</Badge>
				))}
			</div>
		);
	}, [acceptedFormats, showFormatBadges]);

	// Memoized main content text
	const mainText = useMemo(() => {
		return isUploading ? processingText : dragText;
	}, [isUploading, processingText, dragText]);

	// Memoized file size text
	const fileSizeText = useMemo(() => {
		return `Upload up to ${maxFiles} files, max ${formatFileSize(maxSize)} each`;
	}, [maxFiles, maxSize, formatFileSize]);

	// Memoized upload button
	const uploadButton = useMemo(() => {
		if (isUploading) return null;

		return (
			<Button
				size="lg"
				className="mt-6 bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
				onClick={handleClick}
				aria-label="Select files to upload"
			>
				<Upload className="w-5 h-5 mr-2" />
				{uploadButtonText}
			</Button>
		);
	}, [isUploading, handleClick, uploadButtonText]);

	return (
		<Card className="relative overflow-hidden bg-gradient-to-br from-card to-muted/30 border-2 border-dashed border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
			<div
				className={dragAreaClasses}
				onDrop={onDrop}
				onDragOver={onDragOver}
				onDragLeave={onDragLeave}
				onClick={handleClick}
				role="button"
				tabIndex={0}
				aria-label="File upload area"
				aria-describedby="upload-description"
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						handleClick();
					}
				}}
			>
				<input
					ref={fileInputRef}
					type="file"
					multiple
					accept={acceptedFormats.join(",")}
					onChange={onFileSelect}
					className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
					disabled={isUploading}
					aria-hidden="true"
				/>

				{/* Background Pattern */}
				<div className="absolute inset-0 opacity-5">
					<div className="w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.3),transparent_50%)]" />
				</div>

				<div className="relative flex flex-col items-center space-y-6">
					<div className={iconContainerClasses}>
						{isUploading ? (
							<Loader2
								className="w-12 h-12 text-accent animate-spin"
								aria-label="Uploading files"
							/>
						) : (
							<Upload className={uploadIconClasses} aria-label="Upload icon" />
						)}
					</div>

					<div className="space-y-4">
						<h3 className="text-2xl font-bold text-foreground">{mainText}</h3>
						<p
							className="text-muted-foreground text-lg"
							id="upload-description"
						>
							{fileSizeText}
						</p>

						{formatBadges}

						{uploadButton}
					</div>
				</div>
			</div>
		</Card>
	);
};

export default ImageUploadArea;
