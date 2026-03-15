import { Application, type Context, type Next } from "@oak/oak";
import todosRoutes from "./routes/todos.ts";
import { connect } from "./helpers/db_client.ts";

await connect();

const app = new Application();

app.use(async (_ctx: Context, next: Next) => {
    console.log("Middleware!");
    await next();
});

app.use(todosRoutes.routes());
app.use(todosRoutes.allowedMethods());

await app.listen({ port: 8000 });
