import { Link } from "react-router-dom";

function TButton({
	color = "indigo",
	to = "",
	circle = false,
	href = "",
	link = false,
	target = "_blank",
	onClick = () => {},
	children,
	nClasses = false,
	className,
	isDisable = false,
	onChecking = false,
}) {
	let classes = [
		"flex",
		"items-center",
		"whitespace-nowrap",
		"text-sm",
		// "border",
		// "border-2",
		// "border-transparent",
	];

	if (link) {
		classes = [...classes, "transition-colors"];

		switch (color) {
			case "indigo":
				classes = [...classes, "text-indigo-500", "focus:border-indigo-500"];
				break;
			case "red":
				classes = [...classes, "text-red-500", "focus:border-red-500"];
				break;
		}
	} else {
		classes = [...classes, "text-white", "focus:ring-2", "focus:fing-offset-2"];

		if (isDisable || onChecking) color = "waiting";
		switch (color) {
			case "indigo":
				classes = [
					...classes,
					"bg-indigo-600",
					"hover:bg-indigo-700",
					"focus:ring-indigo-500",
				];
				break;
			case "red":
				classes = [
					...classes,
					"bg-red-600",
					"hover:bg-red-700",
					"focus:ring-red-500",
				];
				break;
			case "green":
				classes = [
					...classes,
					"bg-emerald-600",
					"hover:bg-emerald-700",
					"focus:ring-emerald-500",
				];
				break;
			case "primary":
				classes = [...classes, "btn", "btn-primary"];
				break;
			case "danger":
				classes = [...classes, "btn", "btn-danger"];
				break;
			case "light":
				classes = [...classes, "btn", "btn-light"];
				break;
			case "primary-dark":
				classes = [...classes, "btn", "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"];
				break;
			case "waiting":
				classes = [
					...classes,
					"bg-gray-300",
					"hover:bg-gray-400",
					"focus:ring-gray-600",
				];
		}
	}

	if (circle) {
		classes = [
			...classes,
			"h-8",
			"w-8",
			"items-center",
			"justify-center",
			"rounded-full",
			"text-sm",
		];
	} else {
		classes = [...classes, "p-0", "py-2", "px-4", "rounded-md"];
	}

	classes = [className, ...classes];
	if (nClasses !== false) classes = [nClasses];

	return (
		<>
			{href && (
				<a href={href} className={classes.join(" ")} target={target}>
					{children}
				</a>
			)}
			{to && (
				<Link to={to} className={classes.join(" ")}>
					{children}
				</Link>
			)}
			{!to && !href && (
				<button
					onClick={onClick}
					className={classes.join(" ")}
					disabled={isDisable || onChecking}
				>
					{!onChecking && children}
					{onChecking && (
						<>
							<svg
								className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								></circle>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
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
