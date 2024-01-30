// @ts-check
import { fastify } from 'fastify';
import init from '../server/plugin.js';
import { prepareLabelsData, createRandomLabel, signInUser } from './helpers/index.js';

describe('test labels CRUD', () => {
  let app;
  let knex;
  let models;

  beforeAll(async () => {
    app = fastify({
      exposeHeadRoutes: false,
      logger: { transport: { target: 'pino-pretty' } },
    });
    await init(app);
    knex = app.objection.knex;
    models = app.objection.models;
  });

  beforeEach(async () => {
    await knex.migrate.latest();
    await prepareLabelsData(app);
  });

  it('index', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('labels'),
    });

    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('labelNew'),
    });

    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    const params = createRandomLabel();
    const body = {
      method: 'POST',
      url: app.reverse('labels'),
      payload: {
        data: params,
      },
    };
    const authCookie = await signInUser(app);
    const responseWithAuth = await app.inject({
      ...body,
      cookies: authCookie,
    });
    expect(responseWithAuth.statusCode).toBe(302);
    const label = await models.label.query().findOne({ name: params.name });
    expect(label).toMatchObject(params);
  });

  it('update', async () => {
    const id = 1;
    const statusUpdateData = createRandomLabel();
    const body = {
      method: 'PATCH',
      url: `/labels/${id}`,
      payload: {
        data: statusUpdateData,
      },
    };
    const labelBefore = await models.label.query().findById(id);
    const authCookie = await signInUser(app);
    const responseWithAuth = await app.inject({
      ...body,
      cookies: authCookie,
    });

    expect(responseWithAuth.statusCode).toBe(302);

    const labelAfter = await models.label.query().findById(id);
    expect({ ...labelBefore, ...statusUpdateData }).toMatchObject(labelAfter);
  });

  it('delete', async () => {
    const id = 1;
    const authCookie = await signInUser(app);
    const response = await app.inject({
      method: 'DELETE',
      url: `/labels/${id}`,
      cookies: authCookie,
    });

    expect(response.statusCode).toBe(302);

    const deletedLabel = await models.label.query().findById(id);
    expect(deletedLabel).toBeUndefined();
  });

  afterEach(async () => {
    await knex.migrate.rollback();
  });

  afterAll(async () => {
    await app.close();
  });
});
