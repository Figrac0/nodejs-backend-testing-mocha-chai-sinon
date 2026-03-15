import { MongoClient, Database } from "@db/mongo";

const MONGODB_URI = `mongodb+srv://${Deno.env.get("MONGO_USER")}:${Deno.env.get("MONGO_PASSWORD")}@${Deno.env.get("MONGO_CLUSTER")}/${Deno.env.get("MONGO_DB")}?retryWrites=true&w=majority`;

let db: Database | null = null;

export async function connect(): Promise<void> {
    const client = new MongoClient();

    await client.connect(MONGODB_URI);

    db = client.database(Deno.env.get("MONGO_DB")!);
}

export function getDb(): Database {
    if (!db) {
        throw new Error("Database not initialized");
    }

    return db;
}
