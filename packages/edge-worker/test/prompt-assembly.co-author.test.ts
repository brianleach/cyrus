/**
 * Prompt Assembly Tests - Co-Author Template Substitution
 *
 * Tests that requestor information is correctly substituted into subroutine prompts
 * for co-authoring commits.
 */

import { describe, expect, it } from "vitest";
import { createTestWorker, scenario } from "./prompt-assembly-utils.js";

describe("Prompt Assembly - Co-Author Template Substitution", () => {
	it("should include co-author section when requestor has name and email", async () => {
		const worker = createTestWorker([], "ceedar");

		// Session with git-commit subroutine and requestor info
		const session = {
			issueId: "coauthor-test-1234-5678-9012-345678901234",
			workspace: { path: "/test" },
			metadata: {
				requestor: {
					name: "Alice Developer",
					email: "alice@example.com",
				},
				procedure: {
					procedureName: "full-development",
					currentSubroutineIndex: 3, // git-commit subroutine (0:coding, 1:verifications, 2:changelog, 3:git-commit)
				},
			},
		};

		const issue = {
			id: "coauthor-test-1234-5678-9012-345678901234",
			identifier: "CEE-8000",
			title: "Add feature X",
			description: "Implement feature X",
			url: "https://linear.app/ceedar/issue/CEE-8000",
		};

		const repository = {
			id: "repo-uuid-coauthor-test-1234",
			path: "/test/repo",
		};

		const result = await scenario(worker)
			.newSession()
			.assignmentBased()
			.withSession(session)
			.withIssue(issue)
			.withRepository(repository)
			.withUserComment("")
			.withLabels()
			.build();

		// Verify the co-author section is included
		expect(result.userPrompt).toContain("## Co-Authoring");
		expect(result.userPrompt).toContain(
			"Co-Authored-By: Alice Developer <alice@example.com>",
		);
		expect(result.userPrompt).toContain("Include the co-author trailer");
	});

	it("should NOT include co-author section when requestor is missing", async () => {
		const worker = createTestWorker([], "ceedar");

		// Session with git-commit subroutine but NO requestor info
		const session = {
			issueId: "coauthor-test-2222-3333-4444-555566667777",
			workspace: { path: "/test" },
			metadata: {
				procedure: {
					procedureName: "full-development",
					currentSubroutineIndex: 3, // git-commit subroutine (0:coding, 1:verifications, 2:changelog, 3:git-commit)
				},
			},
		};

		const issue = {
			id: "coauthor-test-2222-3333-4444-555566667777",
			identifier: "CEE-8001",
			title: "Add feature Y",
			description: "Implement feature Y",
			url: "https://linear.app/ceedar/issue/CEE-8001",
		};

		const repository = {
			id: "repo-uuid-coauthor-test-5678",
			path: "/test/repo",
		};

		const result = await scenario(worker)
			.newSession()
			.assignmentBased()
			.withSession(session)
			.withIssue(issue)
			.withRepository(repository)
			.withUserComment("")
			.withLabels()
			.build();

		// Verify the co-author section is NOT included
		expect(result.userPrompt).not.toContain("## Co-Authoring");
		expect(result.userPrompt).not.toContain("Co-Authored-By:");
		// But verify the git-commit subroutine is still loaded
		expect(result.userPrompt).toContain("Git Commit");
	});

	it("should NOT include co-author section when requestor has only name (no email)", async () => {
		const worker = createTestWorker([], "ceedar");

		// Session with requestor that has only name
		const session = {
			issueId: "coauthor-test-3333-4444-5555-666677778888",
			workspace: { path: "/test" },
			metadata: {
				requestor: {
					name: "Bob Developer",
					// email is missing
				},
				procedure: {
					procedureName: "full-development",
					currentSubroutineIndex: 3, // git-commit subroutine (0:coding, 1:verifications, 2:changelog, 3:git-commit)
				},
			},
		};

		const issue = {
			id: "coauthor-test-3333-4444-5555-666677778888",
			identifier: "CEE-8002",
			title: "Add feature Z",
			description: "Implement feature Z",
			url: "https://linear.app/ceedar/issue/CEE-8002",
		};

		const repository = {
			id: "repo-uuid-coauthor-test-9012",
			path: "/test/repo",
		};

		const result = await scenario(worker)
			.newSession()
			.assignmentBased()
			.withSession(session)
			.withIssue(issue)
			.withRepository(repository)
			.withUserComment("")
			.withLabels()
			.build();

		// Verify the co-author section is NOT included (need both name AND email)
		expect(result.userPrompt).not.toContain("## Co-Authoring");
		expect(result.userPrompt).not.toContain("Co-Authored-By:");
	});

	it("should NOT include co-author section when requestor has only email (no name)", async () => {
		const worker = createTestWorker([], "ceedar");

		// Session with requestor that has only email
		const session = {
			issueId: "coauthor-test-4444-5555-6666-777788889999",
			workspace: { path: "/test" },
			metadata: {
				requestor: {
					// name is missing
					email: "charlie@example.com",
				},
				procedure: {
					procedureName: "full-development",
					currentSubroutineIndex: 3, // git-commit subroutine (0:coding, 1:verifications, 2:changelog, 3:git-commit)
				},
			},
		};

		const issue = {
			id: "coauthor-test-4444-5555-6666-777788889999",
			identifier: "CEE-8003",
			title: "Add feature W",
			description: "Implement feature W",
			url: "https://linear.app/ceedar/issue/CEE-8003",
		};

		const repository = {
			id: "repo-uuid-coauthor-test-3456",
			path: "/test/repo",
		};

		const result = await scenario(worker)
			.newSession()
			.assignmentBased()
			.withSession(session)
			.withIssue(issue)
			.withRepository(repository)
			.withUserComment("")
			.withLabels()
			.build();

		// Verify the co-author section is NOT included (need both name AND email)
		expect(result.userPrompt).not.toContain("## Co-Authoring");
		expect(result.userPrompt).not.toContain("Co-Authored-By:");
	});
});
