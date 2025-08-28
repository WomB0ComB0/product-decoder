import React, { useCallback, useEffect, useState } from "react";
import {
	AIAnalysisPipeline,
	type CSEResult,
	type NewsHit,
	type PipelineResult,
	type WebDetect,
	type YTHit,
} from "./AIAnalysisPipeline";

// Custom error component for AI analysis
const AIAnalysisError: React.FC<{ error: Error; retry: () => void }> = ({
	error,
	retry,
}) => (
	<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
		<h3 className="text-red-800 font-semibold mb-2">AI Analysis Failed</h3>
		<p className="text-red-600 text-sm mb-3">{error.message}</p>
		<button
			onClick={retry}
			className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
		>
			Retry Analysis
		</button>
	</div>
);

// Custom loading component for AI analysis
const AIAnalysisLoader: React.FC = () => (
	<div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
		<div className="flex items-center space-x-3">
			<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
			<div>
				<h3 className="text-blue-800 font-semibold">Analyzing Image</h3>
				<p className="text-blue-600 text-sm">Processing with AI...</p>
			</div>
		</div>
	</div>
);

// Hook for reverse image search using AIAnalysisPipeline
export const useReverseImageSearch = (file: File | null) => {
	const [data, setData] = useState<WebDetect | null>(null);
	const [error, setError] = useState<Error | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const refetch = useCallback(async () => {
		if (!file) return;

		setIsLoading(true);
		setError(null);

		try {
			const aiPipeline = new AIAnalysisPipeline(
				process.env.VITE_FOOD_API_KEY ?? "",
			);
			const result = await aiPipeline.reverseImage(file);
			setData(result);
		} catch (err) {
			setError(
				err instanceof Error ? err : new Error("Unknown error occurred"),
			);
		} finally {
			setIsLoading(false);
		}
	}, [file]);

	useEffect(() => {
		refetch();
	}, [refetch]);

	return {
		data,
		error,
		isLoading,
		refetch,
		isRefetching: isLoading,
	};
};

// Hook for news search using AIAnalysisPipeline
export const useNewsSearch = (query: string) => {
	const [data, setData] = useState<NewsHit[]>([]);
	const [error, setError] = useState<Error | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const refetch = useCallback(async () => {
		if (!query) return;

		setIsLoading(true);
		setError(null);

		try {
			const result = await AIAnalysisPipeline.fetchNews(query);
			setData(result);
		} catch (err) {
			setError(
				err instanceof Error ? err : new Error("Unknown error occurred"),
			);
		} finally {
			setIsLoading(false);
		}
	}, [query]);

	useEffect(() => {
		refetch();
	}, [refetch]);

	return {
		data,
		error,
		isLoading,
		refetch,
		isRefetching: isLoading,
	};
};

// Hook for web search using AIAnalysisPipeline
export const useWebSearch = (query: string) => {
	const [data, setData] = useState<CSEResult[]>([]);
	const [error, setError] = useState<Error | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const refetch = useCallback(async () => {
		if (!query) return;

		setIsLoading(true);
		setError(null);

		try {
			const result = await AIAnalysisPipeline.fetchWebResults(query);
			setData(result);
		} catch (err) {
			setError(
				err instanceof Error ? err : new Error("Unknown error occurred"),
			);
		} finally {
			setIsLoading(false);
		}
	}, [query]);

	useEffect(() => {
		refetch();
	}, [refetch]);

	return {
		data,
		error,
		isLoading,
		refetch,
		isRefetching: isLoading,
	};
};

// Hook for YouTube search using AIAnalysisPipeline
export const useYouTubeSearch = (query: string) => {
	const [data, setData] = useState<YTHit[]>([]);
	const [error, setError] = useState<Error | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const refetch = useCallback(async () => {
		if (!query) return;

		setIsLoading(true);
		setError(null);

		try {
			const result = await AIAnalysisPipeline.fetchYouTubeVideos(query);
			setData(result);
		} catch (err) {
			setError(
				err instanceof Error ? err : new Error("Unknown error occurred"),
			);
		} finally {
			setIsLoading(false);
		}
	}, [query]);

	useEffect(() => {
		refetch();
	}, [refetch]);

	return {
		data,
		error,
		isLoading,
		refetch,
		isRefetching: isLoading,
	};
};

// Component for reverse image search
export const ReverseImageSearch: React.FC<{
	file: File;
	children: (data: WebDetect) => React.ReactNode;
}> = ({ file, children }) => {
	const { data, error, isLoading, refetch } = useReverseImageSearch(file);

	if (isLoading) {
		return <AIAnalysisLoader />;
	}

	if (error) {
		return <AIAnalysisError error={error} retry={refetch} />;
	}

	if (!data) {
		return <AIAnalysisLoader />;
	}

	return <>{children(data)}</>;
};

// Component for news search
export const NewsSearch: React.FC<{
	query: string;
	children: (data: NewsHit[]) => React.ReactNode;
}> = ({ query, children }) => {
	const { data, error, isLoading, refetch } = useNewsSearch(query);

	if (!query) return null;

	if (isLoading) {
		return <AIAnalysisLoader />;
	}

	if (error) {
		return <AIAnalysisError error={error} retry={refetch} />;
	}

	return <>{children(data || [])}</>;
};

// Component for web search
export const WebSearch: React.FC<{
	query: string;
	children: (data: CSEResult[]) => React.ReactNode;
}> = ({ query, children }) => {
	const { data, error, isLoading, refetch } = useWebSearch(query);

	if (!query) return null;

	if (isLoading) {
		return <AIAnalysisLoader />;
	}

	if (error) {
		return <AIAnalysisError error={error} retry={refetch} />;
	}

	return <>{children(data || [])}</>;
};

// Component for YouTube search
export const YouTubeSearch: React.FC<{
	query: string;
	children: (data: YTHit[]) => React.ReactNode;
}> = ({ query, children }) => {
	const { data, error, isLoading, refetch } = useYouTubeSearch(query);

	if (!query) return null;

	if (isLoading) {
		return <AIAnalysisLoader />;
	}

	if (error) {
		return <AIAnalysisError error={error} retry={refetch} />;
	}

	return <>{children(data || [])}</>;
};

// Enhanced AI Analysis component using AIAnalysisPipeline directly
export const EnhancedAIAnalysis: React.FC<{
	imageFile: { id: string; file: File };
	onResult: (result: PipelineResult) => void;
	onError: (error: Error) => void;
}> = ({ imageFile, onResult, onError }) => {
	const [isProcessing, setIsProcessing] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const aiPipeline = React.useMemo(() => {
		return new AIAnalysisPipeline(process.env.VITE_FOOD_API_KEY ?? "");
	}, []);

	useEffect(() => {
		const processImage = async () => {
			try {
				setIsProcessing(true);
				setError(null);

				const result = await aiPipeline.runPipelineForImage(imageFile);
				onResult(result);
			} catch (err) {
				const error =
					err instanceof Error ? err : new Error("AI analysis failed");
				setError(error);
				onError(error);
			} finally {
				setIsProcessing(false);
			}
		};

		processImage();
	}, [imageFile, aiPipeline, onResult, onError]);

	if (error) {
		return (
			<AIAnalysisError error={error} retry={() => window.location.reload()} />
		);
	}

	if (isProcessing) {
		return <AIAnalysisLoader />;
	}

	return null;
};

export default EnhancedAIAnalysis;
