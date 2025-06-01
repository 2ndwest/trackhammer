import "./Queue.css";

import QueueItem from "./QueueItem.jsx";

export default function Queue() {
	const queue = ["item 1", "item 2", "item "];

	return (
		<div className="Queue">
			{queue.map((url) => (
				<QueueItem>url=url</QueueItem>
			))}
		</div>
	);
}
