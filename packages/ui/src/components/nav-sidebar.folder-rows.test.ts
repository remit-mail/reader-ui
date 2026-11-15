import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { NavMailbox } from "./app-shell-types.js";
import { folderRows } from "./nav-sidebar.js";

const folder = (id: string, fullPath: string): NavMailbox => ({
	id,
	name: fullPath.split("/").at(-1) ?? fullPath,
	fullPath,
	hierarchyDelimiter: "/",
});

const folders: NavMailbox[] = [
	folder("news", "INBOX/Nieuwsbrieven"),
	folder("receipts", "INBOX/Receipts"),
	folder("tech", "INBOX/Nieuwsbrieven/Tech"),
	folder("rust", "INBOX/Nieuwsbrieven/Tech/Rust"),
];

const shape = (rows: ReturnType<typeof folderRows>) =>
	rows.map(({ mailbox, depth, hasChildren }) => [
		mailbox.id,
		depth,
		hasChildren,
	]);

describe("folderRows", () => {
	it("nests each folder under its parent and indents from the shallowest folder", () => {
		assert.deepEqual(shape(folderRows(folders, () => true)), [
			["news", 0, true],
			["tech", 1, true],
			["rust", 2, false],
			["receipts", 0, false],
		]);
	});

	it("hides every descendant of a collapsed folder", () => {
		assert.deepEqual(shape(folderRows(folders, (id) => id !== "news")), [
			["news", 0, true],
			["receipts", 0, false],
		]);
	});

	it("keeps a folder whose parent is absent at the depth of its nearest present ancestor", () => {
		assert.deepEqual(
			shape(
				folderRows(
					[
						folder("news", "INBOX/Nieuwsbrieven"),
						folder("rust", "INBOX/Nieuwsbrieven/Tech/Rust"),
					],
					() => true,
				),
			),
			[
				["news", 0, true],
				["rust", 1, false],
			],
		);
	});
});
