import { NotFoundError } from "@rjmtix/common";
import express, { Request, Response } from "express";
import { Ticket, ITicketAttrs } from "../models/ticket";

const router = express.Router();

router.get("/api/tickets/:id", async (req: Request, res: Response) => {
  const ticketId = req.params.id;
  const ticket = await Ticket.findOne({ id: ticketId });
  if (!ticket) {
    throw new NotFoundError("Ticket");
  }
  return res.status(200).send(ticket);
});

export { router as showTicketRouter };
