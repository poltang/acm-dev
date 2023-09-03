import { Context, Hono } from 'hono';
import { ulidFactory } from 'ulid-workers';
import { ACMHome, AddAspectButton, AddAspectForm, AddCompetenceButton, AddCompetenceForm, AspectDescriptor, AspectElementFormItem, AspectElementsForm, BookForm, DomainElementsBrowser, GroupedElements, GroupedIndicators, IndicatorsForm, IndicatorsFormItem, NameOrDefinition, NameOrDefinitionForm, SimpleItem } from './components';
import { DOMAINS } from './constants';

const ulid = ulidFactory();

const htmxNotFound = (c: Context) => {
	c.status(404);
	return c.body(null);
};

const htmx = new Hono<{ Bindings: Env }>();

// Test regex

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

// Books

htmx.get('/book-form', (c) => {
	return c.html(
		<div id="main">
			<h2 class="text-2xl font-bold mb-5">Create New Repository</h2>
			<BookForm />
		</div>
	);
})

htmx.get('/book-level', (c) => {
	const type = c.req.query('type');
	if (type == 'grading') {
		return c.html(
			<>
				<option value="2">2</option>
				<option value="3">3</option>
				<option value="4">4</option>
				<option value="5">5</option>
				<option value="6">6</option>
				<option value="7">7</option>
				<option value="8">8</option>
				<option value="9">9</option>
			</>
		);
	}
	return c.html(<option value="0">0</option>);
});

htmx.get('/books', async (c) => {
	const sql = 'SELECT * FROM acm_books';
	const rs = await c.env.DB.prepare(sql).all();
	return c.html(<ACMHome books={rs.results as Book[]} />);
})

htmx.post('/books', async (c) => {
	const body = await c.req.parseBody();
	const title = (body.title as string).trim();
	const type = body.type as string;
	const level = body.level as string;

	if (title.length < 10) {
		const message = 'Kolom TITLE harus diisi minimal 10 karakter';
		return c.html(<BookForm title={title} error={message} />);
	}

	const id = ulid();
	const sql = `INSERT INTO acm_books (id,title,type,levels) VALUES (?,?,?,?)`;
	const rs = await c.env.DB.prepare(sql).bind(id, title, type, level).run();
	console.log(rs);
	if (rs.success) {
		c.res.headers.append('HX-Redirect', `/acm/${id}`);
		return c.body(null);
	}

	return c.html(<BookForm title={title} error="Server Error" />);
});

// Competence

htmx.get('/add-competence-button/:book_id', (c) => {
	const id = c.req.param('book_id');
	return c.html(<AddCompetenceButton book_id={id} />);
})

htmx.get('/add-competence-form/:book_id', async (c) => {
	const id = c.req.param('book_id');
	const sql = 'SELECT * FROM acm_books WHERE id=?';
	const found = await c.env.DB.prepare(sql).bind(id).first();
	if (!found) return htmxNotFound(c);
	const book = found as Book;
	return c.html(<AddCompetenceForm book_id={id} type={book.type} level={book.levels} />);
});

htmx.post('/competences', async (c) => {
	const { book_id, type, level, name } = await c.req.parseBody();
	// Check name
	if ((name as string).trim().length < 6) {
		c.status(400);
		return c.body(null);
	}

	const db = c.env.DB;
	const comp_id = ulid();
	const aspect_id = ulid();
	const lvid1 = ulid();
	const lvid2 = ulid();
	const lvid3 = ulid();
	const lvid4 = ulid();
	const lvid5 = ulid();
	const lvid6 = ulid();
	const lvid7 = ulid();
	const lvid8 = ulid();
	const lvid9 = ulid();

	const sql_c = 'INSERT INTO acm_competences (id, book_id, name, definition) VALUES (?,?,?,?)';
	const sql_a = 'INSERT INTO acm_aspects (id, competence_id, name) VALUES (?,?,?)';
	const sql_l = 'INSERT INTO acm_levels (id, competence_id, level, name, definition) VALUES (?,?,?,?,?)';

	const def = 'Sample definition';
	const all = [
		db.prepare(sql_c).bind(comp_id, book_id, name, def),
		db.prepare(sql_a).bind(aspect_id, comp_id, 'Sample Aspect'),
		db.prepare(sql_l).bind(lvid1, comp_id, 1, 'Level 1', def),
		db.prepare(sql_l).bind(lvid2, comp_id, 2, 'Level 2', def),
		db.prepare(sql_l).bind(lvid3, comp_id, 3, 'Level 3', def),
		db.prepare(sql_l).bind(lvid4, comp_id, 4, 'Level 4', def),
		db.prepare(sql_l).bind(lvid5, comp_id, 5, 'Level 5', def),
		db.prepare(sql_l).bind(lvid6, comp_id, 6, 'Level 6', def),
		db.prepare(sql_l).bind(lvid7, comp_id, 7, 'Level 7', def),
		db.prepare(sql_l).bind(lvid8, comp_id, 8, 'Level 8', def),
		db.prepare(sql_l).bind(lvid9, comp_id, 9, 'Level 9', def),
	];

	const thelevel = parseInt(level as string);
	const array = type == 'listing' || thelevel < 1 ? all.filter((_, i) => i < 2) : all.filter((_, i) => i < thelevel + 2);

	const all_rs = await db.batch(array);
	console.log(all_rs[0]);

	return c.html(
		<a href={`/acm/c/${comp_id}`} class="bg-gray-100 hover:bg-gray-200 px-3 py-[7px]">
			{name}
		</a>
	);
});

// Names and definitions

const mainTables: Record<string, string> = {
	competence: 'acm_competences',
	aspect: 'acm_aspects',
	level: 'acm_levels',
};

htmx
	.get('/name-definition/:table{competence|aspect|level}/:field{name|definition}/:id/:form{form}?', async (c) => {
		const { table, field, id, form } = c.req.param();
		const sql = `SELECT * FROM ${mainTables[table]} WHERE id=?`;
		const found = await c.env.DB.prepare(sql).bind(id).first();

		if (!found) return htmxNotFound(c);

		const item = found as any;
		if (form) {
			const url = `/htmx/name-definition/${table}/${field}/${id}`;
			const label = field == 'name' ? 'Name' : 'Definition';
			return c.html(<NameOrDefinitionForm item={item} label={label} field={field} url={url} />);
		}
		const url = `/htmx/name-definition/${table}/${field}/${id}/form`;
		const label = field == 'name' ? 'Name' : 'Definition';
		return c.html(<NameOrDefinition item={item} label={label} field={field} url={url} />);
	})
	.put(async (c) => {
		const { table, field, id } = c.req.param();
		const body = await c.req.parseBody();
		const value = (body[field] as string).trim();

		if (value.length < 6) {
			c.status(400);
			return c.body(null);
		}

		const sql = `UPDATE ${mainTables[table]} SET ${field}=? WHERE id=?`;
		const rs = await c.env.DB.prepare(sql).bind(value, id).run();
		const item: SimpleItem = {
			id,
			name: value,
			definition: value,
		};
		const label = field == 'name' ? 'Name' : 'Definition';
		// const url = `/htmx/name-definition-form/${table}/${field}/${id}`;
		const url = `/htmx/name-definition/${table}/${field}/${id}`;
		return c.html(<NameOrDefinition item={item} label={label} field={field} url={url} />);
	});

// Competence indicators

htmx
	.get('/indicators/:competence_id/:form{form}?', async (c) => {
		const { competence_id, form } = c.req.param();
		const sql = `SELECT * FROM acm_indicators WHERE competence_id=?`;
		const rs = await c.env.DB.prepare(sql).bind(competence_id).all();
		const items = rs.results as Indicator[];

		if (form) {
			return c.html(<IndicatorsForm parent="competence" parent_id={competence_id} items={items} />);
		}

		// const formUrl = `/htmx/indicators-form/${competence_id}`;
		const formUrl = `/htmx/indicators/${competence_id}/form`;
		return c.html(<GroupedIndicators formUrl={formUrl} items={items} />);
	})
	.post(async (c) => {
		const { competence_id } = c.req.param();
		const { name } = await c.req.parseBody();
		const value = (name as string).trim();

		if (value.length < 6) {
			c.status(400);
			return c.body(null);
		}

		const id = ulid();
		const sql = `INSERT INTO acm_indicators (id,competence_id,name) VALUES (?,?,?)`;
		const rs = await c.env.DB.prepare(sql).bind(id, competence_id, value).run();
		if (!rs.success) {
			c.status(500);
			return c.body(null);
		}

		const item: Indicator = {
			id,
			competence_id,
			name: value,
		};
		return c.html(<IndicatorsFormItem parent="competence" item={item} />);
	});

htmx.delete('/indicators/:id', async (c) => {
	const { id } = c.req.param();
	const sql = 'DELETE FROM acm_indicators WHERE id=?';
	const rs = await c.env.DB.prepare(sql).bind(id).run();
	if (!rs.success) {
		c.status(500);
		return c.body(null);
	}
	return c.body(null);
});

// Level indicators

htmx
	.get('/level-indicators/:level_id/:form{form}?', async (c) => {
		const { level_id, form } = c.req.param();
		const sql = `SELECT * FROM acm_level_indicators WHERE level_id=?`;
		const rs = await c.env.DB.prepare(sql).bind(level_id).all();
		const items = rs.results as LevelIndicator[];

		if (form) {
			return c.html(<IndicatorsForm parent="level" parent_id={level_id} items={items} />);
		}

		// const formUrl = `/htmx/level-indicators-form/${level_id}`;
		const formUrl = `/htmx/level-indicators/${level_id}/form`;
		return c.html(<GroupedIndicators formUrl={formUrl} items={items} />);
	})
	.post(async (c) => {
		const { level_id } = c.req.param();
		const { name } = await c.req.parseBody();
		const value = (name as string).trim();

		if (value.length < 6) {
			c.status(400);
			return c.body(null);
		}

		const id = ulid();
		const sql = `INSERT INTO acm_level_indicators (id,level_id,name) VALUES (?,?,?)`;
		const rs = await c.env.DB.prepare(sql).bind(id, level_id, name).run();
		if (!rs.success) {
			c.status(500);
			return c.body(null);
		}

		const item: LevelIndicator = {
			id,
			level_id,
			name: name as string,
		};
		return c.html(<IndicatorsFormItem parent="level" item={item} />);
	});

htmx.delete('/level-indicators/:id', async (c) => {
	const { id } = c.req.param();
	const sql = 'DELETE FROM acm_level_indicators WHERE id=?';
	const rs = await c.env.DB.prepare(sql).bind(id).run();
	if (!rs.success) {
		c.status(500);
		return c.body(null);
	}
	return c.body(null);
});

// Aspect elements

htmx
	.get('/aspect-elements/:aspect_id/:form{form}?', async (c) => {
		const { aspect_id, form } = c.req.param();
		const sql = `SELECT * FROM acm_aspect_elements WHERE aspect_id=?`;
		const rs = await c.env.DB.prepare(sql).bind(aspect_id).all();
		const items = rs.results as AspectElement[];

		if (form) {
			return c.html(<AspectElementsForm aspect_id={aspect_id} items={items} />);
		}
		const formUrl = `/htmx/aspect-elements/${aspect_id}/form`;
		return c.html(<GroupedElements formUrl={formUrl} items={items} />);
	})
	.post(async (c) => {
		const { aspect_id } = c.req.param();
		const { element_id } = await c.req.parseBody();
		const sql0 = `SELECT * FROM acm_elements WHERE type IS NOT 'generic' AND id=?`;
		const elm: any = await c.env.DB.prepare(sql0).bind(element_id).first();
		console.log('ELM', elm);
		if (!elm) return htmxNotFound(c);

		const id = ulid();
		const sql1 = `INSERT INTO acm_aspect_elements (id,aspect_id,element_id,name,tool) VALUES (?,?,?,?,?)`;
		const rs = await c.env.DB.prepare(sql1).bind(id, aspect_id, element_id, elm.name, elm.tool).run();
		const item: AspectElement = {
			id,
			aspect_id,
			element_id: parseInt(element_id as string),
			name: elm.name,
			tool: elm.tool,
		};
		return c.html(<AspectElementFormItem item={item} />);
	});

htmx.delete('/aspect-elements/:id', async (c) => {
	const { id } = c.req.param();
	const sql = 'DELETE FROM acm_aspect_elements WHERE id=?';
	const rs = await c.env.DB.prepare(sql).bind(id).run();
	if (!rs.success) {
		c.status(500);
		return c.body(null);
	}
	c.status(200);
	return c.body(null);
});

htmx.get('/elements-browser/:domain?', async (c) => {
	const { domain } = c.req.param();
	if (!domain || !(DOMAINS as string[]).includes(domain)) return c.html(<DomainElementsBrowser />);

	const sql = `SELECT * FROM acm_elements WHERE type is not 'generic' AND domain=?`;
	const { results } = await c.env.DB.prepare(sql).bind(domain).all();
	return c.html(<DomainElementsBrowser target="XXX" domain={domain} items={results as ACMElement[]} />);
});

// Add aspect

htmx.get('/add-aspect-button/:competence_id', (c) => {
	const { competence_id } = c.req.param();
	return c.html(<AddAspectButton competence_id={competence_id} />);
});

htmx.get('/add-aspect-form/:competence_id', (c) => {
	const { competence_id } = c.req.param();
	return c.html(<AddAspectForm competence_id={competence_id} />);
});

htmx.post('/aspects/:competence_id', async (c) => {
	const { competence_id } = c.req.param();
	const { name } = await c.req.parseBody();
	const value = (name as string).trim();
	if (value.length < 6) {
		c.status(400);
		return c.body(null);
	}

	const id = ulid();
	const sql = 'INSERT INTO acm_aspects (id, competence_id, name) VALUES (?,?,?)';
	const rs = await c.env.DB.prepare(sql).bind(id, competence_id, value).run();

	if (!rs.success) {
		c.status(500);
		return c.body(null);
	}

	const sql2 = 'SELECT count(*) as count FROM acm_aspects WHERE competence_id=?';
	const rs2 = await c.env.DB.prepare(sql2).bind(competence_id).first();
	// console.log(rs2);
	const aspect: Aspect = {
		id,
		competence_id,
		name: value,
	};

	return c.html(<AspectDescriptor item={aspect} index={(rs2?.count as number) -1} />);
});


export { htmx };
