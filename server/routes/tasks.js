import i18next from 'i18next';

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

const fetchData = async (Status, User, Label) => {
  const [statuses, users, labels] = await Promise.all([
    Status.query(),
    User.query(),
    Label.query(),
  ]);
  return { statuses, users, labels };
};

const processData = async (task, statuses, users, labels) => {
  const relatedLabels = await task.$relatedQuery('labels');
  const relatedLabelsIds = relatedLabels.map((label) => label.id);

  const statusesWithSelected = getSelectedItems(statuses, [task.statusId]);
  const usersWithSelected = getSelectedItems(users, [task.executorId]);
  const labelsWithSelected = getSelectedItems(labels, relatedLabelsIds);

  return { statuses: statusesWithSelected, users: usersWithSelected, labels: labelsWithSelected };
};

export default (app) => {
  const Task = app.objection.models.task;
  const Status = app.objection.models.status;
  const User = app.objection.models.user;
  const Label = app.objection.models.label;
  app
    .get('/tasks', { name: 'tasks', preValidation: app.authenticate }, async (req, reply) => {
      const { statuses, users, labels } = await fetchData(Status, User, Label);
      const form = {};
      let query = Task.query().withGraphFetched('[status, creator, executor, labels]');
      if (req.query.isCreatorUser) {
        query = query.where('creatorId', req.user.id);
        form.isCreatorUser = true;
      }
      if (req.query.status) {
        query = query.where('statusId', req.query.status);
        form.statusId = Number(req.query.status);
      }
      if (req.query.executor) {
        query = query.where('executorId', req.query.executor);
        form.executorId = Number(req.query.executor);
      }
      if (req.query.label) {
        query = query.joinRelated('labels').where('labels.id', req.query.label);
        form.labelId = Number(req.query.label);
      } else {
        query = query.withGraphFetched('labels');
      }
      const tasks = await query;
      reply.render('/tasks/index', {
        tasks, statuses, users, labels, form,
      });

      return reply;
    })
    .get('/tasks/new', { name: 'newTask', preValidation: app.authenticate }, async (req, reply) => {
      const task = new Task();
      const { statuses, users, labels } = await fetchData(Status, User, Label);
      reply.render('tasks/new', {
        task, statuses, users, labels,
      });
      return reply;
    })
    .get('/tasks/:id', { name: 'viewTask' }, async (req, reply) => {
      const { id } = req.params;
      const task = await Task.query().findOne({ id }).withGraphFetched('[status, creator, executor, labels]');
      reply.render('/tasks/view', { task });
      return reply;
    })
    .get('/tasks/:id/edit', { name: 'taskUpdate', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params;
      const task = await Task.query().findOne({ id });
      const { statuses, users, labels } = await fetchData(Status, User, Label);
      const relatedData = await processData(task, statuses, users, labels);
      reply.render('tasks/edit', {
        task,
        ...relatedData,
      });
      return reply;
    })
    .post('/tasks', { preValidation: app.authenticate }, async (req, reply) => {
      const task = new Task();
      try {
        const labelIds = [req.body.data?.labels ?? []].flat();
        const labels = await Label.query().whereIn('id', labelIds);
        const taskData = {
          name: req.body.data.name,
          description: req.body.data.description,
          statusId: Number(req.body.data.statusId),
          executorId: Number(req.body.data.executorId),
          creatorId: req.user.id,
          labels,
        };
        await Task.transaction(async (trx) => {
          const insertedTask = await Task.query(trx)
            .allowGraph('labels')
            .upsertGraph(taskData, {
              relate: true, unrelate: true, noDelete: true,
            });
          return insertedTask;
        });
        req.flash('info', i18next.t('flash.tasks.create.success'));
        reply.redirect(app.reverse('tasks'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.tasks.create.error'));
        const statuses = await Status.query();
        const users = await User.query();
        const labels = await Label.query();
        reply.render('tasks/new', {
          task, statuses, users, labels, errors: data,
        });
      }
      return reply;
    })
    .patch('/tasks/:id', { preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params;
      const task = await Task.query().findOne({ id });
      try {
        const labelIds = [req.body.data?.labels ?? []].flat().map(Number);
        const labels = await Label.query().whereIn('id', labelIds);
        const taskData = {
          id: Number(id),
          name: req.body.data.name,
          description: req.body.data.description,
          statusId: Number(req.body.data.statusId),
          executorId: Number(req.body.data.executorId),
          creatorId: task.creatorId,
          labels,
        };
        await Task.transaction(async (trx) => {
          const updatedTask = await Task.query(trx)
            .allowGraph('labels')
            .upsertGraph(taskData, {
              relate: true, unrelate: true, noDelete: true,
            });

          return updatedTask;
        });
        req.flash('info', i18next.t('flash.tasks.update.success'));
        reply.redirect(app.reverse('tasks'));
      } catch (e) {
        req.flash('error', i18next.t('flash.tasks.update.error'));
        const { statuses, users, labels } = await fetchData(Status, User, Label);
        const relatedData = await processData(task, statuses, users, labels);
        reply.render('tasks/edit', {
          task,
          ...relatedData,
        });
      }
      return reply;
    })
    .delete('/tasks/:id', { preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params;
      const task = await Task.query().findOne({ id });
      try {
        Task.transaction(async (trx) => {
          await task.$relatedQuery('labels', trx).unrelate();
          await task.$query(trx).delete();
        });
        req.flash('info', i18next.t('flash.tasks.delete.success'));
        reply.redirect(app.reverse('tasks'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.tasks.delete.error'));
        reply.redirect(app.reverse('tasks'), { task, errors: data });
      }
      return reply;
    });
};
