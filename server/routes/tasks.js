/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import i18next from 'i18next';
import { transaction } from 'objection';
import _ from 'lodash';

/**
 * Maps each item with a selected flag based on the provided ids.
 *
 * @param {Array} items - The array of items to be mapped.
 * @param {Array} ids - The array of selected item ids.
 * @return {Array} The mapped array with selected flag added to each item.
 */
const getSelectedItems = (items, ids) => items.map((item) => ({
  ...item,
  selected: ids.includes(item.id),
}));

export default (app) => {
  const Task = app.objection.models.task;
  const Status = app.objection.models.status;
  const User = app.objection.models.user;
  const Label = app.objection.models.label;
  app
    .get('/tasks', { name: 'tasks' }, async (req, reply) => {
      const statuses = await Status.query();
      const users = await User.query();
      const labels = await Label.query();
      let query = Task.query().withGraphFetched('[status, creator, executor, labels]');
      if (req.query.isCreatorUser) {
        query = query.where('creatorId', req.user.id);
      }
      if (req.query.status) {
        query = query.where('statusId', req.query.status);
      }
      if (req.query.executor) {
        query = query.where('executorId', req.query.executor);
      }
      if (req.query.label) {
        query = query.joinRelated('labels').where('labels.id', req.query.label);
      } else {
        query = query.withGraphFetched('labels');
      }
      const tasks = await query;

      reply.render('/tasks/index', {
        tasks, statuses, users, labels,
      });

      return reply;
    })
    .get('/tasks/new', { name: 'taskNew' }, async (req, reply) => {
      const task = new Task();
      const statuses = await Status.query();
      const users = await User.query();
      const labels = await Label.query();
      reply.render('tasks/new', {
        task, statuses, users, labels,
      });
      return reply;
    })
    .get('/tasks/:id', { name: 'viewTask' }, async (req, reply) => {
      const { id } = req.params;
      const task = await Task.query().findOne({ id }).withGraphFetched('[status, creator, executor, labels]');
      console.log(JSON.stringify(task));
      reply.render('/tasks/view', { task });
      return reply;
    })
    .get('/tasks/:id/edit', { name: 'taskUpdate' }, async (req, reply) => {
      if (!req.user) {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('newSession'));
        return reply;
      }
      const { id } = req.params;
      const task = await Task.query().findOne({ id });
      const statuses = await Status.query();
      const users = await User.query();
      const labels = await Label.query();
      const relatedLabels = await task.$relatedQuery('labels');
      const relatedLabelsIds = relatedLabels.map((label) => label.id);
      const statusesWithSelected = getSelectedItems(statuses, [task.statusId]);
      const usersWithSelected = getSelectedItems(users, [task.executorId]);
      const labelsWithSelected = getSelectedItems(labels, relatedLabelsIds);
      reply.render('tasks/edit', {
        task,
        statuses: statusesWithSelected,
        users: usersWithSelected,
        labels: labelsWithSelected,
      });
      return reply;
    })
    .post('/tasks', async (req, reply) => {
      if (!req.isAuthenticated()) {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('newSession'));
        return reply;
      }
      const task = new Task();
      try {
        const { labels } = req.body.data;
        const data = {
          ..._.omit(req.body.data, 'labels'),
          statusId: Number(req.body.data.statusId),
          executorId: Number(req.body.data.executorId),
          creatorId: req.user.id,
        };
        await transaction(Task.knex(), async (trx) => {
          task.$set(data);
          const validTask = await Task.fromJson(data);
          const insertedTask = await Task.query(trx).insert(validTask);
          const toInsert = [labels].flat().map((lb) => Number(lb));
          for (const labelId of toInsert) {
            await insertedTask.$relatedQuery('labels', trx).relate(labelId);
          }
        });
        req.flash('info', i18next.t('flash.tasks.create.success'));
        reply.redirect(app.reverse('tasks'));
      } catch (e) {
        req.flash('error', i18next.t('flash.tasks.create.error'));
        console.log(e);
        const statuses = await Status.query();
        const users = await User.query();
        const labels = await Label.query();
        reply.render('tasks/new', {
          task, statuses, users, labels, errors: e,
        });
      }
      return reply;
    })
    .patch('/tasks/:id', async (req, reply) => {
      if (!req.isAuthenticated()) {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('newSession'));
        return reply;
      }
      const { id } = req.params;
      const task = await Task.query().findOne({ id });
      try {
        await transaction(Task.knex(), async (trx) => {
          await task.$query(trx).patch({
            ..._.omit(req.body.data, 'labels'),
            statusId: Number(req.body.data.statusId),
            executorId: Number(req.body.data.executorId),
          });
          await task.$relatedQuery('labels', trx).unrelate();
          const newLabels = [req.body.data.labels].flat();
          const toInsert = newLabels.map((lb) => Number(lb));
          for (const labelId of toInsert) {
            await task.$relatedQuery('labels', trx).relate(labelId);
          }
        });
        req.flash('info', i18next.t('flash.tasks.update.success'));
        reply.redirect(app.reverse('tasks'));
      } catch (e) {
        req.flash('error', i18next.t('flash.tasks.update.error'));
        console.log(e);
        const relatedLabels = await task.$relatedQuery('labels');
        const relatedLabelsIds = relatedLabels.map((label) => label.id);
        const statuses = await Status.query();
        const users = await User.query();
        const labels = await Label.query();
        const statusesWithSelected = getSelectedItems(statuses, [task.statusId]);
        const usersWithSelected = getSelectedItems(users, [task.executorId]);
        const labelsWithSelected = getSelectedItems(labels, relatedLabelsIds);
        reply.render('tasks/edit', {
          task,
          statuses: statusesWithSelected,
          users: usersWithSelected,
          labels: labelsWithSelected,
        });
      }
      return reply;
    })
    .delete('/tasks/:id', async (req, reply) => {
      if (!req.isAuthenticated()) {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('newSession'));
        return reply;
      }
      const { id } = req.params;
      const task = await Task.query().findOne({ id });
      try {
        await transaction(Task.knex(), async (trx) => {
          await task.$relatedQuery('labels', trx).unrelate();
          await task.$query(trx).delete();
        });
        req.flash('info', i18next.t('flash.tasks.delete.success'));
        reply.redirect(app.reverse('tasks'));
      } catch (e) {
        req.flash('error', i18next.t('flash.tasks.delete.error'));
        console.log(e);
        reply.render('', { task, errors: e });
      }
      return reply;
    });
};
