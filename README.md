# reader-ui

The user interface of [remit reader](https://github.com/remit-mail/reader): the component library, the web client and the Storybook that renders both.

| Package                  | Published | Holds                                                                  |
| ------------------------ | --------- | ---------------------------------------------------------------------- |
| `@remit/ui`              | yes       | Components, design tokens, the rich-text editor and the MCP pages      |
| `@remit/web-client`      | yes       | The app shell, auth shells, runtime config and the vite preset        |
| `@remit/web-client-dist` | yes       | The built web client, ready to serve                                   |
| `@remit/workbench`       | no        | The Storybook over all three                                           |
| `@remit/test-dom`        | no        | Browser globals for the unit-test processes                            |

```bash
npm ci
npm run storybook
```

`AGENTS.md` holds the rules, the scripts and how a change reaches reader.

Hosts composing `mountApp` from `@remit/web-client/shell` can pass
`peopleDestinationUrl?: string` (for example, `https://login.example.com/admin`).
Settings → People then links to that URL, and visiting `/settings/people` redirects
there without mounting or querying self-host People. When omitted, the existing
self-host People panel and its availability check apply.
