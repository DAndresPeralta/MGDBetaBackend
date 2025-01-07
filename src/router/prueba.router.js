import express from "express";

// -- Utils
import { authorization, passportCall } from "../utils/auth.js";

const router = express.Router();

router.get("/test", passportCall("jwt"), authorization("ADMIN"), (req, res) => {
  res.send("Hola mundo");
});

export default router;
