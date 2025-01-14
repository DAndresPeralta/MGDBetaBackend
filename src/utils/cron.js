import cron from "node-cron";
import orderBetaModel from "../models/order.model.js";

cron.schedule("41 16 * * *", async () => {
  try {
    const vencimiento = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const result = await orderBetaModel.updateMany(
      { date: { $lt: vencimiento } },
      { $unset: { attach: "" } }
    );
    console.log("Attach eliminado mediante Cron");
  } catch (error) {
    console.error(`Error al ejecutar la tarea cron: ${error.message}`);
  }
});
