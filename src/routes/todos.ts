import {
    Router,
    type Request,
    type Response,
    type NextFunction,
} from "express";
import { type Todo } from "../models/todos";

type ErrorResponse = {
    message: string;
};

type GetTodosResponse = {
    todos: Todo[];
};

type CreateTodoBody = {
    text: string;
};

type CreateTodoSuccessResponse = {
    message: string;
    todo: Todo;
};

type UpdateTodoParams = {
    todoId: string;
};

type UpdateTodoBody = {
    text: string;
};

type UpdateTodoSuccessResponse = {
    message: string;
    todo: Todo;
};

type DeleteTodoParams = {
    todoId: string;
};

type DeleteTodoSuccessResponse = {
    message: string;
};

let todos: Todo[] = [];

const router = Router();

router.get("/", (req: Request, res: Response<GetTodosResponse>): void => {
    res.status(200).json({ todos });
});

router.post(
    "/",
    (
        req: Request<
            {},
            CreateTodoSuccessResponse | ErrorResponse,
            CreateTodoBody
        >,
        res: Response<CreateTodoSuccessResponse | ErrorResponse>,
        next: NextFunction,
    ): void => {
        try {
            const { text } = req.body;

            if (typeof text !== "string" || text.trim().length === 0) {
                res.status(400).json({
                    message:
                        "Field 'text' is required and must be a non-empty string",
                });
                return;
            }

            const newTodo: Todo = {
                id: crypto.randomUUID(),
                text: text.trim(),
            };

            todos.push(newTodo);

            res.status(201).json({
                message: "Todo created successfully",
                todo: newTodo,
            });
        } catch (error) {
            next(error);
        }
    },
);

router.put(
    "/:todoId",
    (
        req: Request<
            UpdateTodoParams,
            UpdateTodoSuccessResponse | ErrorResponse,
            UpdateTodoBody
        >,
        res: Response<UpdateTodoSuccessResponse | ErrorResponse>,
        next: NextFunction,
    ): void => {
        try {
            const { todoId } = req.params;
            const { text } = req.body;

            if (typeof text !== "string" || text.trim().length === 0) {
                res.status(400).json({
                    message:
                        "Field 'text' is required and must be a non-empty string",
                });
                return;
            }

            const todo = todos.find((item) => item.id === todoId);

            if (!todo) {
                res.status(404).json({
                    message: "Todo not found",
                });
                return;
            }

            todo.text = text.trim();

            res.status(200).json({
                message: "Todo updated successfully",
                todo,
            });
        } catch (error) {
            next(error);
        }
    },
);

router.delete(
    "/:todoId",
    (
        req: Request<
            DeleteTodoParams,
            DeleteTodoSuccessResponse | ErrorResponse
        >,
        res: Response<DeleteTodoSuccessResponse | ErrorResponse>,
        next: NextFunction,
    ): void => {
        try {
            const { todoId } = req.params;

            const initialLength = todos.length;
            todos = todos.filter((item) => item.id !== todoId);

            if (todos.length === initialLength) {
                res.status(404).json({
                    message: "Todo not found",
                });
                return;
            }

            res.status(200).json({
                message: "Todo deleted successfully",
            });
        } catch (error) {
            next(error);
        }
    },
);

export default router;
