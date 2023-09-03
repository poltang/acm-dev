--
DROP TABLE IF EXISTS acm_elements;
CREATE TABLE acm_elements (
	[id] INTEGER PRIMARY KEY AUTOINCREMENT,
	[domain] TEXT NOT NULL,
	[type] TEXT NOT NULL,
	[tool] TEXT,
	[name] TEXT NOT NULL,
	[definition] TEXT,
	[created] TEXT NOT NULL DEFAULT (datetime('now')||'Z'),
	[updated] TEXT
);

DROP TABLE IF EXISTS acm_evidences;
CREATE TABLE acm_evidences (
	[id] INTEGER PRIMARY KEY AUTOINCREMENT,
	[element_id] INTEGER NOT NULL,
	[name] TEXT NOT NULL,
	[definition] TEXT,
	[description] TEXT,
	[created] TEXT NOT NULL DEFAULT (datetime('now')||'Z'),
	[updated] TEXT
);

--

DROP TABLE IF EXISTS acm_books;
CREATE TABLE acm_books (
	[id] TEXT PRIMARY KEY,
	[title] TEXT NOT NULL,
	[type] TEXT NOT NULL,
	[levels] INTEGER NOT NULL,
	[created] TEXT NOT NULL DEFAULT (datetime('now')||'Z'),
	[updated] TEXT
);

DROP TABLE IF EXISTS acm_competences;
CREATE TABLE acm_competences (
	[id] TEXT PRIMARY KEY,
	[book_id] TEXT NOT NULL,
	[name] TEXT NOT NULL,
	[definition] TEXT,
	[created] TEXT NOT NULL DEFAULT (datetime('now')||'Z'),
	[updated] TEXT
);

DROP TABLE IF EXISTS acm_aspects;
CREATE TABLE acm_aspects (
	[id] TEXT PRIMARY KEY,
	[competence_id] TEXT NOT NULL,
	[name] TEXT NOT NULL,
	[definition] TEXT,
	[created] TEXT NOT NULL DEFAULT (datetime('now')||'Z'),
	[updated] TEXT
);

DROP TABLE IF EXISTS acm_levels;
CREATE TABLE acm_levels (
	[id] TEXT PRIMARY KEY,
	[competence_id] TEXT NOT NULL,
	[level] INTEGER NOT NULL,
	[name] TEXT NOT NULL,
	[definition] TEXT,
	[created] TEXT NOT NULL DEFAULT (datetime('now')||'Z'),
	[updated] TEXT
);

DROP TABLE IF EXISTS acm_indicators;
CREATE TABLE acm_indicators (
	[id] TEXT PRIMARY KEY,
	[competence_id] TEXT NOT NULL,
	[name] TEXT NOT NULL,
	[created] TEXT NOT NULL DEFAULT (datetime('now')||'Z'),
	[updated] TEXT
);

DROP TABLE IF EXISTS acm_level_indicators;
CREATE TABLE acm_level_indicators (
	[id] TEXT PRIMARY KEY,
	[level_id] TEXT NOT NULL,
	[name] TEXT NOT NULL,
	[created] TEXT NOT NULL DEFAULT (datetime('now')||'Z'),
	[updated] TEXT
);

DROP TABLE IF EXISTS acm_aspect_elements;
CREATE TABLE acm_aspect_elements (
	[id] TEXT PRIMARY KEY,
	[aspect_id] TEXT NOT NULL,
	[element_id] INTEGER NOT NULL,
	[name] TEXT NOT NULL,
	[tool] TEXT,
	[created] TEXT NOT NULL DEFAULT (datetime('now')||'Z'),
	UNIQUE (aspect_id, element_id)
);
