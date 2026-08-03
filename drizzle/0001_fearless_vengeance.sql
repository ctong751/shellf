CREATE TABLE "library_items" (
	"user_did" text NOT NULL,
	"record_key" text NOT NULL,
	"subject_source" text DEFAULT 'tmdb' NOT NULL,
	"media_type" text NOT NULL,
	"media_id" text NOT NULL,
	"status" text NOT NULL,
	"season" integer,
	"episode" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"indexed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "library_items_user_did_record_key_pk" PRIMARY KEY("user_did","record_key"),
	CONSTRAINT "library_items_subject_source_check" CHECK ("library_items"."subject_source" = 'tmdb'),
	CONSTRAINT "library_items_media_type_check" CHECK ("library_items"."media_type" in ('movie', 'series')),
	CONSTRAINT "library_items_status_check" CHECK ("library_items"."status" in ('want-to-watch', 'watching')),
	CONSTRAINT "library_items_progress_check" CHECK (("library_items"."season" is null and "library_items"."episode" is null) or ("library_items"."media_type" = 'series' and "library_items"."season" > 0 and "library_items"."episode" > 0))
);
--> statement-breakpoint
CREATE TABLE "watch_events" (
	"user_did" text NOT NULL,
	"record_key" text NOT NULL,
	"subject_source" text DEFAULT 'tmdb' NOT NULL,
	"media_type" text NOT NULL,
	"media_id" text NOT NULL,
	"season" integer,
	"episode" integer,
	"watched_at" timestamp with time zone NOT NULL,
	"indexed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "watch_events_user_did_record_key_pk" PRIMARY KEY("user_did","record_key"),
	CONSTRAINT "watch_events_subject_source_check" CHECK ("watch_events"."subject_source" = 'tmdb'),
	CONSTRAINT "watch_events_media_type_check" CHECK ("watch_events"."media_type" in ('movie', 'series')),
	CONSTRAINT "watch_events_episode_check" CHECK (("watch_events"."media_type" = 'movie' and "watch_events"."season" is null and "watch_events"."episode" is null) or ("watch_events"."media_type" = 'series' and "watch_events"."season" > 0 and "watch_events"."episode" > 0))
);
--> statement-breakpoint
ALTER TABLE "library_items" ADD CONSTRAINT "library_items_user_did_users_did_fk" FOREIGN KEY ("user_did") REFERENCES "public"."users"("did") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watch_events" ADD CONSTRAINT "watch_events_user_did_users_did_fk" FOREIGN KEY ("user_did") REFERENCES "public"."users"("did") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "library_items_user_subject_unique" ON "library_items" USING btree ("user_did","subject_source","media_type","media_id");--> statement-breakpoint
CREATE INDEX "library_items_user_status_idx" ON "library_items" USING btree ("user_did","status");--> statement-breakpoint
CREATE INDEX "watch_events_user_watched_at_idx" ON "watch_events" USING btree ("user_did","watched_at");