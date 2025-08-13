# NaN0Web Mail

`@nan0web/mail` is a module for sending emails using Nodemailer. It provides a convenient API for Node.js projects and works with the **nano-format** for templating.

## Overview

The package lets you create, format, and send emails with attachments. Recipients can be specified via the `to`, `cc`, and `bcc` fields. HTML templates can contain placeholders that are replaced with runtime data before sending.

## Installation

```bash
npm install @nan0web/mail
```

## Usage

### Creating an email

```js
import { Address, Attachment, Email, Target, MailDB } from '@nan0web/mail'

// Define recipients
const target = Target.from({
  to: 'ivan@example.com',
  cc: 'petr@example.com',
  bcc: 'admin@example.com'
})

// Build the email
const email = new Email({
  subject: 'Your invoice',
  html: '<h1>Thank you for your purchase!</h1>',
  from: 'Shop <info@shop.com>',
  target
})

// Add an attachment
const attachment = new Attachment({
  filename: 'invoice.pdf',
  path: '/path/to/invoice.pdf'
})

email.attach(attachment)
```

### Sending the email

```js
import { mail, createMailer } from '@nan0web/mail'

// Nodemailer transport configuration
const transportConfig = {
  host: 'smtp.example.com',
  port: 587,
  secure: false, // true for port 465
  auth: {
    user: 'username',
    pass: 'password'
  }
}

// Data for placeholder replacement
const data = {
  name: 'Ivan',
  purchase: 'product 123'
}

// Send
mail(email, data, { mailer: createMailer(transportConfig) })
  .then(info => console.log('Mail sent:', info))
  .catch(err => console.error('Sending failed:', err))
```

## API Documentation

### `Address`

Represents an email address (optionally with a display name).

| Constructor | `new Address({ address, name? })` |
|------------|-----------------------------------|
| Properties | `address` – string, `name` – string, `type` – derived (`email`, `url`, `phone`, `tel`, or `address`) |
| Methods |
| `toString()` | Returns `"Name <address>"` or `"<address>"` |
| `toObject([fields])` | Returns an object with the selected fields or all fields (`address`, `name`, `type`) |
| `static from(source)` | Creates an `Address` from a string like `"John <john@example.com>"`, an object, or returns the source if it is already an instance |

### `Attachment`

Represents a file attached to an email.

| Constructor | `new Attachment({ filename, content?, path?, href?, ... })` |
|------------|------------------------------------------------------------|
| Properties | `filename`, `content`, `path`, `href`, `httpHeaders`, `contentType`, `contentDisposition`, `cid`, `encoding`, `headers`, `raw` |
| Methods |
| `formatForNodemailer(replacements?, replacer?)` | Returns an object ready for Nodemailer, applying placeholder replacement if needed |
| `static from(source)` | Returns an `Attachment` instance (creates one if a plain object is supplied) |

### `Email`

The core email object.

| Constructor | `new Email({ subject, html, fields, from, to, target, style, dir, attachments })` |
|------------|-----------------------------------------------------------------------------------|
| Properties | `subject`, `html`, `fields`, `from` (`Address`), `target` (`Target`), `style`, `dir`, `attachments` (array of `Attachment`) |
| Methods |
| `attach(attachment)` | Adds a single `Attachment` or an array of them |
| `formatForNodemailer(replacements?, replacer?)` | Produces the object expected by Nodemailer, with placeholder replacement |
| `static from(source)` | Returns an existing `Email` or creates a new one from a plain object |

### `Target`

Handles the email recipients.

| Constructor | `new Target()` |
|------------|-----------------|
| Methods |
| `add(address, type = 'to')` | Adds a single address or an array to the specified field (`to`, `cc`, `bcc`) |
| `addObject(item)` | Adds addresses from an object, another `Target`, or a single address |
| `formatForNodemailer()` | Returns `{ to, cc, bcc }` formatted for Nodemailer |
| `static from(source)` | Creates a `Target` from a string, array, or object containing address information |

### `MailDB`

A file‑system based DB (extends `@nan0web/db-fs`). It provides:

* `transform(source, config, opts)` – flexible data transformation based on a configuration object.
* `findNestedElement(key, obj)` – utility to get nested values using dot notation.
* Standard `get`, `loadDocument`, and `resolve` methods inherited from the base DB class.

### `Message`

A lightweight wrapper around `Address` and `Attachment` for generic messages (used by `@nan0web/co`). It offers the same `attach` logic as `Email`.

### Helpers

* `replace(template, data, escaper?)` – Replaces `{{key}}` placeholders in strings.
* `createMailer(transportConfig)` – Creates a Nodemailer transport (implementation lives in the package entry point).
* `mail(email, data, opts)` – Sends an `Email` instance using the provided transport and data for placeholders.

## License

[ISC](./LICENSE)

## Contribution

- [Join and contribute](./CONTRIBUTING.md)
