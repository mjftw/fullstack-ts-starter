CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar NOT NULL,
	"name" text,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
