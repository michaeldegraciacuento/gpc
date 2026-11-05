# Gitagum Pickleball Club (GPC)

A membership and finance management system for the **Gitagum Pickleball Club** in Gitagum, Misamis Oriental. It includes a public landing page and an admin panel for managing members, dues, transactions, and reports.

## Features

- **Public landing page**: club info, highlights, and location.
- **Member management**: create, edit, and view members with photos, positions, and position history.
- **Public member profiles**: each member has a shareable profile page at `/member/{memberId}`, with QR code scanning support.
- **Payments**: record dues by payment type, with billing cycles and periods, proof-of-payment uploads, receipt numbers, and PDF receipts.
- **Payment types**: configurable fees and billing cycles.
- **Transactions**: track club income and expenses, with receipt images and links to payments and members.
- **Reports**: financial, member, officials, and transaction reports exported as PDF.
- **Dashboard**: summary stats and charts.
- **Activity logs**: audit trail of user actions.
- **Users, roles, and permissions**: role-based access control via Spatie Laravel Permission.
- **Multi-factor authentication**: email OTP on login and on sensitive actions such as deleting users, roles, or permissions.
- **Appearance settings**: light and dark mode.

## Tech Stack

| Layer    | Tools                                                       |
| -------- | ----------------------------------------------------------- |
| Backend  | Laravel 12, PHP 8.2+                                        |
| Frontend | React 19, TypeScript, Inertia.js 2, Tailwind CSS 4, Radix UI |
| Charts   | Recharts                                                    |
| PDF      | barryvdh/laravel-dompdf                                     |
| Auth/ACL | Spatie Laravel Permission, email OTP MFA                    |
| Build    | Vite 7                                                      |

## Requirements

- PHP 8.2 or newer, with Composer
- Node.js 20 or newer, with npm
- SQLite (default) or MySQL

## Installation

```bash
git clone https://github.com/michaeldegraciacuento/gpc.git
cd gpc

composer install
npm install

cp .env.example .env
php artisan key:generate

# The default DB is SQLite; create the file if it doesn't exist
touch database/database.sqlite

php artisan migrate --seed
php artisan storage:link
```

Configure the `MAIL_*` variables in `.env` so OTP codes can be delivered. With `MAIL_MAILER=log`, codes are written to `storage/logs/laravel.log`.

## Running Locally

```bash
composer run dev
```

This starts the Laravel server, queue worker, and Vite dev server together. You can also run them separately:

```bash
php artisan serve
npm run dev
```

## Production Build

```bash
npm run build
php artisan config:cache
php artisan route:cache
```

## Useful Commands

| Command                                 | Description                     |
| --------------------------------------- | ------------------------------- |
| `php artisan test`                      | Run the test suite              |
| `npm run lint`                          | Lint and fix frontend code      |
| `npm run format`                        | Format frontend code            |
| `npm run types`                         | Type-check TypeScript           |
| `php artisan mfa:cleanup-expired-codes` | Remove expired OTP codes        |

## Project Structure

```
app/
  Http/Controllers/   Members, payments, transactions, reports, users, roles, MFA
  Models/             Member, Payment, PaymentType, Transaction, ActivityLog, ...
  Services/           MfaService
resources/
  js/pages/           Inertia React pages
  views/reports/      PDF report and receipt templates
routes/
  web.php             Dashboard, users, roles, permissions
  membership.php      Members, payments, transactions, reports, activity logs
  mfa.php             MFA routes
database/
  migrations/
  seeders/            Roles, permissions, and sample members
```

## License

MIT
