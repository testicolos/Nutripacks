# QHost migration plan

1. Keep all runtime configuration in environment variables.
2. Keep uploaded assets in a replaceable storage adapter, not Vercel-local filesystem.
3. Keep database schema portable and maintain SQL migrations in `/db`.
4. Keep payment code behind a QIIB payment service adapter.
5. Keep email behind SMTP configuration so QHost mail can replace development mail without UI changes.
6. Before cutover, export PostgreSQL data, provision the QHost database, import it, switch environment variables, test card callbacks and SMTP, then move DNS.

If the selected QHost plan does not support Node.js, the frontend can remain static while the API layer is ported to PHP/Laravel without changing the customer/admin workflows.
