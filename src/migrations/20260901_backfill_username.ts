import { type MigrateUpArgs, type MigrateDownArgs, sql } from "@payloadcms/db-sqlite";

export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
	await db.run(sql`ALTER TABLE \`users\` ADD COLUMN \`username\` text;`);
	await db.run(sql`UPDATE \`users\` SET \`username\` = \`phone\` WHERE \`username\` IS NULL OR \`username\` = '';`);
	await db.run(sql`CREATE UNIQUE INDEX \`users_username_idx\` ON \`users\` (\`username\`);`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
	await db.run(sql`DROP INDEX IF EXISTS \`users_username_idx\`;`);
	await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`username\`;`);
}
