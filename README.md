# FlowBoard

FlowBoard e una web app di project management ispirata a Trello, costruita con Next.js 14 App Router, TypeScript, Tailwind CSS e Supabase. Include board kanban con drag and drop, planner mensile, roadmap a fasi e goal, autenticazione con approvazione admin e gestione utenti.

## Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Supabase Auth, Database e Storage
- `@hello-pangea/dnd`
- `date-fns`
- `lucide-react`

## Funzionalita principali

- Registrazione e login con Supabase Auth
- Approvazione utenti via admin
- Admin hardcoded: `ludovico.righetto@gmail.com`
- Board kanban con drag and drop persistente
- Modal task con checklist, note, label, assegnati, date, priorita e allegati
- Planner mensile con task multi-day
- Roadmap con fasi, goal e collegamento task
- Upload file su Supabase Storage

## Struttura progetto

```text
app/
  (auth)/
  (protected)/
  pending/
components/
  admin/
  board/
  layout/
  planner/
  roadmap/
  task/
  ui/
hooks/
lib/
  auth/
  supabase/
  utils/
sql/
types/
```

## Variabili ambiente

Copia `.env.example` in `.env.local` e compila questi valori:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
FLOWBOARD_STORAGE_BUCKET=task-attachments
```

## Configurazione Supabase

### 1. Crea il progetto

Apri [Supabase](https://supabase.com/), crea un nuovo progetto e attendi che sia pronto.

### 2. Copia URL e anon key

Vai in `Project Settings > API` e copia:

- `Project URL`
- `anon public key`

Inseriscili nel file `.env.local`.

### 3. Esegui SQL schema

Apri `SQL Editor` in Supabase, incolla tutto il contenuto di [sql/flowboard.sql](/Users/righets/Desktop/flowboard/sql/flowboard.sql) e premi `Run`.

Questo script:

- crea tutte le tabelle
- crea enum e indici
- attiva RLS
- crea il trigger `profiles`
- rende admin e approvato `ludovico.righetto@gmail.com`
- crea il bucket `task-attachments`
- aggiunge le policy per lo storage

### 4. Configurazione Auth

Vai in `Authentication > Providers > Email`.

- Attiva `Enable Email provider`
- Mantieni login via email/password

Per il primo avvio semplice, puoi disattivare la conferma email se non vuoi gestire link di verifica:

- `Authentication > Providers > Email`
- disattiva `Confirm email`

FlowBoard funziona in modo piu lineare cosi, specialmente in fase iniziale.

## Avvio locale

```bash
npm install
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

## Build di produzione

```bash
npm run build
```

Se la build passa, il progetto e pronto per Vercel.

## Deploy su Vercel

1. Carica il progetto su GitHub.
2. Vai su [Vercel](https://vercel.com/).
3. Importa il repository.
4. Aggiungi le stesse variabili di `.env.local`.
5. Conferma le impostazioni predefinite:
   - Framework Preset: `Next.js`
   - Build Command: `next build`
   - Output: automatico
6. Premi `Deploy`.

## Setup passo passo

1. Crea un progetto su Supabase.
   Vai su [supabase.com](https://supabase.com/), clicca `New project`, inserisci nome, password database e regione, poi attendi la creazione completa.

2. Copia URL e anon key.
   Vai in `Project Settings > API`, copia `Project URL` e `anon public key`. Ti serviranno subito per `.env.local`.

3. Esegui il file SQL.
   Apri `SQL Editor`, crea una nuova query, incolla tutto il contenuto di [sql/flowboard.sql](/Users/righets/Desktop/flowboard/sql/flowboard.sql) e clicca `Run`. Risultato atteso: tabelle, trigger, policy e bucket creati senza errori.

4. Crea `.env.local`.
   Duplica `.env.example`, rinominalo in `.env.local` e incolla:
   - `NEXT_PUBLIC_SUPABASE_URL` con il tuo `Project URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` con la tua anon key
   - `FLOWBOARD_STORAGE_BUCKET=task-attachments`

5. Configura Auth email/password.
   In Supabase vai su `Authentication > Providers > Email`, attiva email/password e, per ridurre i passaggi manuali, disattiva `Confirm email`.

6. Installa le dipendenze.
   Apri il terminale dentro la cartella del progetto ed esegui `npm install`.

7. Avvia il progetto.
   Esegui `npm run dev` e apri `http://localhost:3000`.

8. Registra l’admin.
   Vai su `/register` e crea l’account con `ludovico.righetto@gmail.com`. Risultato atteso: l’utente viene creato come admin e approvato automaticamente dal trigger SQL.

9. Accedi e verifica le sezioni.
   Dopo il login devi vedere sidebar con `Board`, `Planner`, `Roadmap` e `Admin`.

10. Registra un secondo utente.
   Crea un altro account con una email diversa. Risultato atteso: l’utente finisce in `/pending`.

11. Approva il nuovo utente.
   Entra come admin, vai su `/admin`, clicca `Approva` sulla riga del nuovo utente. Risultato atteso: l’utente potra entrare nelle sezioni protette.

12. Verifica allegati.
   Crea un task, apri il modal, carica un file o aggiungi un link. Risultato atteso: allegato visibile e apribile.

## Deploy su Vercel passo passo

1. Crea un repository GitHub e carica il progetto.
   Se non lo hai gia fatto, inizializza git, crea il repository e fai push.

2. Importa il repository su Vercel.
   In Vercel clicca `Add New > Project`, seleziona GitHub e scegli il repository `flowboard`.

3. Controlla le impostazioni base.
   Vercel dovrebbe rilevare automaticamente `Next.js`. Lascia il build command predefinito.

4. Aggiungi environment variables.
   Nella schermata del deploy incolla:
   - `NEXT_PUBLIC_APP_URL` con il dominio finale Vercel
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `FLOWBOARD_STORAGE_BUCKET=task-attachments`

5. Avvia il deploy.
   Premi `Deploy`. Risultato atteso: build completata con successo.

6. Verifica online.
   Apri il dominio Vercel generato, registra o accedi e conferma che login, board e admin funzionino correttamente.

## Come testare che funzioni

- Registra `ludovico.righetto@gmail.com` e verifica che entri senza pagina pending.
- Effettua login come admin.
- Crea una lista nella board.
- Crea un task.
- Trascina il task in un’altra lista.
- Aggiungi una label.
- Crea una checklist e completa alcune voci.
- Assegna un utente approvato.
- Imposta data inizio e scadenza.
- Vai nel planner e verifica la barra multi-day.
- Crea una fase roadmap.
- Crea un goal.
- Collega un task al goal dalla roadmap.
- Collega lo stesso task dal modal task.
- Registra un nuovo utente non admin.
- Verifica che veda la pagina pending.
- Approva l’utente da admin.
- Carica un allegato file e un allegato link.
- Esegui `npm run build`.

## Errori comuni e come risolverli

### Variabili env mancanti

Se vedi errori relativi a Supabase URL o key, controlla che `.env.local` esista e che i nomi delle variabili siano esatti.

### Supabase URL o key sbagliate

Se login e fetch non funzionano, torna in `Project Settings > API` e ricopia `Project URL` e `anon public key`.

### SQL non eseguito

Se dopo la registrazione non compare il profilo o mancano tabelle, significa quasi sempre che [sql/flowboard.sql](/Users/righets/Desktop/flowboard/sql/flowboard.sql) non e stato eseguito completamente.

### Bucket storage non creato

Se l’upload fallisce, controlla in `Storage` che esista il bucket `task-attachments`. Se manca, riesegui il file SQL.

### Middleware o redirect bloccati

Se resti bloccato su login o pending, verifica:
- di aver eseguito il login con successo
- che il profilo sia `is_approved = true`
- che il middleware sia presente in [middleware.ts](/Users/righets/Desktop/flowboard/middleware.ts)

### Admin non approvato

Se `ludovico.righetto@gmail.com` non risulta admin, il trigger non e stato creato o non e stato eseguito prima della registrazione. Soluzione: elimina quell’utente da `Authentication > Users`, riesegui il SQL e registralo di nuovo.

### Errori build su Vercel

Se Vercel fallisce in build, controlla:
- environment variables presenti
- chiavi Supabase corrette
- che il repository contenga tutti i file del progetto

### Login funziona ma dati no

In genere e un problema di RLS o SQL incompleto. Riesegui [sql/flowboard.sql](/Users/righets/Desktop/flowboard/sql/flowboard.sql) su un progetto Supabase pulito.
