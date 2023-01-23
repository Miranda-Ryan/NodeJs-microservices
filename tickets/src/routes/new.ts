import express, { Request, Response } from "express";
import { requireAuth, validateRequest } from "@rjmtix/common";
import { body } from "express-validator";
import { ITicketAttrs, Ticket } from "../models/ticket";
import { TicketCreatedPublisher } from "../events/publishers/ticketCreatedPublisher";
import { natsWrapper } from "../natsWrapper";

const router = express.Router();

router.post(
  "/api/tickets",
  requireAuth,
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("price").isFloat({ gt: 0 }).withMessage("Price must be greater than 0")
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;
    const ticket = new Ticket<ITicketAttrs>({
      title,
      price,
      userId: req.currentUser!.id
    });

    await ticket.save();

    await new TicketCreatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version
    });

    return res.status(201).send(ticket);
  }
);

export { router as createTicketRouter };
