import { Router } from "@oak/oak";
import { ObjectId } from "@db/mongo";
import { getDb } from "../helpers/db_client.ts";

const router = new Router();

interface Todo {
    _id?: ObjectId;
    text: string;
}

interface TodoBody {
    text: string;
}

router.get("/todos", async (ctx) => {
    const todosCollection = getDb().collection<Todo>("todos");
    const todos = await todosCollection.find().toArray();

    const transformedTodos = todos.map((todo) => ({
        id: todo._id?.toString(),
        text: todo.text,
    }));

    ctx.response.status = 200;
    ctx.response.body = { todos: transformedTodos };
});

router.post("/todos", async (ctx) => {
    const body = (await ctx.request.body.json()) as TodoBody;

    const newTodo: Todo = {
        text: body.text,
    };

    const todosCollection = getDb().collection<Todo>("todos");
    const insertedId = await todosCollection.insertOne(newTodo);

    ctx.response.status = 201;
    ctx.response.body = {
        message: "Created todo!",
        todo: {
            id: insertedId.toString(),
            text: newTodo.text,
        },
    };
});

router.put("/todos/:todoId", async (ctx) => {
    const tid = ctx.params.todoId;

    if (!tid) {
        ctx.response.status = 400;
        ctx.response.body = { message: "Missing todo id" };
        return;
    }

    const body = (await ctx.request.body.json()) as TodoBody;
    const todosCollection = getDb().collection<Todo>("todos");

    const result = await todosCollection.updateOne(
        { _id: new ObjectId(tid) },
        { $set: { text: body.text } },
    );

    if (result.matchedCount === 0) {
        ctx.response.status = 404;
        ctx.response.body = { message: "Todo not found" };
        return;
    }

    ctx.response.status = 200;
    ctx.response.body = { message: "Updated todo" };
});

router.delete("/todos/:todoId", async (ctx) => {
    const tid = ctx.params.todoId;

    if (!tid) {
        ctx.response.status = 400;
        ctx.response.body = { message: "Missing todo id" };
        return;
    }

    const todosCollection = getDb().collection<Todo>("todos");
    const deletedCount = await todosCollection.deleteOne({
        _id: new ObjectId(tid),
    });

    if (deletedCount === 0) {
        ctx.response.status = 404;
        ctx.response.body = { message: "Todo not found" };
        return;
    }

    ctx.response.status = 200;
    ctx.response.body = { message: "Deleted todo" };
});

export default router;
