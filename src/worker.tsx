// import { Hono } from 'hono';
// Using Hono from hono causes hono's router's regex disfunctional.
import { Hono } from 'hono/quick';
import { serveStatic } from 'hono/cloudflare-workers';
import { htmx } from './htmx';
import Layout from './layout';
import { ACMHome, AddAspectButton, AddCompetenceButton, AspectDescriptor, BookCover, CompetenceCover, CompetenceDescriptor, CompetenceList, CompetenceNav, GroupedEvidencesEditor, GroupedEvidencesView, LevelDescriptor } from './components';
import { getGroupedEvidences } from './utils';
import { html } from 'hono/html';

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

// Interview batch dev
const x = {
	element: 'Mental Flex',
	items: [
		{ id: 48, name: 'Perpectives Flexibility' },
		{ id: 48, name: 'Perpectives Flexibility' },
		{ id: 48, name: 'Perpectives Flexibility' },
	],
};
app.get('/wwcr', async (c) => {
	const sql = `SELECT v.id, v.element_id, e.name element, v.name from acm_evidences v left join acm_elements e on v.element_id=e.id where e.tool='wwcr'`;
	const { results } = await c.env.DB.prepare(sql).all();
	const map: Record<number, any> = {};
	results.forEach((row: any) => {
		if (!map[row.element_id]) {
			map[row.element_id] = {
				element_id: row.element_id,
				element: row.element,
				items: [],
			}
		}
		map[row.element_id].items.push({
			id: row.id,
			name: row.name,
		});
	})
	const array = [];
	for (let k in map) {
		array.push(map[k])
	}
	// return c.html(<pre>{JSON.stringify(array, null, 2)}</pre>)
	return c.html(
		<Layout>
			<div class="mb-4" hx-include="#evidences" hx-target="table">
				<button hx-put="/wwcr" class="h-8 bg-lime-500 text-white font-bold px-5">
					Save
				</button>
			</div>
			<form id="evidences" class="border border-slate-500 w-96 h-96 overflow-auto p-2">
				<table class="w-full">
					{array.map((group) => (
						<GroupedEvidencesEditor group={group} />
					))}
				</table>
				{html`
					<script>
						document.querySelectorAll('tbody.group-header').forEach((elm) => {
							elm.addEventListener('click', (e) => {
								if (elm.nextSibling.classList.contains('hidden')) {
									elm.nextSibling.classList.remove('hidden')
								} else {
									elm.nextSibling.classList.add('hidden')
								}
							});
						});
					</script>
				`}
			</form>
		</Layout>
	);
}).put(async (c) => {
	const body = await c.req.parseBody();
	const keys = Object.keys(body);
	const ids = keys.map(k => parseInt(k.substring(1)))
	console.log(JSON.stringify(ids));
	const sql = 'UPDATE acm_batches SET wwcr_evidences=? WHERE id=?';
	await c.env.DB.prepare(sql).bind(JSON.stringify(ids), 'abc').run();
	return c.html(
		<tr>
			<td>1</td>
			<td>2</td>
			<td>3</td>
		</tr>
	);
})

app.get('/wwcr/test', async (c) => {
	const sql = 'SELECT json(wwcr_evidences) ids FROM acm_batches WHERE id=?';
	const rs: any = await c.env.DB.prepare(sql).bind('abc').first();
	const ids = rs.ids;
	const groups = getGroupedEvidences(ids);
	return c.html(
		<Layout>
			<table id="table" class="">
				{groups.map((g) => (
					<GroupedEvidencesView group={g} />
				))}
			</table>
			{html`
				<script>
					document.querySelectorAll('input[type=radio]').forEach((elm) => {
						let id = elm.getAttribute('name');
						elm.addEventListener('change', (e) => {
							// console.log(elm.checked);
							document.getElementById(id).innerText = elm.value;
							document.getElementById(id).classList.remove('text-slate-300');
						});
					});
				</script>
			`}
		</Layout>
	);
})

/////////////////////////
export default app;
