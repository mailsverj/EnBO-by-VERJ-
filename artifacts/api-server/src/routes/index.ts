import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import applicationsRouter from "./applications.js";
import usersRouter from "./users.js";
import bdosRouter from "./bdos.js";
import leadsRouter from "./leads.js";
import customersRouter from "./customers.js";
import designsRouter from "./designs.js";
import inventoryRouter from "./inventory.js";
import invoicesRouter from "./invoices.js";
import commissionsRouter from "./commissions.js";
import expensesRouter from "./expenses.js";
import financeRouter from "./finance.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(applicationsRouter);
router.use(usersRouter);
router.use(bdosRouter);
router.use(leadsRouter);
router.use(customersRouter);
router.use(designsRouter);
router.use(inventoryRouter);
router.use(invoicesRouter);
router.use(commissionsRouter);
router.use(expensesRouter);
router.use(financeRouter);

export default router;
