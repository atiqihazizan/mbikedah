import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";

const items = [
	{
		id: 1,
		title: "Back End Developer",
		department: "Engineering",
		type: "Full-time",
		location: "Remote",
	},
	{
		id: 2,
		title: "Front End Developer",
		department: "Engineering",
		type: "Full-time",
		location: "Remote",
	},
	{
		id: 3,
		title: "User Interface Designer",
		department: "Design",
		type: "Full-time",
		location: "Remote",
	},
];

export default function PaginationLinks({ meta, onPageClick }) {
	function onClick(ev, link) {
		ev.preventDefault();
		if (!link.url) return;
		onPageClick(link);
	}

	return (
		// <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 shadow-md">
		<div className="flex items-center justify-between bg-white px-4 py-3 sm:px-6 border-t">
			<div className="flex flex-1 justify-between lg:hidden">
				<a
					href="#"
					onClick={(ev) => onClick(ev, meta.links[0])}
					className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
				>
					Previous
				</a>
				<a
					href="#"
					onClick={(ev) => onClick(ev, meta.links[meta.links.length - 1])}
					className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
				>
					Next
				</a>
			</div>
			<div className="hidden lg:flex lg:flex-1 sm:items-center sm:justify-between">
				<div>
					<p className="text-sm text-gray-700">
						Showing <span className="font-medium">{meta.from}</span> to{" "}
						<span className="font-medium">{meta.to}</span> of{" "}
						<span className="font-medium">{String(meta.total).replace(/(.)(?=(\d{3})+$)/g, "$1,")}</span>{" "}
						results
					</p>
				</div>
				<div>
					{meta.total > meta.per_page && (
						<nav
							className="isolate inline-flex -space-x-px rounded-md shadow-sm"
							aria-label="Pagination"
						>
							{meta.links &&
								meta.links.map((link, ind) => (
									<a
										key={ind}
										href="#"
										onClick={(ev) => onClick(ev, link)}
										aria-current="page"
										className={
											"relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 " +
											(ind === 0 ? " rounded-l-md ring-gray-300 " : "") +
											(ind === meta.links.length - 1
												? " rounded-r-md ring-gray-300 "
												: "") +
											(link.active
												? " z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 "
												: " text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0")
										}
										dangerouslySetInnerHTML={{ __html: link.label }}
									></a>
								))}
						</nav>
					)}
				</div>
			</div>
		</div>
	);
}
