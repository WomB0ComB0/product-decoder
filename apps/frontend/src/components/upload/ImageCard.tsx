import {
	AlertCircle,
	CheckCircle,
	FileImage,
	LinkIcon,
	Loader2,
	Newspaper,
	Sparkles,
	Tag,
	Utensils,
	X,
	Youtube,
} from "lucide-react";
import type React from "react";
import { useCallback, useMemo } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Category, PipelineResult } from "./AIAnalysisPipeline";

export interface ImageFile {
	file: File;
	preview: string;
	id: string;
	size: number;
	type: string;
	lastModified: number;
}

export interface ImageCardProps {
	/** The image file data */
	imageFile: ImageFile;
	/** AI analysis result */
	result?: PipelineResult;
	/** Whether the image is currently being processed */
	isProcessing: boolean;
	/** Processing progress percentage */
	progress?: number;
	/** Callback when image is removed */
	onRemove: (id: string) => void;
	/** Function to format file size for display */
	formatFileSize: (bytes: number) => string;
	/** Whether to show detailed analysis sections */
	showAnalysis?: boolean;
	/** Custom loading text */
	loadingText?: string;
	/** Custom ready text */
	readyText?: string;
}

// Compound component for analysis sections
const AnalysisSection: React.FC<{
	title: string;
	icon: React.ReactNode;
	iconBgColor: string;
	children: React.ReactNode;
}> = ({ title, icon, iconBgColor, children }) => (
	<div className="space-y-3">
		<div className="flex items-center gap-3 text-sm font-bold text-foreground">
			<div className={`p-2 ${iconBgColor} rounded-lg`}>{icon}</div>
			{title}
		</div>
		{children}
	</div>
);

// Memoized category color utility
const useCategoryColor = () => {
	return useCallback((category: Category) => {
		const colors: Record<Category, string> = {
			Food: "bg-green-100 text-green-800 border-green-200",
			Clothes: "bg-purple-100 text-purple-800 border-purple-200",
			Drugs: "bg-red-100 text-red-800 border-red-200",
			Technology: "bg-blue-100 text-blue-800 border-blue-200",
			Unknown: "bg-gray-100 text-gray-800 border-gray-200",
		};
		return colors[category] || colors.Unknown;
	}, []);
};

// Memoized image error handler
const useImageErrorHandler = () => {
	return useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
		const target = e.target as HTMLImageElement;
		target.style.display = "none";
		const parent = target.parentElement;
		if (parent) {
			const icon = document.createElement("div");
			icon.innerHTML =
				'<div class="flex items-center justify-center"><svg class="w-16 h-16 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg></div>';
			parent.appendChild(icon);
		}
	}, []);
};

const ImageCard: React.FC<ImageCardProps> = ({
	imageFile,
	result,
	isProcessing,
	progress,
	onRemove,
	formatFileSize,
	showAnalysis = true,
	loadingText = "Analyzing with AI...",
	readyText = "Ready for AI Analysis",
}) => {
	const getCategoryColor = useCategoryColor();
	const handleImageError = useImageErrorHandler();

	// Memoized remove handler
	const handleRemove = useCallback(() => {
		onRemove(imageFile.id);
	}, [onRemove, imageFile.id]);

	// Memoized processing overlay
	const processingOverlay = useMemo(() => {
		if (!isProcessing) return null;

		return (
			<div className="absolute inset-0 bg-background/90 backdrop-blur-md flex items-center justify-center">
				<div className="text-center space-y-4 p-6">
					<div className="relative">
						<Loader2
							className="w-12 h-12 animate-spin mx-auto text-accent"
							aria-label="Processing"
						/>
						<div className="absolute inset-0 w-12 h-12 mx-auto border-4 border-accent/20 rounded-full animate-pulse-glow" />
					</div>
					<div className="w-40 h-2 bg-accent/10 rounded-full"></div>
					<p className="text-sm font-medium text-foreground">{loadingText}</p>
					<div className="animate-shimmer h-1 w-32 mx-auto rounded" />
				</div>
			</div>
		);
	}, [isProcessing, loadingText]);

	// Memoized error alert
	const errorAlert = useMemo(() => {
		if (!result?.error) return null;

		return (
			<Alert
				variant="destructive"
				className="py-3 border-l-4 border-l-destructive"
			>
				<AlertCircle className="h-4 w-4" />
				<AlertDescription className="text-sm font-medium">
					Analysis failed: {result.error}
				</AlertDescription>
			</Alert>
		);
	}, [result?.error]);

	// Memoized analysis content
	const analysisContent = useMemo(() => {
		if (!result || result.error || !showAnalysis) return null;

		return (
			<>
				{/* Category and Labels */}
				<div className="space-y-4">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-accent/10 rounded-lg">
							<Sparkles className="w-4 h-4 text-accent" />
						</div>
						<Badge
							className={`${getCategoryColor(result.insights.category)} px-3 py-1 font-semibold`}
						>
							{result.insights.category}
						</Badge>
					</div>

					{result.insights.meta.labels.length > 0 && (
						<div className="space-y-2">
							<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
								<Tag className="w-4 h-4" />
								<span>Detected Objects</span>
							</div>
							<div className="flex flex-wrap gap-2">
								{result.insights.meta.labels.slice(0, 4).map((label, i) => (
									<Badge
										key={i}
										variant="outline"
										className="text-xs font-medium px-2 py-1 bg-muted/50 hover:bg-accent/10 transition-colors"
									>
										{label}
									</Badge>
								))}
							</div>
						</div>
					)}
				</div>

				<Separator className="bg-border/50" />

				{/* News Section */}
				{result.insights.news && result.insights.news.length > 0 && (
					<AnalysisSection
						title="Latest News"
						icon={<Newspaper className="w-4 h-4 text-blue-600" />}
						iconBgColor="bg-blue-50 dark:bg-blue-900/20"
					>
						<ScrollArea className="h-24">
							<div className="space-y-3">
								{result.insights.news.slice(0, 2).map((n, i) => (
									<a
										key={i}
										href={n.url}
										target="_blank"
										rel="noreferrer"
										className="block text-sm text-accent hover:text-accent/80 hover:underline leading-relaxed font-medium transition-colors p-2 hover:bg-accent/5 rounded-md"
									>
										{n.title}
									</a>
								))}
							</div>
						</ScrollArea>
					</AnalysisSection>
				)}

				{/* Food Nutrients */}
				{result.insights.food?.nutrients &&
					result.insights.food.nutrients.length > 0 && (
						<AnalysisSection
							title="Nutrition Facts"
							icon={<Utensils className="w-4 h-4 text-green-600" />}
							iconBgColor="bg-green-50 dark:bg-green-900/20"
						>
							<div className="grid grid-cols-2 gap-3">
								{result.insights.food.nutrients.slice(0, 4).map((n) => (
									<div
										key={n.id}
										className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg p-3 border border-border/30 hover:border-accent/30 transition-colors"
									>
										<div className="text-sm font-bold text-foreground">
											{n.name}
										</div>
										<div className="text-xs text-muted-foreground font-medium">
											{n.value} {n.unit}
										</div>
									</div>
								))}
							</div>
						</AnalysisSection>
					)}

				{/* Web Results */}
				{result.insights.cse && result.insights.cse.length > 0 && (
					<AnalysisSection
						title="Web Results"
						icon={<LinkIcon className="w-4 h-4 text-purple-600" />}
						iconBgColor="bg-purple-50 dark:bg-purple-900/20"
					>
						<ScrollArea className="h-24">
							<div className="space-y-3">
								{result.insights.cse.slice(0, 3).map((c, i) => (
									<a
										key={i}
										href={c.link}
										target="_blank"
										rel="noreferrer"
										className="block text-sm text-accent hover:text-accent/80 hover:underline leading-relaxed font-medium transition-colors p-2 hover:bg-accent/5 rounded-md"
									>
										{c.title}
									</a>
								))}
							</div>
						</ScrollArea>
					</AnalysisSection>
				)}

				{/* YouTube Videos */}
				{result.insights.youtube && result.insights.youtube.length > 0 && (
					<AnalysisSection
						title="Related Videos"
						icon={<Youtube className="w-4 h-4 text-red-600" />}
						iconBgColor="bg-red-50 dark:bg-red-900/20"
					>
						<ScrollArea className="h-24">
							<div className="space-y-3">
								{result.insights.youtube.slice(0, 2).map((v, i) => (
									<a
										key={i}
										href={`https://www.youtube.com/watch?v=${v.videoId}`}
										target="_blank"
										rel="noreferrer"
										className="block text-sm text-accent hover:text-accent/80 hover:underline leading-relaxed font-medium transition-colors p-2 hover:bg-accent/5 rounded-md"
									>
										{v.title}
									</a>
								))}
							</div>
						</ScrollArea>
					</AnalysisSection>
				)}
			</>
		);
	}, [result, showAnalysis, getCategoryColor]);

	// Memoized ready state
	const readyState = useMemo(() => {
		if (result || isProcessing) return null;

		return (
			<div className="text-center py-8 space-y-4">
				<div className="p-4 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full w-fit mx-auto">
					<FileImage className="w-10 h-10 text-accent" />
				</div>
				<div className="space-y-2">
					<p className="text-sm font-medium text-foreground">{readyText}</p>
					<p className="text-xs text-muted-foreground">
						Click analyze to get insights
					</p>
				</div>
			</div>
		);
	}, [result, isProcessing, readyText]);

	return (
		<Card className="group overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] bg-gradient-to-br from-card to-muted/20 border-border/50">
			<div className="relative">
				<div className="aspect-square bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center overflow-hidden">
					<img
						src={imageFile.preview || "/placeholder.svg"}
						alt={imageFile.file.name}
						className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
						onError={handleImageError}
						loading="lazy"
					/>
				</div>

				<Button
					variant="destructive"
					size="sm"
					className="absolute top-3 right-3 h-9 w-9 p-0 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:scale-110"
					onClick={handleRemove}
					aria-label={`Remove ${imageFile.file.name}`}
				>
					<X className="w-4 h-4" />
				</Button>

				{processingOverlay}
			</div>

			<CardHeader className="pb-4 space-y-3">
				<CardTitle
					className="text-base font-bold truncate text-foreground"
					title={imageFile.file.name}
				>
					{imageFile.file.name}
				</CardTitle>
				<div className="flex items-center justify-between">
					<span className="text-sm text-muted-foreground font-medium">
						{formatFileSize(imageFile.size)}
					</span>
					<div className="flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/20 rounded-full">
						<CheckCircle className="w-4 h-4 text-green-600" />
						<span className="text-sm font-medium text-green-700 dark:text-green-400">
							Valid
						</span>
					</div>
				</div>
			</CardHeader>

			<CardContent className="pt-0 space-y-6">
				{errorAlert}
				{analysisContent}
				{readyState}
			</CardContent>
		</Card>
	);
};

export default ImageCard;
