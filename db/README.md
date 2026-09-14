# Nutripacks database

The current development database is PostgreSQL on Supabase. Application tables use the `np_` prefix so Nutripacks remains isolated from unrelated projects in the same development database.

The production migration target is standard PostgreSQL/MySQL-compatible application logic on QHost. No business rule should depend on Vercel-specific storage.

Current domain areas:
- packages and package rules
- menu items and package eligibility
- customers and sessions
- orders and meal selections
- admin users and sessions
- email templates and settings

A clean export migration will be added before the QHost move.
