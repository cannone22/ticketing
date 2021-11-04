import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

it('return a 404 if the provider id does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'sdsff',
      price: 20,
    })
    .expect(404);
});

it('return a 401 if the user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'sdsff',
      price: 20,
    })
    .expect(401);
});

it('return a 401 if the user does not own the ticket ', async () => {
  const response = await request(app)
  .post('/api/tickets')
  .set('Cookie', global.signin())
  .send({
    title: 'frrgrgrg',
    price: 20
  });
  
  await request(app)
  .put(`/api/tickets/${response.body.id}`)
  .set('Cookie', global.signin())
  .send({
    title: 'rerererr',
    price: 300
  })
  .expect(401);
});

it('return a 400 if the user provide an ivalid price or title', async () => {
  const cookie = global.signin();

  const response = await request(app)
  .post('/api/tickets')
  .set('Cookie', cookie)
  .send({
    title: 'ttrrtrt',
    price: 50
  });
  await request(app)
  .put(`/api/tickets/${response.body.id}`)
  .set('Cookie', cookie)
  .send({
    title: '',
    price: 50
  })
  .expect(400);
});

it('updates the ticket provided valid inputs', async () => {
  const cookie = global.signin();

  const response = await request(app)
  .post('/api/tickets')
  .set('Cookie', cookie)
  .send({
    title: 'concert',
    price: 50
  });
  await request(app)
  .put(`/api/tickets/${response.body.id}`)
  .set('Cookie', cookie)
  .send({
    title: 'title',
    price: 60
  })
  .expect(200)

  const ticketResponse = await request(app)
  .get(`/api/tickets/${response.body.id}`)
  .send();

  expect(ticketResponse.body.title).toEqual('title');
  expect(ticketResponse.body.price).toEqual('60');

});

it('publishes an event ', async () => {
  const cookie = global.signin();

  const response = await request(app)
  .post('/api/tickets')
  .set('Cookie', cookie)
  .send({
    title: 'ttrrtrt',
    price: 50
  });
  await request(app)
  .put(`/api/tickets/${response.body.id}`)
  .set('Cookie', cookie)
  .send({
    title: 'title',
    price: 60
  })
  .expect(200)

  expect(natsWrapper.client.publish).toHaveBeenCalled();
})

it('reject a ticket if it was reserved', async () => {
  const cookie = global.signin();

  const response = await request(app)
  .post('/api/tickets')
  .set('Cookie', cookie)
  .send({
    title: 'ttrrtrt',
    price: 50
  });

  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({ orderId: mongoose.Types.ObjectId().toHexString() });
  await ticket!.save();

  await request(app)
  .put(`/api/tickets/${response.body.id}`)
  .set('Cookie', cookie)
  .send({
    title: 'title',
    price: 60
  })
  .expect(400)

})