import { Hono } from 'hono';

const htmx = new Hono<{ Bindings: Env }>();

htmx.get('/book/:type{solar|bensin|kapur}/:section{AA|BB}/:id', (c) => {
	const { type, section, id } = c.req.param();
	return c.html(
		<div>
			<p>Type: {type}</p>
			<p>Section: {section}</p>
			<p>ID: {id}</p>
		</div>
	);
});

export { htmx };
