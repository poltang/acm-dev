import { html } from "hono/html";
import { ulidFactory } from "ulid-workers";
import { DOMAINS, InterviewGroupedEvidences } from "./constants";

const ulid = ulidFactory();

export const ACMHome = ({ books }: { books: Book[] }) => (
	<div id="main">
		<h2 class="text-2xl font-bold mb-5">ACM Repositories</h2>
		<button
			class="block w-full bg-orange-500 text-center text-white font-medium p-2 mb-4"
			hx-get="/htmx/book-form"
			hx-target="#main"
			hx-swap="outerHTML"
		>
			New Repository
		</button>
		<div id="books">
			<Books items={books} />
		</div>
	</div>
);

export const Books = ({ items }: { items: Book[] }) => (
	<section class="mb-4">
		{items.map((book) => (
			<div class="">
				<a class="text-lg text-blue-500 hover:underline" href={`/acm/${book.id}`}>
					{book.title} ({book.type})
				</a>
			</div>
		))}
	</section>
);

export const BookForm = ({ title, error }: { title?: string; error?: string }) => (
	<form class="flex flex-col gap-3 border border-gray-400 p-4" hx-post="/htmx/books" hx-target="this" hx-swap="outerHTML">
		<div>
			<label class="text-sm uppercase tracking-wider">Title</label>
			<input type="text" name="title" autofocus value={title} class="w-full" placeholder="Minimal 10 karakter" />
		</div>
		<div>
			<label class="text-sm uppercase tracking-wider">Type</label>
			<select name="type" class="w-full" hx-get="/htmx/book-level" hx-target="#book-levels" hx-swap="innerHTML">
				<option value="listing">Listing</option>
				<option value="grading">Grading</option>
			</select>
		</div>
		<div>
			<label class="text-sm uppercase tracking-wider">Levels</label>
			<select id="book-levels" name="level" class="w-full">
				<option value="0">0</option>
			</select>
		</div>
		<div class="flex gap-3 pt-3">
			<button type="submit" class="flex-grow text-white font-medium bg-orange-500 p-2">
				Submit
			</button>
			<button class="border border-gray-400 text-center font-medium px-6 py-2" hx-get="/htmx/books" hx-target="#main" hx-swap="outerHTML">
				Cancel
			</button>
		</div>
		<p id="error" class="text-sm text-orange-600">
			{error}
		</p>
	</form>
);

export const BookCover = ({ book }: { book: Book }) => (
	<div class="pb-3 mb-4 border-b-2">
		<h1 class="text-2xl font-bold mb-3">Buku Kompetensi</h1>
		<p class="mb-1">Title: {book.title}</p>
		<p class="mb-1">
			Type:{` `}
			<span>{book.type.toUpperCase()}</span>
			{book.type == 'grading' && <span class=""> - {book.levels} Levels</span>}
		</p>
	</div>
);

export const CompetenceList = ({ items }: { items: Competence[] }) => (
	<div>
		<h2 class="text-lg font-bold mt-5 mb-3">Daftar Kompetensi</h2>
		<div id="new-competences" class="flex flex-col gap-1 mb-1">
			{items.map((item) => (
				<a href={`/acm/c/${item.id}`} class="bg-gray-100 hover:bg-gray-200 px-3 py-[7px]">
					{item.name}
				</a>
			))}
		</div>
	</div>
);

export const AddCompetenceButton = ({ book_id }: { book_id: string }) => (
	<form class="rounded-lg bg-slate-800 text-center h-16 my-4" hx-get={`/htmx/add-competence-form/${book_id}`} hx-target="this" hx-swap="outerHTML">
		<button class="w-full h-full text--lg text-white font-semibold">Add New Competence</button>
	</form>
);

export const AddCompetenceForm = ({ book_id, type, level }: { book_id: string; type: string; level: number }) => {
	const idi = 'INPUT' + new Date().getTime();
	const idb = 'BUTTON' + new Date().getTime();
	return (
		<form
			id="AddCompetenceForm"
			class="flex gap-2 rounded-lg bg-slate-100 border border-slate-800 p-3 my-4"
			hx-post={`/htmx/competences`}
			hx-target="#new-competences"
			hx-swap="beforeend"
			_="on htmx:afterRequest reset() me"
		>
			<input type="hidden" name="book_id" value={book_id} />
			<input type="hidden" name="level" value={level} />
			<input type="hidden" name="type" value={type} />
			<input id={idi} type="text" name="name" autofocus placeholder="Min. 6 karakter" class="flex-grow py-[7px]" />
			<button class="bg-slate-600 text-white px-8">Add</button>
			<button
				id={idb}
				class="bg-slate-50 border border-slate-600 px-4"
				hx-get={`/htmx/add-competence-button/${book_id}`}
				hx-target="closest form"
				hx-swap="outerHTML"
			>
				Cancel
			</button>
			{html`
				<script>
					document.getElementById('${idi}').addEventListener('keydown', (event) => {
						if (event.key == 'Escape') {
							document.getElementById('${idb}').click();
						}
					});
				</script>
			`}
		</form>
	);
}

// ===============

export const Frame = ({ children }: { children: any }) => <div class="border border-gray-300 overflow-hidden my-4">{children}</div>;

export const FrameHeader = ({ title }: { title: string }) => <div class="bg-gray-100 font-semibold px-3 py-2">{title}</div>;

export const FrameInner = ({ id, children }: { id?: string; children: any }) => (
	<section id={id} class="border-t border-gray-300 overflow-hidden">
		{children}
	</section>
);

export const Label = ({ label, url }: { label: string; url: string} ) => (
	<label
		class="w-[100px] shrink-0 text-xs text-slate-400 hover:text-orange-500 uppercase font-bold py-[8px] cursor-pointer"
		hx-get={url}
		hx-target="closest section"
		hx-swap="outerHTML"
	>
		{label}
	</label>
);

export const FormLabel = ({ id, label, url }: { id: string; label: string; url: string }) => (
	<label
		id={id}
		class="w-[100px] shrink-0 text-xs text-green-500 uppercase font-bold py-[8px] cursor-pointer"
		hx-get={url}
		hx-target="closest section"
		hx-swap="outerHTML"
	>
		{label}
	</label>
);

export type SimpleItem = { id: string; name: string; definition: string };
type SimpleItemProps = { item: SimpleItem; label: string; field: string; url: string };

export const NameOrDefinition = ({ item, label, field, url }: SimpleItemProps) => (
	<FrameInner>
		<div class="flex items-start px-3 py-2">
			<Label label={label} url={url} />
			<div class={`flex-grow leading-5 py-[5px] ${label.toLowerCase() == 'name' ? 'font-semibold' : ''}`}>{(item as any)[field]}</div>
		</div>
	</FrameInner>
);

export const NameOrDefinitionForm = ({ item, label, field, url }: SimpleItemProps) => {
	const idf = 'L-' + item.id;
	const idx = 'X-' + item.id;
	return (
		<FrameInner>
			<form class="flex items-start bg-slate-50 px-3 py-2 m-0" hx-put={url} hx-target="closest section" hx-swap="outerHTML">
				<FormLabel id={idf} label={label} url={url} />
				<input id={idx} type="text" name={field} value={(item as any)[field]} autofocus placeholder="Min. 6 karakter" class="flex-grow py-[7px]" />
			</form>
			{html`
				<script>
					document.getElementById('${idx}').focus();
					document.getElementById('${idx}').setSelectionRange(0, 0);
					document.getElementById('${idx}').addEventListener('keydown', (event) => {
						if (event.key == 'Escape') document.getElementById('${idf}').click();
					});
				</script>
			`}
		</FrameInner>
	);
};

export const CompetenceNav = ({ book_id }: { book_id: string }) => (
	<p class="flex flex-row gap-3 text-sm text-gray-300 uppercase tracking-wider mb-2">
		<a href="/acm" class="text-blue-600">
			Home
		</a>
		<span>/</span>
		<a href={`/acm/${book_id}`} class="text-blue-600">
			Buku
		</a>
	</p>
);

export const CompetenceCover = ({ title, type, level }: { title: string; type: string; level: number }) => (
	<div class="pb-3 mb-4 border-b-2">
		<h1 class="text-2xl font-bold mb-3">Spesifikasi Kompetensi</h1>
		<p class="mb-1">Title: {title}</p>
		<p class="mb-1">
			Type:{` `}
			<span>{type.toUpperCase()}</span>
			{type == 'grading' && <span class=""> - {level} Levels</span>}
		</p>
	</div>
);

export const CompetenceDescriptor = ({ item, indicators }: { item: Competence; indicators: Indicator[] }) => {
	const nameUrl = `/htmx/name-definition/competence/name/${item.id}/form`;
	const definitionUrl = `/htmx/name-definition/competence/definition/${item.id}/form`;
	const formUrl = `/htmx/indicators/${item.id}/form`;
	return (
		<Frame>
			<FrameHeader title="Competence Descriptor" />
			<NameOrDefinition item={item as SimpleItem} label="Name" field="name" url={nameUrl} />
			<NameOrDefinition item={item as SimpleItem} label="Definition" field="definition" url={definitionUrl} />
			<GroupedIndicators formUrl={formUrl} items={indicators} />
		</Frame>
	);
}

export const GroupedIndicators = ({ formUrl, items }: { formUrl: string; items: Indicator[] | LevelIndicator[] }) => {
	return (
		<FrameInner>
			<div class="flex items-start px-3 py-2">
				{/* <Label label="Indicators" url={`/htmx/level-indicators-form/${parent_id}`} /> */}
				<Label label="Indicators" url={formUrl} />
				<div class="flex-grow flex flex-col gap-2 leading-5 py-[5px]">
					{items.map((x) => (
						<IndicatorItem item={x} />
					))}
					{items.length == 0 && <p class="text-gray-400">Empty</p>}
				</div>
			</div>
		</FrameInner>
	);
};

export const IndicatorItem = ({ item }: { item: Indicator | LevelIndicator }) => (
	<div class="flex items-start gap-2">
		<span class="block float-left text-green-500">✓</span>
		<div class="flex-grow">{item.name}</div>
	</div>
);

export const IndicatorsForm = ({ parent, parent_id, items }: { parent: string, parent_id: string; items: Indicator[] | LevelIndicator[] }) => {
	const idl = 'L-' + parent_id;
	const idx = 'X-' + parent_id;
	const target = 'IDX-' + parent_id;
	const url = parent == 'competence' ? `/htmx/indicators/${parent_id}` : `/htmx/level-indicators/${parent_id}`;
	return (
		<FrameInner>
			<div class="flex items-start bg-slate-50 px-3 py-2">
				<FormLabel id={idl} label="Indicators" url={url} />
				<div class="flex-grow">
					<div id={target} class="flex flex-col gap-2 leading-5 py-[5px]" style="min-height:30px">
						{items.map((x) => (
							<IndicatorsFormItem parent={parent} item={x} />
						))}
						{items.length == 0 && <p class="text-gray-400">Empty</p>}
					</div>
					<form class="mt-4 mb-0" hx-post={url} hx-target={`#${target}`} hx-swap="beforeend" _="on htmx:afterRequest reset() me">
						<input id={idx} type="text" name="name" autofocus class="w-full" placeholder="Min. 6 karakter" />
					</form>
				</div>
			</div>
			{html`
				<script>
					document.getElementById('${idx}').addEventListener('keydown', (event) => {
						if (event.key == 'Escape') document.getElementById('${idl}').click();
					});
				</script>
			`}
		</FrameInner>
	);
};

export const IndicatorsFormItem = ({ parent, item }: { parent: string; item: Indicator | LevelIndicator }) => {
	const url = parent == 'competence' ? `/htmx/indicators/${item.id}` : `/htmx/level-indicators/${item.id}`;
	return (
		<div id={`IND${item.id}`} class="flex items-start gap-2">
			<span class="text-stone-400">✓</span>
			<div class="flex-grow">
				<input
					disabled
					type="text"
					class="w-full h-[20px] leading-5 bg-transparent border-0 p-0 disabled:text-black truncate"
					value={item.name}
				/>
			</div>
			<form class="m-0" hx-delete={url} hx-target={`#IND${item.id}`} hx-swap="outerHTML">
				<button type="submit" class="bg-slate-400 rounded-sm text-white text-sm px-2">
					DEL
				</button>
			</form>
		</div>
	);
}

export const LevelDescriptor = ({ item }: { item: Level }) => {
	const nameUrl = `/htmx/name-definition/level/name/${item.id}/form`;
	const definitionUrl = `/htmx/name-definition/level/definition/${item.id}/form`;
	return (
		<Frame>
			<FrameHeader title={`Level ${item.level}`} />
			<NameOrDefinition item={item as SimpleItem} label="Name" field="name" url={nameUrl} />
			<NameOrDefinition item={item as SimpleItem} label="Definition" field="definition" url={definitionUrl} />
			<p class="p-4" hx-get={`/htmx/level-indicators/${item.id}`} hx-trigger="load" hx-swap="outerHTML">
				Loading...
			</p>
		</Frame>
	);
}

export const AspectDescriptor = ({ item, index }: { item: Aspect; index: number }) => {
	const nameUrl = `/htmx/name-definition/aspect/name/${item.id}/form`;
	// const definitionUrl = `/htmx/name-definition-form/aspect/definition/${item.id}`;
	return (
		<Frame>
			<FrameHeader title={`Aspect ${index + 1}`} />
			<div>
				<NameOrDefinition item={item as SimpleItem} label="Name" field="name" url={nameUrl} />
				{/* <NameOrDefinition item={item as SimpleItem} label="Definition" field="definition" url={definitionUrl} /> */}
				<p class="p-4" hx-get={`/htmx/aspect-elements/${item.id}`} hx-trigger="load" hx-swap="outerHTML">
					Loading...
				</p>
			</div>
		</Frame>
	);
};

export const GroupedElements = ({ formUrl, items }: { formUrl: string; items: AspectElement[] }) => {
	return (
		<FrameInner>
			<div class="flex items-start px-3 py-2">
				{/* <Label label="Indicators" url={`/htmx/level-indicators-form/${parent_id}`} /> */}
				<Label label="Elements" url={formUrl} />
				<div class="flex-grow flex flex-col gap-2 leading-5 py-[5px]">
					{items.map((x) => (
						<AspectElementItem item={x} />
					))}
					{items.length == 0 && <p class="text-gray-400">No element found</p>}
				</div>
			</div>
		</FrameInner>
	);
};

export const AspectElementItem = ({ item }: { item: AspectElement }) => (
	<div class="flex items-start gap-2">
		{/* <div class="block float-left text-green-500">✓</div> */}
		<div class="w-8 rounded-sm bg-slate-200 text-xs text-center text-gray-500 py-[2px]">{item.element_id}</div>
		<div class="flex-grow">{item.name}</div>
		<div class="text-xs text-orange-500 font-semibold">{item.tool.toUpperCase()}</div>
	</div>
);

export const AspectElementsForm = ({ aspect_id, items }: { aspect_id: string; items: AspectElement[] }) => {
	const idl = 'XLAB-' + aspect_id;
	const idx = 'XIPT-' + aspect_id;
	const target = 'XIDX-' + aspect_id;
	const url = `/htmx/aspect-elements/${aspect_id}`;
	return (
		<FrameInner>
			<div class="flex items-start bg-slate-50 px-3 py-2">
				<FormLabel id={idl} label="Elements" url={url} />
				<div class="flex-grow">
					<div id={target} class="flex flex-col gap-2 leading-5 py-[5px]" style="min-height:30px">
						{items.map((x) => (
							<AspectElementFormItem item={x} />
						))}
						{items.length == 0 && <p class="text-gray-400">No element found</p>}
					</div>
					<form class="mt-4 mb-0" hx-post={url} hx-target={`#${target}`} hx-swap="beforeend" _="on htmx:afterRequest reset() me">
						<input id={idx} type="number" name="element_id" min="2" max="159" autofocus class="w-full py-[7px]" />
					</form>
				</div>
			</div>
			<div class="flex bg-slate-50 px-3 pb-2">
				<div class="w-[100px] shrink-0"></div>
				<div class="flex-grow">
					<DomainElementsBrowser />
				</div>
			</div>
			{html`
				<script>
					document.getElementById('${idx}').addEventListener('keydown', (event) => {
						if (event.key == 'Escape') document.getElementById('${idl}').click();
					});
					function startListener() {
						document.querySelectorAll('.select-element').forEach((b) => {
							b.addEventListener('click', (e) => {
								document.getElementById('${idx}').value = b.value;
								document.getElementById('${idx}').focus();
							});
						});
					}
				</script>
			`}
		</FrameInner>
	);
};

export const DomainElementsBrowser = ({ domain, items, target }: { domain?: string; items?: ACMElement[]; target?: string }) => {
	const id = 'DOM' + ulid();
	return (
		<section id={id}>
			<DomainButtons selected={domain} />
			{items && items.length > 0 && (
				<>
					<div id={target} class="h-[200px] flex flex-col gap-1 overflow-y-scroll mt-2">
						{items.map((item) => (
							<button
								value={item.id}
								class="select-element flex items-center gap-2 rounded-sm border border-slate-300 hover:bg-slate-100 text-sm px-2 py-1"
							>
								<div class="w-[30px] text-slate-400">{item.id}</div>
								<div class="flex-grow text-left font-medium">{item.name}</div>
								<div class="text-xs text-slate-400 uppercase font-medium">{item.tool}</div>
							</button>
						))}
					</div>
					{html`
						<script>
							startListener();
						</script>
					`}
				</>
			)}
		</section>
	);
}

const DomainButtons = ({ selected }: { selected?: string }) => {
	return (
		<div class="text-xs font-semibold">
			{DOMAINS.map((d) => (
				<button
					class={`rounded-sm ${selected == d ? 'bg-slate-500 text-white' : 'border border-slate-300'} w-[58px] h-[20px] mb-1 mr-1`}
					hxx={selected}
					hx-get={selected == d ? '/htmx/elements-browser' : `/htmx/elements-browser/${d}`}
					hx-target="closest section"
					hx-swap="outerHTML"
				>
					{d}
				</button>
			))}
			{/* <button class="bg-slate-600 rounded-sm text-white px-2 h-[20px] mb-1 mr-1">HIDE ALL</button> */}
		</div>
	);
}

export const AspectElementFormItem = ({ item }: { item: AspectElement }) => (
	<div id={`ELM${item.id}`} class="flex items-start gap-2">
		{/* <span class="text-stone-400">✓</span> */}
		<div class="w-8 rounded-sm bg-slate-200 text-xs text-center text-gray-500 py-[2px]">{item.element_id}</div>
		<div class="flex-grow">
			<input disabled type="text" value={item.name} class="w-full h-[20px] bg-transparent border-0 p-0 disabled:text-black truncate" />
		</div>
		<div class="text-xs text-orange-500 font-semibold">{item.tool.toUpperCase()}</div>
		<form class="m-0" hx-delete={`/htmx/aspect-elements/${item.id}`} hx-target={`#ELM${item.id}`} hx-swap="outerHTML">
			<button class="h-[20px] bg-slate-400 rounded-sm text-white text-xs px-2">DEL</button>
		</form>
	</div>
);

export const AddAspectButton = ({ competence_id }: { competence_id: string }) => (
	<form
		class="rounded-lg bg-slate-800 text-center h-16 my-4"
		hx-get={`/htmx/add-aspect-form/${competence_id}`}
		hx-target="this"
		hx-swap="outerHTML"
	>
		<button class="w-full h-full text--lg text-white font-semibold">Add New Aspect</button>
	</form>
);

export const AddAspectForm = ({ competence_id }: { competence_id: string }) => {
	const idi = 'INPUT' + competence_id;
	const idb = 'BUTTON' + competence_id;
	return (
		<form
			class="flex gap-2 rounded-lg bg-slate-100 border border-slate-800 p-3 my-4"
			hx-post={`/htmx/aspects/${competence_id}`}
			hx-target="#aspects"
			hx-swap="beforeend"
			_="on htmx:afterRequest reset() me"
		>
			<input id={idi} type="text" name="name" autofocus placeholder="Min. 6 karakter" class="flex-grow py-[7px]" />
			<button type="submit" class="bg-slate-600 text-white px-8">Add</button>
			<button
				id={idb}
				type="button"
				class="bg-slate-50 border border-slate-600 px-4"
				hx-get={`/htmx/add-aspect-button/${competence_id}`}
				hx-target="closest form"
				hx-swap="outerHTML"
			>
				Cancel
			</button>
			{html`
				<script>
					document.getElementById('${idi}').addEventListener('keydown', (event) => {
						if (event.key == 'Escape') {
							document.getElementById('${idb}').click();
						}
					});
				</script>
			`}
		</form>
	);
};

// Batch interview

// ["C48","C49","C54","C55","C57","C59","C60","C61","C62","C65","C66","C76","C78","C80"]
// [48,49,54,55,57,59,60,61,62,65,66,76,78,80]

export const GroupedEvidencesEditor = ({ group }: { group: EvidencesGroup }) => (
	<>
		<tbody class="group-header">
			<tr class="border-b border-lime-500 cursor-pointer">
				<td colspan="3" class="bg-lime-400 font-semibold px-2 py-1">
					{group.element}
				</td>
			</tr>
		</tbody>
		<tbody class="hidden">
			{group.items.map((item) => (
				<tr class="text-sm">
					<td>{item.id}</td>
					<td class="py-1">
						<label for={`C${item.id}`} class="block hover:text-lime-700 cursor-pointer">
							{item.name}
						</label>
					</td>
					<td>
						<input id={`C${item.id}`} name={`C${item.id}`} type="checkbox" value="0" />
					</td>
				</tr>
			))}
		</tbody>
	</>
);

export const GroupedEvidencesView = ({ group }: { group: EvidencesGroup }) => (
	<tbody>
		<tr>
			<td colspan="3" class="bg-lime-400 font-semibold px-2 py-1">
				{group.element}
			</td>
		</tr>
		{group.items.map((item) => (
			<tr class="text-sm">
				{/* <td class="px-2">{item.id}</td> */}
				<td class="px-2 py-1">
					<label class="block hover:text-lime-700">{item.name}</label>
				</td>
				<td class="flex gap-1 py-1">
					{/* <input id={`C${item.id}`} name={`C${item.id}`} type="checkbox" value="0" /> */}
					{/* <input type="number" name={`C${item.id}`} min="1" max="3" value="0" class="p-1" /> */}
					<input type="radio" name={`C${item.id}`} value="1" class="border-gray-300 hover:border-gray-500" />
					<input type="radio" name={`C${item.id}`} value="2" class="border-gray-300 hover:border-gray-500" />
					<input type="radio" name={`C${item.id}`} value="3" class="border-gray-300 hover:border-gray-500" />
				</td>
				<td class="text-black text-slate-300 font-semibold px-2" id={`C${item.id}`}>
					0
				</td>
			</tr>
		))}
	</tbody>
);

