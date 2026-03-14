import express, {
    type Request,
    type Response,
    type NextFunction,
} from "express";

import todosRoutes from "./routes/todos";

const app = express();

app.use(express.json());

app.use("/todos", todosRoutes);

app.use((req: Request, res: Response) => {
    res.status(404).json({
        message: "Route not found",
    });
});

app.use(
    (error: Error, req: Request, res: Response, next: NextFunction): void => {
        console.error(error);

        res.status(500).json({
            message: "Internal server error",
        });
    },
);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
