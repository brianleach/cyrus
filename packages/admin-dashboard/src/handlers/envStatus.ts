/**
 * GET /api/admin/env-status — show which key environment variables are configured
 *
 * Returns a list of known env var names with a boolean `isSet` flag.
 * Values are never exposed.
 */

const KNOWN_ENV_VARS = [
	{ key: "ANTHROPIC_API_KEY", label: "Anthropic API Key", category: "AI" },
	{
		key: "CLAUDE_CODE_OAUTH_TOKEN",
		label: "Claude OAuth Token",
		category: "AI",
	},
	{ key: "LINEAR_CLIENT_ID", label: "Linear Client ID", category: "Linear" },
	{
		key: "LINEAR_CLIENT_SECRET",
		label: "Linear Client Secret",
		category: "Linear",
	},
	{
		key: "LINEAR_WEBHOOK_SECRET",
		label: "Linear Webhook Secret",
		category: "Linear",
	},
	{
		key: "LINEAR_DIRECT_WEBHOOKS",
		label: "Linear Direct Webhooks",
		category: "Linear",
	},
	{ key: "GH_TOKEN", label: "GitHub Token", category: "GitHub" },
	{ key: "CYRUS_BASE_URL", label: "Base URL", category: "Server" },
	{ key: "CYRUS_SERVER_PORT", label: "Server Port", category: "Server" },
	{ key: "CYRUS_ADMIN_TOKEN", label: "Admin Token", category: "Server" },
	{
		key: "CYRUS_HOST_EXTERNAL",
		label: "External Host Mode",
		category: "Server",
	},
	{ key: "CLOUDFLARE_TOKEN", label: "Cloudflare Token", category: "Network" },
	{ key: "CYRUS_LOG_LEVEL", label: "Log Level", category: "Debug" },
	{
		key: "CYRUS_WEBHOOK_DEBUG",
		label: "Webhook Debug Mode",
		category: "Debug",
	},
	{ key: "NODE_ENV", label: "Node Environment", category: "Server" },
];

export function handleGetEnvStatus() {
	return async () => {
		const variables = KNOWN_ENV_VARS.map((v) => ({
			key: v.key,
			label: v.label,
			category: v.category,
			isSet: !!process.env[v.key],
			// Show non-secret values directly
			value: [
				"LINEAR_DIRECT_WEBHOOKS",
				"CYRUS_BASE_URL",
				"CYRUS_SERVER_PORT",
				"CYRUS_HOST_EXTERNAL",
				"CYRUS_LOG_LEVEL",
				"CYRUS_WEBHOOK_DEBUG",
				"NODE_ENV",
			].includes(v.key)
				? process.env[v.key] || undefined
				: undefined,
		}));

		return {
			success: true,
			data: { variables },
		};
	};
}
