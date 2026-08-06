import { clientCache } from "@middlewares/cache.js";
import appConfig from "@configs/app.config.js";
import express from "express";
import errorHandler from "@middlewares/errorHandler.js";
import otakudesuRouter from "@routes/otakudesu.routes.js";
import samehadakuRouter from "@routes/samehadaku.routes.js";
import kuramanimeRouter from "@routes/kuramanime.routes.js";
import oploverzRouter from "@routes/oploverz.routes.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { PORT } = appConfig;
const app = express();

app.use(cors());
app.use(clientCache(1));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/meanim-api-explorer.html"));
});

app.use("/otakudesu", otakudesuRouter);
app.use("/kuramanime", kuramanimeRouter);
app.use("/samehadaku", samehadakuRouter);
app.use("/oploverz", oploverzRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});