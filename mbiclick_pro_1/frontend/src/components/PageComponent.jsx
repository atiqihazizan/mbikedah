function PageComponent({ title, buttons = "", children, className }) {
	return (
		<>
			<header className="bg-white shadow border-b">
				{/* <div className="flex justify-between items-center mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"> */}
				<div className="flex justify-between items-center px-4 py-6 sm:px-6 lg:px-8">
					<h1 className="text-3xl font-bold tracking-tight text-gray-900">
						{title}
					</h1>
					{buttons}
				</div>
			</header>
			<main className={`grow ${className || ""}`}>
				{/* <div className="mx-auto max-w-7xl">{children}</div> */}
				{/* <div className="py-6 sm:px-6 lg:px-8">{children}</div> */}
				{/* <div className={mainClass}>{children}</div> */}
				{children}
			</main>
		</>
	);
}

export default PageComponent;
