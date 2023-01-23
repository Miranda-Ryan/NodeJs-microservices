import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  validateRequest,
  NotFoundError,
  requireAuth,
  NotAuthorizedError,
  BadRequestError
} from "@rjmtix/common";
import { Ticket } from "../models/ticket";
import { TicketUpdatedPublisher } from "../events/publishers/ticketUpdatedPublisher";
import { natsWrapper } from "../natsWrapper";

const router = express.Router();

router.put(
  "/api/tickets/:id",
  requireAuth,
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Price must be provided and greater than 0")
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const ticketId = req.params.id;
    const ticket = await Ticket.findOne({ id: ticketId });
    if (!ticket) {
      throw new NotFoundError("Ticket");
    }

    if(ticket.orderId) {
      throw new BadRequestError('Ticket is already reserved')
    }

    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    ticket.set({ title: req.body.title, price: req.body.price });
    await ticket.save();

    await new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version
    });

    return res.status(200).send(ticket);
  }
);

export { router as updateTicketRouter };
