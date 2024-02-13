// @ts-check

import { URL } from 'url';
import fs from 'fs';
import path from 'path';
import { faker } from '@faker-js/faker';

const getFixturePath = (filename) => path.join('..', '..', '__fixtures__', filename);
const readFixture = (filename) => fs.readFileSync(new URL(getFixturePath(filename), import.meta.url), 'utf-8').trim();
const getFixtureData = (filename) => JSON.parse(readFixture(filename));

export const getTestData = () => getFixtureData('testData.json');

export const prepareUsersData = async (app) => {
  const { knex } = app.objection;

  await knex('users').insert(getFixtureData('users.json'));
};

export const createRandomStatus = () => ({
  name: faker.word.adjective(),
});
export const createRandomLabel = () => ({
  name: faker.word.adjective(),
});

export const createRandomTask = () => ({
  name: faker.lorem.sentence(),
  description: faker.lorem.paragraph(),
  statusId: faker.number.int({ min: 1, max: 5 }),
  executorId: faker.number.int({ min: 1, max: 5 }),
  labels: [1, 3],
});

export const prepareStatusesData = async (app) => {
  const { knex } = app.objection;
  const statuses = Array(5).fill().map(createRandomStatus);

  await knex('statuses').insert(statuses);
};
export const prepareLabelsData = async (app) => {
  const { knex } = app.objection;
  const labels = Array(5).fill().map(createRandomLabel);

  await knex('labels').insert(labels);
};

export const prepareTasksData = async (app) => {
  const { knex } = app.objection;
  prepareUsersData(app);
  prepareLabelsData(app);
  prepareStatusesData(app);
  const users = await knex('users').select();
  const statuses = await knex('statuses').select();

  const tasks = Array(5).fill().map(() => ({
    name: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    status_id: faker.number.int({ min: 1, max: statuses.length }),
    executor_id: faker.number.int({ min: 1, max: users.length }),
    creator_id: faker.number.int({ min: 1, max: users.length }),
  }));

  await knex('tasks').insert(tasks);
  const taskLabels = [
    { taskId: 1, labelId: 1 },
    { taskId: 1, labelId: 2 },
    { taskId: 1, labelId: 3 },
    { taskId: 1, labelId: 4 },
    { taskId: 1, labelId: 5 },
    { taskId: 2, labelId: 1 },
    { taskId: 3, labelId: 1 },
    { taskId: 3, labelId: 2 },
    { taskId: 4, labelId: 4 },
    { taskId: 4, labelId: 5 },
    { taskId: 5, labelId: 1 },
    { taskId: 5, labelId: 5 },
  ];

  await knex('tasks_labels').insert(taskLabels);
};

export const signInUser = async (app) => {
  prepareUsersData(app);
  const responseSignIn = await app.inject({
    method: 'POST',
    url: '/session',
    payload: {
      data: getTestData().users.existing,
    },
  });

  const [sessionCookie] = responseSignIn.cookies;
  const { name, value } = sessionCookie;

  return { [name]: value };
};

export const truncateTables = async (knex) => {
  await Promise.all([
    knex('tasks').truncate(),
    knex('tasks_labels').truncate(),
    knex('labels').truncate(),
    knex('users').truncate(),
    knex('statuses').truncate(),
  ]);
};
