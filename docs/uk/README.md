# @nan0web/mail

Крихітний, безпечний за типами поштовий помічник, побудований на **nodemailer**. Він
надає готові класи для адрес, вкладень,
створення електронних листів і крихітний помічник бази даних.

|Назва пакунка|[Статус](https://github.com/nan0web/monorepo/blob/main/system.md#написання-сценаріїв)|Документація|Покриття тестами|Особливості|Версія Npm|
|---|---|---|---|---|---|
 |[@nan0web/mail](https://github.com/nan0web/mail/) |🟢 `98.0%` |🧪 [Англійською 🏴󠁧󠁢󠁥󠁮󠁧󠁿](https://github.com/nan0web/mail/blob/main/README.md)<br />[Українською 🇺🇦](https://github.com/nan0web/mail/blob/main/docs/uk/README.md) |🟡 `89.4%` |✅ d.ts 📜 system.md 🕹️ playground |— |

## Встановлення

Як встановити з npm?
```bash
npm install @nan0web/mail
```

Як встановити з pnpm?
```bash
pnpm add @nan0web/mail
```

Як встановити з yarn?
```bash
yarn add @nan0web/mail
```

## Використання – Address

Простий об’єкт-значення для електронної пошти, телефону чи будь-якої адреси.

Як створити Address із рядка?
```js
import { Address } from '@nan0web/mail'
const addr = Address.from("John Doe <john@example.com>")
console.info(String(addr))
// John Doe <john@example.com>
```

Як створити Address із об’єкта?
```js
import { Address } from '@nan0web/mail'
const addr = Address.from({ address: "test@example.com", name: "Test User" })
console.info(String(addr))
// Test User <test@example.com>
```

## Використання – Attachment

Створіть вкладення для Nodemailer, плейсхолдери замінюються
функцією `replace`.

Як створити вкладення і відформатувати його для Nodemailer?
```js
import { Attachment } from '@nan0web/mail'
const att = new Attachment({
  filename: "invoice-{{id}}.pdf",
  path: "./invoices/{{id}}.pdf",
  contentDisposition: "inline",
})
const formatted = att.formatForNodemailer({ id: "123" })
console.info(JSON.stringify(formatted))
// {"filename":"invoice-123.pdf","path":"./invoices/123.pdf","contentDisposition":"inline"}
```

## Використання – Створення Email

Створіть об’єкт `Email`, додайте вкладення та відформатуйте
його для Nodemailer.

Як створити Email із плейсхолдерами та вкладеннями?
```js
import { Email, Attachment } from '@nan0web/mail'
const mail = new Email({
  subject: "Invoice {{id}}",
  html: "<p>Dear {{name}}, see attached.</p>",
  from: "Billing <billing@example.com>",
  to: "Customer <customer@example.com>",
  attachments: [
    {
      filename: "invoice-{{id}}.pdf",
      path: "./invoices/{{id}}.pdf",
    },
  ],
})
const formatted = mail.formatForNodemailer({ id: "001", name: "Alice" })
console.info(JSON.stringify(formatted))
// {"from":"Billing <billing@example.com>","to":"Customer <customer@example.com>","cc":"","bcc":"","subject":"Invoice 001","html":"<p>Dear Alice, see attached.</p>","attachments":[{"filename":"invoice-001.pdf","path":"./invoices/001.pdf","contentDisposition":"attachment"}]}
```

## Використання – Target

Обробка кількох отримувачів: `to`, `cc`, `bcc`.

Як створити Target із кількома отримувачами?
```js
import { Target, Address } from '@nan0web/mail'
const target = new Target()
target.add("alice@example.com", "to")
target.add("bob@example.com", "cc")
target.add("carol@example.com", "bcc")
const formatted = target.formatForNodemailer()
console.info(JSON.stringify(formatted))
// {"to":"<alice@example.com>","cc":"<bob@example.com>","bcc":"<carol@example.com>"}
```

Як створити Target із об’єкта?
```js
import { Target } from '@nan0web/mail'
const target = Target.from({
  to: ["alice@example.com", "david@example.com"],
  cc: "bob@example.com",
})
const formatted = target.formatForNodemailer()
console.info(JSON.stringify(formatted))
// {"to":"<alice@example.com>, <david@example.com>","cc":"<bob@example.com>","bcc":""}
```

## Використання – Трансформація MailDB

Перетворіть сировий запис на збагачений об’єкт.

Як трансформувати дані через MailDB?
```js
import { MailDB } from '@nan0web/mail'
const db = new MailDB()
const source = { name: "John Smith", gender: 1, mail: "john@example.com" }
const config = {
  formattedName: [item => item.name.split(" ")[0]],
  genderText: [item => item.gender === 1 ? "male" : "female"],
  email: { $ref: "mail" },
  certificateNo: [item => "001"],
}
const result = await db.transform(source, config, {})
console.info(JSON.stringify(result))
// {"formattedName":"John","genderText":"male","email":"john@example.com","certificateNo":"001"}
```

## Використання – Message

Створіть повідомлення з відправником, отримувачем та вкладеннями.

Як створити та використовувати Message?
```js
import { Message, Attachment } from '@nan0web/mail'
const msg = new Message({
  body: "test message",
  from: "sender@example.com",
  to: "recipient@example.com",
  attachments: [
    new Attachment({ filename: "note.txt", content: "Hello!" })
  ]
})
console.info(String(msg))
// 2025-10-28T10:09:11.143Z test message
console.info(String(msg.from))
// <sender@example.com>
console.info(String(msg.to))
// <recipient@example.com>
console.info(JSON.stringify(msg.attachments))
// [{"filename":"note.txt","content":"Hello!","path":"","href":"","httpHeaders":"","contentType":"","contentDisposition":"attachment","cid":"","encoding":"","headers":"","raw":""}]
```

## Використання – createMailer

Допоміжна функція, що повертає транспорт Nodemailer.

Як створити транспорт Nodemailer через createMailer?
```js
import { createMailer } from '@nan0web/mail'
const transport = createMailer({ jsonTransport: true })
console.info(transport.constructor.name) // ← Mail
```

## Використання – відправка пошти

Функція `mail` формує все та відправляє.

Як відправити e-mail через допоміжну функцію `mail`?
```js
import { mail, Email } from '@nan0web/mail'
class DummyMailer {
  from
  subject
  html
  attachments
  async sendMail(msg) {
    Object.assign(this, msg)
    return { ok: true }
  }
}
const dummy = new DummyMailer()
const email = new Email({
  subject: "Hi {{user}}",
  html: "<p>Hello {{user}}</p>",
  from: "Me <me@example.com>",
  to: "You <you@example.com>",
})
const data = { user: "Bob" }
const info = await mail(email, data, { mailer: dummy })
console.info(info)
// { ok: true }
```

## Довідка API

### Address

* **Властивості** `address`, `name`, `type`

* **Методи** `toString()`, `toObject()`, статичний `from()`

### Attachment

* **Властивості** `filename`, `content`, `path`, `href`, `httpHeaders`, `contentType`, `contentDisposition`, `cid`, `encoding`, `headers`, `raw`

* **Методи** `formatForNodemailer()`, статичний `from()`

### Email

* **Властивості** `subject`, `html`, `from`, `target`, `attachments`, `text`, `style`, `dir`, `fields`

* **Методи** `attach()`, `formatForNodemailer()`, статичний `from()`

### Target

* **Методи** `add()`, `addObject()`, `formatForNodemailer()`, `toString()`, статичний `from()`

### Message

* **Властивості** `body`, `time`, `from`, `to`, `dir`, `attachments`

* **Методи** `attach()`, статичний `from()`

### MailDB

* **Методи** `transform()`, `loadFromReference()`, статичний `findNestedElement()`

### createMailer

Повертає транспорт Nodemailer.
@param {object} trasportConfig Налаштування для nodemailer

### mail

Відправляє зібране повідомлення.
@param {Email} email Об’єкт Email
@param {object} data Дані для заповнення плейсхолдерів
@param {object} opts Налаштування, як от mailer або htmlEol

Усі експортовані символи визначені

## Java•Script

Використовує файли `d.ts` для автозаповнення

## Playground

Запустіть швидкий експеримент.

Як запустити сценарій у playground?

## Contributing

Як зробити внесок? - [CONTRIBUTING.md](./CONTRIBUTING.md)

## License

Як використовувати ліцензію? - [LICENSE](./LICENSE)
