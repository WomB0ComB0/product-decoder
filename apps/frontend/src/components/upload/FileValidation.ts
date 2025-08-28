export interface ValidationError {
	type: "size" | "format" | "dimensions" | "security" | "general";
	message: string;
}

export const validateFileSignature = (file: File): Promise<boolean> => {
	return new Promise((resolve) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			const arr = new Uint8Array(e.target?.result as ArrayBuffer).subarray(
				0,
				4,
			);
			let header = "";
			for (let i = 0; i < arr.length; i++)
				header += arr[i]?.toString(16).padStart(2, "0");
			const validSignatures: Record<string, string> = {
				ffd8ffe0: "jpeg",
				ffd8ffe1: "jpeg",
				ffd8ffe2: "jpeg",
				ffd8ffe3: "jpeg",
				ffd8ffe8: "jpeg",
				"89504e47": "png",
				"47494638": "gif",
				"52494646": "webp",
			};
			const isValid = Object.keys(validSignatures).some((s) =>
				header.startsWith(s.toLowerCase()),
			);
			resolve(isValid);
		};
		reader.readAsArrayBuffer(file.slice(0, 4));
	});
};

export const validateImageDimensions = (
	file: File,
	maxWidth: number,
	maxHeight: number,
): Promise<{ width: number; height: number; valid: boolean }> =>
	new Promise((resolve) => {
		const img = new Image();
		const url = URL.createObjectURL(file);
		img.onload = () => {
			URL.revokeObjectURL(url);
			resolve({
				width: img.width,
				height: img.height,
				valid: img.width <= maxWidth && img.height <= maxHeight,
			});
		};
		img.onerror = () => {
			URL.revokeObjectURL(url);
			resolve({ width: 0, height: 0, valid: false });
		};
		img.src = url;
	});

export const validateFile = async (
	file: File,
	maxSize: number,
	acceptedFormats: string[],
	maxWidth: number,
	maxHeight: number,
): Promise<ValidationError[]> => {
	const errors: ValidationError[] = [];

	if (file.size > maxSize)
		errors.push({
			type: "size",
			message: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds max (${(maxSize / 1024 / 1024).toFixed(2)}MB)`,
		});

	if (!acceptedFormats.includes(file.type))
		errors.push({
			type: "format",
			message: `File format ${file.type} not allowed`,
		});

	const hasValidSignature = await validateFileSignature(file);
	if (!hasValidSignature)
		errors.push({
			type: "security",
			message: "File signature invalid (not a recognized image)",
		});

	if (hasValidSignature) {
		try {
			const d = await validateImageDimensions(file, maxWidth, maxHeight);
			if (!d.valid)
				errors.push({
					type: "dimensions",
					message: `Image ${d.width}x${d.height} exceeds ${maxWidth}x${maxHeight}`,
				});
		} catch {
			errors.push({
				type: "general",
				message: "Failed to validate dimensions",
			});
		}
	}

	return errors;
};

export const formatFileSize = (bytes: number): string => {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / k ** i).toFixed(2)) + " " + sizes[i];
};
