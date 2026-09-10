import { Router } from 'express';
import authRouter from '../modules/auth/routes';
import taskRouter from '../modules/task/routes';

const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/tasks', taskRouter);

export default apiRouter;