import { Link } from "react-router-dom";

function TButton({
	color = "",
	size = "md",
	variant = "solid", // Tambah prop variant: "solid", "link", "subtle", "outline"
	to = "",
	circle = false,
	href = "",
	target = "_blank",
	onClick = () => {},
	children,
	nClasses = false,
	className,
	isDisable = false,
	onChecking = false,
}) {
	let classes = ["flex","items-center","whitespace-nowrap",'space-x-2'];

	// Size configurations
	const sizeConfig = {
		xs: {
			text: "text-xs",
			padding: "px-2 py-1",
			circle: "h-6 w-6",
			iconPadding: "p-0.5", // Untuk button icon
		},
		sm: {
			text: "text-sm",
			padding: "px-3 py-1.5",
			circle: "h-7 w-7",
			iconPadding: "p-1",
		},
		md: {
			text: "text-sm",
			padding: "px-4 py-2",
			circle: "h-8 w-8",
			iconPadding: "p-1",
		},
		lg: {
			text: "text-base",
			padding: "px-6 py-3",
			circle: "h-10 w-10",
			iconPadding: "p-1.5",
		},
		xl: {
			text: "text-lg",
			padding: "px-8 py-4",
			circle: "h-12 w-12",
			iconPadding: "p-2",
		}
	};

	const currentSize = sizeConfig[size] || sizeConfig.md;
	classes = [...classes, currentSize.text];

	// Tambah disabled styling untuk semua variant
	if (isDisable || onChecking) {
		classes = [...classes, "disabled:opacity-75"];
	}

	// Variant: Link (text only dengan underline)
	if (variant === "link") {
		classes = [...classes, "transition-colors", "duration-200", "hover:underline"];
		
		// Tambah disabled state untuk link variant
		if (isDisable || onChecking) {
			classes = [...classes, "cursor-not-allowed"];
		}

		switch (color) {
			case "indigo": classes = [...classes, "text-indigo-600", "hover:text-indigo-700", "focus:text-indigo-800"]; break;
			case "red": classes = [...classes, "text-red-600", "hover:text-red-700", "focus:text-red-800"]; break;
			case "blue":classes = [...classes, "text-blue-600", "hover:text-blue-700", "focus:text-blue-800"];break;
			case "green":classes = [...classes, "text-emerald-600", "hover:text-emerald-700", "focus:text-emerald-800"];break;
			case "primary": classes = [...classes, "text-blue-600", "hover:text-blue-700", "focus:text-blue-800"]; break;
			case "danger": classes = [...classes, "text-red-600", "hover:text-red-700", "focus:text-red-800"]; break;
			case "ghost": classes = [...classes, "text-gray-600", "hover:text-gray-800", "focus:text-gray-900"]; break;
			case "light": classes = [...classes, "text-gray-500", "hover:text-gray-700", "focus:text-gray-800"]; break;
		}
	} 
	// Variant: Subtle (text berwarna dengan background hover ringan)
	else if (variant === "subtle") {
		classes = [...classes, "transition-colors", "duration-200", "rounded"];
		
		// Tambah disabled state untuk subtle variant
		if (isDisable || onChecking) {
			classes = [...classes, "cursor-not-allowed"];
		}

		switch (color) {
			case "indigo": classes = [...classes, "text-indigo-600", "hover:text-indigo-900", "hover:bg-indigo-50"];break;
			case "red": classes = [...classes, "text-red-600", "hover:text-red-900", "hover:bg-red-50"];break;
			case "blue": classes = [...classes, "text-blue-600", "hover:text-blue-900", "hover:bg-blue-50"];break;
			case "green": classes = [...classes, "text-green-600", "hover:text-green-900", "hover:bg-green-50"];break;
			case "primary": classes = [...classes, "text-blue-600", "hover:text-blue-900", "hover:bg-blue-50"];break;
			case "danger": classes = [...classes, "text-red-600", "hover:text-red-900", "hover:bg-red-50"];break;
			case "ghost": classes = [...classes, "text-gray-600", "hover:text-gray-800", "hover:bg-gray-50"];break;
			case "light": classes = [...classes, "text-gray-500", "hover:text-gray-700", "hover:bg-gray-50"];break;
		}
	}
	// Variant: Outline (border dengan background putih)
	else if (variant === "outline") {
		classes = [...classes, "font-medium", "bg-white", "border", "transition-colors", "duration-200", "focus:outline-none", "focus:ring-2", "focus:ring-offset-2"];
		
		// Tambah disabled state untuk outline variant
		if (isDisable || onChecking) {
			classes = [...classes, "cursor-not-allowed"];
		}

		switch (color) {
			case "indigo": classes = [...classes, "text-indigo-700", "border-indigo-300", "hover:bg-indigo-50", "focus:ring-indigo-500"]; break;
			case "red": classes = [...classes, "text-red-700", "border-red-300", "hover:bg-red-50", "focus:ring-red-500"]; break;
			case "blue": classes = [...classes, "text-blue-700", "border-blue-300", "hover:bg-blue-50", "focus:ring-blue-500"]; break;
			case "green": classes = [...classes, "text-green-700", "border-green-300", "hover:bg-green-50", "focus:ring-green-500"]; break;
			case "primary": classes = [...classes, "text-blue-700", "border-blue-300", "hover:bg-blue-50", "focus:ring-blue-500"]; break;
			case "danger": classes = [...classes, "text-red-700", "border-red-300", "hover:bg-red-50", "focus:ring-red-500"]; break;
			case "orange": classes = [...classes, "text-orange-700", "border-orange-300", "hover:bg-orange-50", "focus:ring-orange-500"]; break;
			case "ghost":
			case "light":
			default: classes = [...classes, "text-gray-700", "border-gray-300", "hover:bg-gray-50", "focus:ring-gray-500"]; break;
		}
	}
	// Variant: Solid (default - button dengan background solid)
	else {
		classes = [...classes, "focus:ring-2", "focus:ring-offset-2"];
		
		// Tambah disabled state untuk solid variant
		if (isDisable || onChecking) {
			classes = [...classes, "cursor-not-allowed"];
		}

		if (isDisable || onChecking) color = "waiting";
		switch (color) {
			case "indigo": classes = [...classes,"text-white","bg-indigo-600","hover:bg-indigo-700","focus:ring-indigo-500"]; break;
			case "red": classes = [...classes,"text-white","bg-red-600","hover:bg-red-700","focus:ring-red-500"]; break;
			case "blue": classes = [...classes,"text-white","bg-blue-600","hover:bg-blue-700","focus:ring-blue-500"]; break;
			case "green": classes = [...classes,"text-white","bg-green-600","hover:bg-green-700","focus:ring-green-500"]; break;
			case "orange": classes = [...classes,"text-white","bg-orange-600","hover:bg-orange-700","focus:ring-orange-500"]; break;
			case "primary": classes = [...classes,"text-white","btn","btn-primary"]; break;
			case "danger": classes = [...classes,"text-white","btn","btn-danger"]; break;
			case "light": classes = [...classes,"btn","btn-light"]; break;
			case "ghost": classes = [...classes,"text-gray-400","hover:text-gray-600","transition-colors","duration-200","hover:bg-white"]; break;
			case "primary-dark": classes = [...classes,"btn","inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"]; break;
			case "waiting": classes = [...classes,"text-white","bg-gray-300","hover:bg-gray-400","focus:ring-gray-600"]; break;
			case "check": classes = [...classes,"text-white","bg-green-600","hover:bg-green-700","focus:ring-green-500"]; break;
			case "refresh": classes = [...classes,"p-2","text-gray-400","hover:text-gray-600","transition-colors","duration-200","rounded-lg","hover:bg-white"]; break;
		}
	}

	// Apply size-based padding dan shape
	if (circle) {
		classes = [...classes, currentSize.circle, "items-center", "justify-center", "rounded-full"];
	} else {
		// Untuk variant subtle, gunakan padding yang lebih kecil (cocok untuk icon button)
		const padding = variant === "subtle" ? currentSize.iconPadding : currentSize.padding;
		classes = [...classes, "p-0", padding, "rounded-md"];
	}

	classes = [className, ...classes];
	if (nClasses !== false) classes = [nClasses];

	return (
		<>
			{href && (<a href={href} className={classes.join(" ")} target={target}>{children}</a>)}
			{to && (<a href={to} className={classes.join(" ")}>	{children}</a>)}
			{!to && !href && (
				<button onClick={onClick} className={classes.join(" ")} disabled={isDisable || onChecking}>
					{!onChecking && children}
					{onChecking && (
						<>
							<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							<span>Processing...</span>
						</>
					)}
				</button>
			)}
		</>
	);
}

export default TButton;