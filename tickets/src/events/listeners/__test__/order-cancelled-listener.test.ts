import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import mongoose from 'mongoose';
import { OrderCancelledEvent } from '@cgtickets/common';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const orderId = mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    title: 'concert',
    price: 40,
    userId: 'sdsdsd',
  });
  ticket.set({ orderId });

  await ticket.save();

  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, orderId, ticket, data, msg };
};

it('update the ticket, publishes an event and ack the message', async () => {
  const { listener, orderId, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updateTicket = await Ticket.findById(ticket.id);
  expect(updateTicket!.orderId).not.toBeDefined();
  expect(msg.ack).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
