// import { Hono } from 'hono';
// Using Hono from hono causes hono's router's regex disfunctional.
import { Hono } from 'hono/quick';
import { serveStatic } from 'hono/cloudflare-workers';
import { htmx } from './htmx';
import Layout from './layout';
import { ACMHome, AddAspectButton, AddCompetenceButton, AspectDescriptor, BookCover, CompetenceCover, CompetenceDescriptor, CompetenceList, CompetenceNav, LevelDescriptor } from './components';

const app = new Hono<{ Bindings: Env }>();
app.get('/static/*', serveStatic({ root: './' }));
app.route('/htmx', htmx);

// Test using regex

app.get('/book/:type{one|two}/:section{AA|BB}/:id', (c) => {
	const { type, section, id } = c.req.param();
	return c.html(
		<Layout>
			<div class="text-xl text-lime-600 leading-6 font-light">
				<p><span class="inline-block w-[80px]">Type:</span> {type}</p>
				<p><span class="inline-block w-[80px]">Section:</span> {section}</p>
				<p><span class="inline-block w-[80px]">ID:</span> {id}</p>
			</div>
		</Layout>
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

// Test db

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

// Main app

app.get('/', (c) => c.redirect('/acm'));

// Repo home

app.get('/acm', async (c) => {
	const sql = 'SELECT * FROM acm_books';
	const rs = await c.env.DB.prepare(sql).all();
	return c.html(
		<Layout>
			<p class="flex flex-row gap-3 text-sm uppercase tracking-wider mb-2">
				<a href="/acm" class="text-blue-600">
					Home
				</a>
				<span>/</span>
				<a href="/acm/elements" class="text-blue-600">
					Elements
				</a>
			</p>
			<ACMHome books={rs.results as Book[]} />
		</Layout>
	);
});

// Book home

app.get('/acm/:book_id', async (c) => {
	const id = c.req.param('book_id');
	const sql1 = 'SELECT * FROM acm_books WHERE id=?';
	const sql2 = 'SELECT * FROM acm_competences WHERE book_id=?';

	const db = c.env.DB;
	const rs = await db.batch([
		db.prepare(sql1).bind(id), //
		db.prepare(sql2).bind(id), //
	]);

	if (rs[0].results.length == 0) {
		c.status(404);
		return c.body(null);
	}

	const book = rs[0].results[0] as Book;
	const items = rs[1].results as Competence[];
	return c.html(
		<Layout>
			<p class="flex flex-row gap-3 text-sm uppercase tracking-wider mb-2">
				<a href="/acm" class="text-blue-600">
					Home
				</a>
			</p>
			<BookCover book={book} />
			<CompetenceList items={items} />
			<AddCompetenceButton book_id={book.id} />
		</Layout>
	);
});

// Competence home

app.get('/acm/c/:competence_id', async (c) => {
	const id = c.req.param('competence_id');
	const sql1 = `SELECT b.title, b.type, b.levels level, c.* FROM acm_competences c LEFT JOIN acm_books b ON c.book_id=b.id WHERE c.id=?`;
	const found: any = await c.env.DB.prepare(sql1).bind(id).first();

	if (!found) {
		c.status(404);
		return c.html(
			<Layout>
				<h1>404 Not Found</h1>
			</Layout>
		);
	}

	const { title, type, level } = found;
	const competence = found as Competence;

	// Load indicators, aspects, levels
	const sql2 = `SELECT * FROM acm_aspects WHERE competence_id=?`;
	const sql3 = `SELECT * FROM acm_levels WHERE competence_id=?`;
	const sql4 = `SELECT * FROM acm_indicators WHERE competence_id=?`;
	const [{ results: aspects }, { results: levels }, { results: indicators }] = await c.env.DB.batch([
		c.env.DB.prepare(sql2).bind(id),
		c.env.DB.prepare(sql3).bind(id),
		c.env.DB.prepare(sql4).bind(id),
	]);

	return c.html(
		<Layout>
			<CompetenceNav book_id={competence.book_id} />
			<CompetenceCover title={title} type={type} level={level} />
			<CompetenceDescriptor item={competence} indicators={indicators as Indicator[]} />

			<h2 class="text-2xl mt-8 mb-5">Levels</h2>
			{found.type == 'grading' && levels.map((item: any) => <LevelDescriptor item={item as Level} />)}
			{found.type != 'grading' && <p class="-mt-3">Kompetensi ini tidak memiliki level.</p>}

			<h2 class="text-2xl mt-8 mb-5">Aspects</h2>
			<div id="aspects">
				{aspects.map((item: any, index: number) => (
					<AspectDescriptor item={item as Aspect} index={index} />
				))}
			</div>

			<AddAspectButton competence_id={competence.id} />
			<div class="h-64"></div>
		</Layout>
	);
});

export default app;
