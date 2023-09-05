type Env = {
	DB: D1Database;
};
type ACMDomain =
	| 'EMO'
	| 'SELF'
	| 'COG'
	| 'CREA'
	| 'STRAT'
	| 'NORM'
	| 'COM'
	| 'SOC'
	| 'LEAD'
	| 'TASK'
	| 'DEV'
	| 'CUST'
	| 'CHG'
	| 'PRO';
type ElementType =
	| 'generic'
	| 'specific'
	| 'gpq'
	| 'g-mate'
	| 'g-gate';

type ACMElement = {
	id: number,
	domain: string,
	type: string,
	tool: string,
	name: string,
	definition?: string,
	created?: string,
	updated?: string,
}
type Evidence = {
	id: number;
	element_id: number;
	name: string;
	definition?: string;
	description?: string;
	created?: string;
	updated?: string;
}
type Book = {
	id: string;
	title: string;
	type: string;
	levels: number;
	created?: string;
	updated?: string;
}
type Competence = {
	id: string;
	book_id: string;
	name: string;
	definition?: string;
	created?: string;
	updated?: string;
}
type Aspect = {
	id: string;
	competence_id: string;
	name: string;
	definition?: string;
	created?: string;
	updated?: string;
}
type Level = {
	id: string;
	competence_id: string;
	level: number;
	name: string;
	definition?: string;
	created?: string;
	updated?: string;
}
type Indicator = {
	id: string;
	competence_id: string;
	name: string;
	created?: string;
	updated?: string;
}
type LevelIndicator = {
	id: string;
	level_id: string;
	name: string;
	created?: string;
	updated?: string;
}
type AspectElement = {
	id: string;
	aspect_id: string;
	element_id: number;
	name: string;
	tool: string;
	created?: string;
	updated?: string;
}
//
type SimpleItem = {
	id: string | number;
	name: string;
	definition?: string;
	description?: string;
}
type EvidencesGroup = {
	element_id: number;
	element: string;
	items: SimpleItem[];
}
