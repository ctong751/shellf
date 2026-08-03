# Draft Shellf lexicons

The `net.shellf.temp.*` schemas are the experimental portable contract for
Shellf account data. The namespace uses the `shellf.net` domain in reverse, and
the `.temp.` segment keeps the unpublished model explicitly provisional.

## Content identity

`net.shellf.temp.defs#content` identifies external content without copying
catalog metadata into account repositories. Shellf currently canonicalizes all
content to TMDB:

- `movie` and `tv_show` use the numeric TMDB object ID.
- `tv_episode` uses the numeric TMDB episode ID and also includes `showId`,
  `seasonNumber`, and `episodeNumber`. TMDB's episode APIs are nested below a
  show and season, so those coordinates are part of the portable identity.

The AppView enforces the episode-only field requirements that Lexicon cannot
express as conditional object validation. Titles, artwork, descriptions,
runtimes, and availability remain external TMDB data.

## Records and projections

| Record                           | Meaning                                 | Database projection  |
| -------------------------------- | --------------------------------------- | -------------------- |
| `net.shellf.temp.save`           | Want to Watch membership                | `saves`              |
| `net.shellf.temp.startConsuming` | Starts long-running content             | `consumption_starts` |
| `net.shellf.temp.stopConsuming`  | Closes a specific start                 | `consumption_stops`  |
| `net.shellf.temp.consume`        | Watched/read/listened activity          | `consumes`           |
| `net.shellf.temp.review`         | One 1–5 star review per account/content | `reviews`            |
| `net.shellf.temp.comment`        | Content comment or comment reply        | `comments`           |
| `net.shellf.temp.like`           | Comment like                            | `likes`              |

All records use `key: any`. Normal app-created event records may still use a
TID, while imports can use deterministic keys so rerunning an import does not
create duplicate actions. The AppView enforces semantic uniqueness for saves,
reviews, likes, and stops.

Imports normalize catalog identities to TMDB before writing records and stage
ambiguous matches for confirmation. The TV Time adapter normalizes its legacy
rating codes as `3 → 5`, `29 → 4`, `28 → 3`, and `27 → 2`; those source codes
never appear in public review records.

Comments target content directly and may reply only to another Shellf comment.
Likes may target only Shellf comments. `strongRef` itself cannot constrain the
target collection, so the AppView validates those rules while indexing.

## Current application bridge

The signed-in application writes these Postgres projections directly for now.
Before records are written to user repositories, the schemas must be published,
OAuth repository permissions requested, and an ingestion path made responsible
for indexing repository writes. At that point the user's PDS becomes the source
of truth and Postgres remains the query-oriented AppView projection.
