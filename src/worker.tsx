import { Hono } from 'hono';
import { htmx } from './htmx';

const app = new Hono<{ Bindings: Env }>();
app.route('/htmx', htmx);

app.get('/book/:type{one|two}/:section{AA|BB}/:id', (c) => {
	const { type, section, id } = c.req.param();
	return c.html(
		<div>
			<p>Type: {type}</p>
			<p>Section: {section}</p>
			<p>ID: {id}</p>
		</div>
	);
});
app.get('/name-definition/:table{competence|aspect|level}/:field/:id', (c) => {
	const { table, field, id } = c.req.param();
	return c.html(
		<div>
			<p>Table: {table}</p>
			<p>Field: {field}</p>
			<p>ID: {id}</p>
		</div>
	);
});

app.get('/db/elements', async (c) => {
	const sql = 'SELECT * FROM acm_elements';
	const { results } = await c.env.DB.prepare(sql).all();
	return c.json(results);
})
app.get('/db/evidences', async (c) => {
	const sql = 'SELECT * FROM acm_evidences';
	const { results } = await c.env.DB.prepare(sql).all();
	return c.json(results);
});

export default app;
