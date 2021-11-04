import { Publisher, OrderCreatedEvent, Subjects } from "@cgtickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
} 
