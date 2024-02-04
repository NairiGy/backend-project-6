// @ts-check
import { fastify } from 'fastify';
import init from '../server/plugin.js';
import { prepareTasksData, createRandomTask, signInUser } from './helpers/index.js';

describe('test tasks CUD', () => {
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
    await prepareTasksData(app);
  });

  it('create', async () => {
    const authCookie = await signInUser(app);
    const params = createRandomTask();
    const body = {
      method: 'POST',
      url: app.reverse('tasks'),
      payload: {
        data: params,
      },
    };

    const responseWithAuth = await app.inject({
      ...body,
      cookies: authCookie,
    });

    expect(responseWithAuth.statusCode).toBe(302);
    const task = await models.task.query().findOne({ id: 6 }).withGraphFetched('labels');
    task.labels = task.labels.map((label) => label.id);
    expect(task).toMatchObject(params);
  });

  it('update', async () => {
    const id = 1;
    const authCookie = await signInUser(app);
    const taskUpdateData = createRandomTask();
    const taskBefore = await models.task.query().findById(id).withGraphFetched('labels');
    const response = await app.inject({
      method: 'PATCH',
      url: `/tasks/${id}`,
      payload: {
        data: taskUpdateData,
      },
      cookies: authCookie,
    });

    expect(response.statusCode).toBe(302);
    const taskAfter = await models.task.query().findById(id).withGraphFetched('labels');
    const taskLabels = taskAfter.labels.map((label) => label.id);
    taskAfter.labels = taskLabels;
    expect({ ...taskBefore, ...taskUpdateData }).toEqual(taskAfter);
  });

  it('delete', async () => {
    const id = 1;
    const taskBefore = await models.task.query().findById(id).withGraphFetched('labels');
    const labelsBefore = taskBefore.labels.map((label) => label.id);
    const authCookie = await signInUser(app);
    const response = await app.inject({
      method: 'DELETE',
      url: `/tasks/${id}`,
      cookies: authCookie,
    });

    expect(response.statusCode).toBe(302);

    const deletedTask = await models.task.query().findById(id);
    expect(deletedTask).toBeUndefined();
    const deletedTaskLabels = await models.label.query().whereIn('id', labelsBefore).withGraphFetched('tasks');
    const taskIds = deletedTaskLabels.flatMap((label) => label.tasks.flatMap((task) => task.id));
    expect(taskIds).not.toContain(id);
  });

  it('filter', async () => {
    const authCookie = await signInUser(app);
    const tasks = await models.task.query().withGraphFetched('executor');
    // const expected = tasks.map((task) => task.executor.id);
    const response = await app.inject({
      method: 'GET',
      url: `/tasks?executor=${tasks[0].executor.id}`,
      cookies: authCookie,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    expect(response.statusCode).toBe(200);
  });

  it('show', async () => {
    const authCookie = await signInUser(app);
    const id = 1;
    const response = await app.inject({
      method: 'GET',
      url: `/tasks/${id}`,
      cookies: authCookie,
    });
    expect(response.statusCode).toBe(200);
  });
  afterEach(async () => {
    await knex.migrate.rollback();
  });

  afterAll(async () => {
    await app.close();
  });
});
