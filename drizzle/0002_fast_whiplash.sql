CREATE TABLE "media_items" (
	"id" text PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"source" text NOT NULL,
	"external_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_items_kind_check" CHECK ("media_items"."kind" in ('movie', 'tv_show', 'book')),
	CONSTRAINT "media_items_source_check" CHECK (length("media_items"."source") between 1 and 64),
	CONSTRAINT "media_items_external_id_check" CHECK (length("media_items"."external_id") between 1 and 256)
);
--> statement-breakpoint
INSERT INTO "media_items" ("id", "kind", "source", "external_id")
SELECT DISTINCT
	md5("subject_source" || ':' || "media_type" || ':' || "media_id"),
	CASE "media_type" WHEN 'series' THEN 'tv_show' ELSE "media_type" END,
	"subject_source",
	"media_id"
FROM (
	SELECT "subject_source", "media_type", "media_id" FROM "library_items"
	UNION
	SELECT "subject_source", "media_type", "media_id" FROM "watch_events"
) AS "legacy_media";
--> statement-breakpoint
ALTER TABLE "library_items" RENAME TO "shelf_items";
--> statement-breakpoint
ALTER TABLE "shelf_items" RENAME COLUMN "status" TO "state";
--> statement-breakpoint
ALTER TABLE "shelf_items" DROP CONSTRAINT "library_items_status_check";
--> statement-breakpoint
ALTER TABLE "shelf_items" ADD COLUMN "media_item_id" text;
--> statement-breakpoint
ALTER TABLE "watch_events" ADD COLUMN "media_item_id" text;
--> statement-breakpoint
UPDATE "shelf_items"
SET "media_item_id" = md5("subject_source" || ':' || "media_type" || ':' || "media_id"),
	"state" = CASE "state" WHEN 'want-to-watch' THEN 'planned' WHEN 'watching' THEN 'in-progress' ELSE "state" END;
--> statement-breakpoint
UPDATE "watch_events"
SET "media_item_id" = md5("subject_source" || ':' || "media_type" || ':' || "media_id");
--> statement-breakpoint
ALTER TABLE "shelf_items" ALTER COLUMN "media_item_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "watch_events" ALTER COLUMN "media_item_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "shelf_items" DROP CONSTRAINT "library_items_subject_source_check";
--> statement-breakpoint
ALTER TABLE "shelf_items" DROP CONSTRAINT "library_items_media_type_check";
--> statement-breakpoint
ALTER TABLE "shelf_items" DROP CONSTRAINT "library_items_progress_check";
--> statement-breakpoint
ALTER TABLE "watch_events" DROP CONSTRAINT "watch_events_subject_source_check";
--> statement-breakpoint
ALTER TABLE "watch_events" DROP CONSTRAINT "watch_events_media_type_check";
--> statement-breakpoint
ALTER TABLE "watch_events" DROP CONSTRAINT "watch_events_episode_check";
--> statement-breakpoint
ALTER TABLE "shelf_items" DROP CONSTRAINT "library_items_user_did_users_did_fk";
--> statement-breakpoint
DROP INDEX "library_items_user_subject_unique";
--> statement-breakpoint
DROP INDEX "library_items_user_status_idx";
--> statement-breakpoint
ALTER TABLE "shelf_items" DROP CONSTRAINT "library_items_user_did_record_key_pk";
--> statement-breakpoint
ALTER TABLE "shelf_items" ADD CONSTRAINT "shelf_items_user_did_record_key_pk" PRIMARY KEY("user_did","record_key");
--> statement-breakpoint
CREATE UNIQUE INDEX "media_items_source_identity_unique" ON "media_items" USING btree ("source","kind","external_id");
--> statement-breakpoint
ALTER TABLE "shelf_items" ADD CONSTRAINT "shelf_items_user_did_users_did_fk" FOREIGN KEY ("user_did") REFERENCES "public"."users"("did") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "shelf_items" ADD CONSTRAINT "shelf_items_media_item_id_media_items_id_fk" FOREIGN KEY ("media_item_id") REFERENCES "public"."media_items"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "watch_events" ADD CONSTRAINT "watch_events_media_item_id_media_items_id_fk" FOREIGN KEY ("media_item_id") REFERENCES "public"."media_items"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "shelf_items_user_media_unique" ON "shelf_items" USING btree ("user_did","media_item_id");
--> statement-breakpoint
CREATE INDEX "shelf_items_user_state_idx" ON "shelf_items" USING btree ("user_did","state");
--> statement-breakpoint
ALTER TABLE "shelf_items" DROP COLUMN "subject_source";
--> statement-breakpoint
ALTER TABLE "shelf_items" DROP COLUMN "media_type";
--> statement-breakpoint
ALTER TABLE "shelf_items" DROP COLUMN "media_id";
--> statement-breakpoint
ALTER TABLE "watch_events" DROP COLUMN "subject_source";
--> statement-breakpoint
ALTER TABLE "watch_events" DROP COLUMN "media_type";
--> statement-breakpoint
ALTER TABLE "watch_events" DROP COLUMN "media_id";
--> statement-breakpoint
ALTER TABLE "shelf_items" ADD CONSTRAINT "shelf_items_state_check" CHECK ("shelf_items"."state" in ('planned', 'in-progress'));
--> statement-breakpoint
ALTER TABLE "shelf_items" ADD CONSTRAINT "shelf_items_progress_check" CHECK (("shelf_items"."season" is null and "shelf_items"."episode" is null) or ("shelf_items"."season" > 0 and "shelf_items"."episode" > 0));
--> statement-breakpoint
ALTER TABLE "watch_events" ADD CONSTRAINT "watch_events_episode_check" CHECK (("watch_events"."season" is null and "watch_events"."episode" is null) or ("watch_events"."season" > 0 and "watch_events"."episode" > 0));
