import { html } from 'hono/html';

// https://unpkg.com/htmx.org@1.9.3
// https://unpkg.com/hyperscript.org@0.9.9

export default function Layout(props: { children: any }) {
	return html`
		<html>
			<head>
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<script src="/static/htmx.min.js"></script>
				<script src="/static/_hyperscript.min.js"></script>
				<link rel="stylesheet" href="/static/styles.css" />
			</head>
			<body class="antialiased">
				<div class="max-w-2xl p-5">${props.children}</div>
			</body>
		</html>
	`;
}
