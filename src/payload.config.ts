import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { phoneNumberPlugin } from "payload-phone-number-plugin";
import { buildConfig } from "payload";
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Brands } from "./collections/Brands";
import { Categories } from "./collections/Categories";
import { Products } from "./collections/Products";
import { Posts } from "./collections/Posts";
import { Orders } from "./collections/Orders";
import { SiteSettings } from "./globals/SiteSettings";
import { fa } from "payload/i18n/fa";
import { en } from "payload/i18n/en";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
	admin: {
		user: Users.slug,
		importMap: {
			baseDir: path.resolve(dirname),
		},
	},
	collections: [Users, Media, Brands, Categories, Products, Posts, Orders],
	globals: [SiteSettings],
	i18n: {
		translations: { fa, en },
		supportedLanguages: { fa, en },
		fallbackLanguage: "fa",
	},
	editor: lexicalEditor({}),
	secret: process.env.PAYLOAD_SECRET || "",
	typescript: {
		outputFile: path.resolve(dirname, "payload-types.ts"),
	},
	db: sqliteAdapter({
		client: {
			url: process.env.DATABASE_URL || "",
		},
	}),
	sharp,
	plugins: [
		phoneNumberPlugin({
			allowedCountries: ["IR"],
			defaultCountry: "IR",
			admin: {
				countryPrefixDisplayFormat: "flagEmoji",
				cellDisplayFormat: "national",
			},
		}),
	],
});
