import React from "react";

export default function OverdueBadge( { count } ) {
	if ( !count || count === 0 ) {
		return null;
	}

	return (
		<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
			{count} Overdue
		</span>
	);
}
