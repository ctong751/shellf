CREATE TABLE "comments" (
	"author_did" text NOT NULL,
	"record_key" text NOT NULL,
	"content_id" text NOT NULL,
	"text" text NOT NULL,
	"reply_uri" text,
	"reply_cid" text,
	"created_at" timestamp with time zone NOT NULL,
	"indexed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "comments_author_did_record_key_pk" PRIMARY KEY("author_did","record_key"),
	CONSTRAINT "comments_reply_ref_check" CHECK (("comments"."reply_uri" is null and "comments"."reply_cid" is null) or ("comments"."reply_uri" is not null and "comments"."reply_cid" is not null))
);
--> statement-breakpoint
CREATE TABLE "consumes" (
	"author_did" text NOT NULL,
	"record_key" text NOT NULL,
	"content_id" text NOT NULL,
	"consumed_at" timestamp with time zone NOT NULL,
	"indexed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "consumes_author_did_record_key_pk" PRIMARY KEY("author_did","record_key")
);
--> statement-breakpoint
CREATE TABLE "consumption_starts" (
	"author_did" text NOT NULL,
	"record_key" text NOT NULL,
	"content_id" text NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"indexed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "consumption_starts_author_did_record_key_pk" PRIMARY KEY("author_did","record_key")
);
--> statement-breakpoint
CREATE TABLE "consumption_stops" (
	"author_did" text NOT NULL,
	"record_key" text NOT NULL,
	"subject_uri" text NOT NULL,
	"subject_cid" text,
	"start_author_did" text NOT NULL,
	"start_record_key" text NOT NULL,
	"stopped_at" timestamp with time zone NOT NULL,
	"indexed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "consumption_stops_author_did_record_key_pk" PRIMARY KEY("author_did","record_key"),
	CONSTRAINT "consumption_stops_author_check" CHECK ("consumption_stops"."author_did" = "consumption_stops"."start_author_did")
);
--> statement-breakpoint
CREATE TABLE "content" (
	"id" text PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"source" text DEFAULT 'tmdb' NOT NULL,
	"external_id" text NOT NULL,
	"parent_content_id" text,
	"season_number" integer,
	"episode_number" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "content_kind_check" CHECK ("content"."kind" in ('movie', 'tv_show', 'tv_episode')),
	CONSTRAINT "content_source_check" CHECK ("content"."source" = 'tmdb'),
	CONSTRAINT "content_external_id_check" CHECK (length("content"."external_id") between 1 and 256),
	CONSTRAINT "content_episode_identity_check" CHECK (("content"."kind" = 'tv_episode' and "content"."parent_content_id" is not null and "content"."season_number" >= 0 and "content"."episode_number" > 0) or ("content"."kind" <> 'tv_episode' and "content"."parent_content_id" is null and "content"."season_number" is null and "content"."episode_number" is null))
);
--> statement-breakpoint
CREATE TABLE "likes" (
	"author_did" text NOT NULL,
	"record_key" text NOT NULL,
	"subject_uri" text NOT NULL,
	"subject_cid" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"indexed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "likes_author_did_record_key_pk" PRIMARY KEY("author_did","record_key")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"author_did" text NOT NULL,
	"record_key" text NOT NULL,
	"content_id" text NOT NULL,
	"rating" integer NOT NULL,
	"text" text,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"indexed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reviews_author_did_record_key_pk" PRIMARY KEY("author_did","record_key"),
	CONSTRAINT "reviews_rating_check" CHECK ("reviews"."rating" between 1 and 5)
);
--> statement-breakpoint
CREATE TABLE "saves" (
	"author_did" text NOT NULL,
	"record_key" text NOT NULL,
	"content_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"indexed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "saves_author_did_record_key_pk" PRIMARY KEY("author_did","record_key")
);
--> statement-breakpoint
DROP TABLE "media_items" CASCADE;--> statement-breakpoint
DROP TABLE "shelf_items" CASCADE;--> statement-breakpoint
DROP TABLE "watch_events" CASCADE;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_did_users_did_fk" FOREIGN KEY ("author_did") REFERENCES "public"."users"("did") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_content_id_content_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consumes" ADD CONSTRAINT "consumes_author_did_users_did_fk" FOREIGN KEY ("author_did") REFERENCES "public"."users"("did") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consumes" ADD CONSTRAINT "consumes_content_id_content_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consumption_starts" ADD CONSTRAINT "consumption_starts_author_did_users_did_fk" FOREIGN KEY ("author_did") REFERENCES "public"."users"("did") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consumption_starts" ADD CONSTRAINT "consumption_starts_content_id_content_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consumption_stops" ADD CONSTRAINT "consumption_stops_author_did_users_did_fk" FOREIGN KEY ("author_did") REFERENCES "public"."users"("did") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consumption_stops" ADD CONSTRAINT "consumption_stops_start_fk" FOREIGN KEY ("start_author_did","start_record_key") REFERENCES "public"."consumption_starts"("author_did","record_key") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content" ADD CONSTRAINT "content_parent_content_id_content_id_fk" FOREIGN KEY ("parent_content_id") REFERENCES "public"."content"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_author_did_users_did_fk" FOREIGN KEY ("author_did") REFERENCES "public"."users"("did") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_author_did_users_did_fk" FOREIGN KEY ("author_did") REFERENCES "public"."users"("did") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_content_id_content_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saves" ADD CONSTRAINT "saves_author_did_users_did_fk" FOREIGN KEY ("author_did") REFERENCES "public"."users"("did") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saves" ADD CONSTRAINT "saves_content_id_content_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "comments_content_created_at_idx" ON "comments" USING btree ("content_id","created_at");--> statement-breakpoint
CREATE INDEX "comments_reply_uri_idx" ON "comments" USING btree ("reply_uri");--> statement-breakpoint
CREATE INDEX "consumes_author_consumed_at_idx" ON "consumes" USING btree ("author_did","consumed_at");--> statement-breakpoint
CREATE INDEX "consumes_content_consumed_at_idx" ON "consumes" USING btree ("content_id","consumed_at");--> statement-breakpoint
CREATE INDEX "consumption_starts_author_started_at_idx" ON "consumption_starts" USING btree ("author_did","started_at");--> statement-breakpoint
CREATE INDEX "consumption_starts_author_content_idx" ON "consumption_starts" USING btree ("author_did","content_id");--> statement-breakpoint
CREATE UNIQUE INDEX "consumption_stops_start_unique" ON "consumption_stops" USING btree ("start_author_did","start_record_key");--> statement-breakpoint
CREATE INDEX "consumption_stops_author_stopped_at_idx" ON "consumption_stops" USING btree ("author_did","stopped_at");--> statement-breakpoint
CREATE UNIQUE INDEX "content_source_identity_unique" ON "content" USING btree ("source","kind","external_id");--> statement-breakpoint
CREATE INDEX "content_parent_idx" ON "content" USING btree ("parent_content_id");--> statement-breakpoint
CREATE UNIQUE INDEX "likes_author_subject_unique" ON "likes" USING btree ("author_did","subject_uri");--> statement-breakpoint
CREATE INDEX "likes_subject_uri_idx" ON "likes" USING btree ("subject_uri");--> statement-breakpoint
CREATE UNIQUE INDEX "reviews_author_content_unique" ON "reviews" USING btree ("author_did","content_id");--> statement-breakpoint
CREATE INDEX "reviews_content_created_at_idx" ON "reviews" USING btree ("content_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "saves_author_content_unique" ON "saves" USING btree ("author_did","content_id");--> statement-breakpoint
CREATE INDEX "saves_author_created_at_idx" ON "saves" USING btree ("author_did","created_at");