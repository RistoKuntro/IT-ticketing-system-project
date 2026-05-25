# IT Ticketing System

Kaasaegne IT toe piletisusteem (full-stack), kus kasutajad saavad luua tugipileteid, spetsialistid saavad pileteid menetleda ning admin saab hallata kasutajaid, rolle ja kogu piletivoogu.

## Sisukord
- [Projekti ulevaade](#projekti-ulevaade)
- [Pohifunktsionaalsus](#pohifunktsionaalsus)
- [Tehnoloogiad](#tehnoloogiad)
- [Arhitektuur](#arhitektuur)
- [Projektistruktuur](#projektistruktuur)
- [Kiirstart (Tutorial)](#kiirstart-tutorial)
- [Keskkonnamuutujad](#keskkonnamuutujad)
- [NPM scriptid](#npm-scriptid)
- [Demo kasutajad (seed)](#demo-kasutajad-seed)
- [API endpointid](#api-endpointid)
- [Autentimine ja rollid](#autentimine-ja-rollid)
- [Arhiiviloogika](#arhiiviloogika)
- [Swagger API dokumentatsioon](#swagger-api-dokumentatsioon)
- [Levinud probleemid](#levinud-probleemid)

## Projekti ulevaade
Rakendus koosneb kahest osast:
- client: React + TypeScript + Vite kasutajaliides
- server: Express + TypeScript + Prisma + PostgreSQL REST API

Kasutusjuht:
1. Kasutaja loob pileti.
2. Admin/spetsialist votab pileti toosse ja lisab lahendusi.
3. Pilet suletakse.
4. Kasutaja saab suletud piletile anda tagasisidet.
5. Pilet liigub arhiivi vastavalt staatusele/arhiivireeglitele.

## Pohifunktsionaalsus
- JWT-pohine autentimine (register/login)
- Rollid: admin, specialist, user
- Piletite loomine, vaatamine, filtreerimine, otsing
- Piletite uuendamine rollipohiste piirangutega
- Spetsialistide maaramine piletitele (many-to-many)
- Lahenduste (ticket responses) lisamine ja kustutamine
- Kasutaja tagasiside suletud piletitele
- Eraldi arhiivivaade
- Admini kasutajahaldus (rollid, profiiliandmed, kustutamine)
- Swagger UI API testimiseks

## Tehnoloogiad
### Client
- React 18
- TypeScript
- Vite
- Redux Toolkit
- React Router
- Axios
- React Hook Form + Zod

### Server
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT (jsonwebtoken)
- bcryptjs
- express-validator
- Swagger (swagger-jsdoc + swagger-ui-express)

## Arhitektuur
- Client saadab /api paringud Vite proxy kaudu serverisse (localhost:3001).
- Server valideerib JWT tokeni ja rollid middleware'itega.
- Andmed salvestatakse PostgreSQL andmebaasi Prisma kaudu.

Lihtsustatud voog:
- Browser (React) -> Vite (/api proxy) -> Express API -> Prisma -> PostgreSQL

## Projektistruktuur
- client/src/pages: vaated (Dashboard, Admin, Profile, Archive, Login, Register, Ticket Detail)
- client/src/api: HTTP teenused (authApi, ticketApi, userApi)
- client/src/store: Redux store ja slice'id
- server/src/routes: API route'id
- server/src/controllers: business logic
- server/src/middleware: auth/role/error/not-found middleware
- server/src/validators: sisendi valideerimine
- server/prisma: schema, migrationid, seed

## Kiirstart (Tutorial)
### 1) Eeldused
- Node.js 18+
- npm 9+
- PostgreSQL 14+ (voi uuem)

### 2) Klooni projekt
- git clone <repo-url>
- cd IT-ticketing-system-project

### 3) Paigalda soltuvused
Juurtasemel package.json puudub, paigalda eraldi:

Server:
- cd server
- npm install

Client:
- cd ../client
- npm install

### 4) Sea serveri keskkonnamuutujad
Loo fail server/.env:

```env
PORT=3001
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/helpdesk_db?schema=public"
JWT_SECRET="muuda-see-turvaliseks-saladuseks"
NODE_ENV="development"
```

Marge: JWT_SECRET peab olema maaratud, vastasel juhul server ei kaivitu.

### 5) Loo andmebaas
Loo PostgreSQL-is andmebaas nimega helpdesk_db (voi kasuta oma nime ja uuenda DATABASE_URL).

### 6) Rakenda migratsioonid ja lae demoandmed
- cd server
- npm run db:migrate
- npm run db:seed

### 7) Kaivita server
- cd server
- npm run dev

Server kaivitatakse vaikimisi aadressil:
- http://localhost:3001

### 8) Kaivita client
Uues terminalis:
- cd client
- npm run dev

Client kaivitatakse vaikimisi:
- http://localhost:5173

### 9) Ava rakendus
- UI: http://localhost:5173
- Swagger: http://localhost:3001/api-docs
- Swagger JSON: http://localhost:3001/api-docs.json

## Keskkonnamuutujad
Server (server/.env):
- PORT: API pordi number (vaikimisi 3001)
- DATABASE_URL: Prisma/PostgreSQL uhendus
- JWT_SECRET: tokeni signeerimise saladus (kohustuslik)
- NODE_ENV: development voi production

Client:
- Eraldi .env muutujad pole kohustuslikud.
- API kutsed kaivad baseURL /api kaudu ja Vite proxy suunab need serverisse.

## NPM scriptid
### server/package.json
- npm run dev: kaivita arendusserver (nodemon + ts-node)
- npm run build: kompileeri TypeScript kaustaks dist
- npm run start: kaivita kompileeritud server
- npm run db:migrate: Prisma migratsioon
- npm run db:seed: demoandmete seemendamine
- npm run db:studio: Prisma Studio

### client/package.json
- npm run dev: kaivita Vite arendusserver
- npm run build: TypeScript build + Vite build
- npm run preview: eelvaade builditud rakendusest

## Demo kasutajad (seed)
Pärast npm run db:seed on olemas:

- Admin
  - email: admin@helpdesk.com
  - password: Admin123!

- Specialist 1
  - email: pro1@helpdesk.com
  - password: Specialist123!

- Specialist 2
  - email: pro2@helpdesk.com
  - password: Specialist123!

- Regular user
  - email: user@helpdesk.com
  - password: User123!

## API endpointid
Baastee: /api

## Auth
| Method | Endpoint | Kirjeldus | Auth |

| POST | /api/auth/register | Registreeri uus kasutaja |
| POST | /api/auth/login | Logi sisse ja saa JWT token |
| GET | /api/auth/me | Hetkel sisse logitud kasutaja profiil |
| PUT | /api/auth/me | Uuenda oma profiili |

## Tickets
| Method | Endpoint | Kirjeldus | Roll |

| GET | /api/tickets | Piletite nimekiri (filter + search) | auth kasutaja |
| GET | /api/tickets/archived | Arhiveeritud piletid | auth kasutaja |
| POST | /api/tickets | Loo uus pilet | auth kasutaja |
| GET | /api/tickets/:id | Vaata pileti detaili | auth kasutaja |
| PUT | /api/tickets/:id | Uuenda piletit | auth kasutaja (rollipohised piirangud) |
| DELETE | /api/tickets/:id | Kustuta pilet | admin |
| POST | /api/tickets/:id/solutions | Lisa lahendus | admin, specialist |
| DELETE | /api/tickets/:id/solutions/:solutionId | Kustuta lahendus | admin |
| POST | /api/tickets/:id/assign/:specialistId | Määra spetsialist | admin, specialist |
| DELETE | /api/tickets/:id/assign/:specialistId | Eemalda spetsialisti määrang | admin, specialist |
| POST | /api/tickets/:id/feedback | Lisa tagasiside suletud piletile | pileti looja |

## Users
| Method | Endpoint | Kirjeldus | Roll |

| GET | /api/users | Koik kasutajad | admin |
| GET | /api/users/specialists | Spetsialistide nimekiri | admin, specialist |
| PUT | /api/users/:id/role | Muuda kasutaja rolli | admin |
| PUT | /api/users/:id | Uuenda kasutaja andmeid | admin |
| DELETE | /api/users/:id | Kustuta kasutaja | admin |

## Paringu filtrid (tickets)
GET /api/tickets toetab query parameetreid:
- status: open | in_progress | closed | archived | cancelled
- priority: none | low | medium | high
- search: vabateksti otsing pealkirjas ja kirjelduses

## Autentimine ja rollid
Autentimiseks kasuta Authorization header'it:
- Authorization: Bearer <JWT_TOKEN>

Olulised reeglid:
- user naeb oma pileteid
- specialist naeb talle maaratud + enda loodud pileteid
- admin naeb koiki pileteid ja kasutajaid
- ainult admin saab kustutada pileteid ja lahendusi

## Arhiiviloogika
Selles projektis on arhiiviga seotud kaks kihti:
- Rakenduse tasemel: arhiivitud piletid ei ilmu peamises nimekirjas ning eraldi kuvatakse /api/tickets/archived kaudu.
- Andmebaasi tasemel: migratsioon sisaldab triggerit, mis voib suletud pileti seisundit arhiivida (7 paeva reegel uuenduse hetkel).

Tagasiside lisamine suletud piletile uuendab closedAt vaartust (st pikendab arhiivimise taimerit).

## Swagger API dokumentatsioon
Pärast serveri kaivitamist:
- Ava http://localhost:3001/api-docs
- Kasuta POST /api/auth/login endpointi tokeni saamiseks
- Vajuta Authorize ja sisesta Bearer <token>
- Testi kaitstud endpoint'e otse Swaggeris

## Levinud probleemid
1. Viga: JWT_SECRET environment variable must be set
- Lisa server/.env faili JWT_SECRET

2. Prisma ei uhenedu andmebaasiga
- Kontrolli DATABASE_URL formaati
- Kontrolli, et PostgreSQL teenus kaib
- Kontrolli, et andmebaas helpdesk_db eksisteerib

3. Client ei saa API vastust
- Kontrolli, et server kaib pordil 3001
- Kontrolli, et client kaib pordil 5173
- Kontrolli Vite proxy seadistust client/vite.config.ts
