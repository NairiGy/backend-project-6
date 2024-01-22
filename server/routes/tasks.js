import i18next from 'i18next';

export default (app) => {
  const { models } = app.objection;
  app
    .get('/tasks', { name: 'tasks' }, async (req, reply) => {
      const tasks = await models.task.query();
      reply.render('/tasks/index', { tasks });
      return reply;
    })
    .get('/tasks/new', { name: 'statuseNew' }, async (req, reply) => {
      const task = new models.task();
      reply.render('/tasks/new', { task });
    })
    .get('tasks/:id', { name: 'viewTask' }, async (req, reply) => {
      const { id } = req.params;
      const task = await app.objection.models.task.query().findOne({ id });

      reply.render('/tasks/view', { task });
    })
    .get('/tasks/:id/edit', { name: 'statuseUpdate' }, async (req, reply) => {
      const task = await models.task.query().where('id', req.params.id);
      if (!req.user) {
        req.flash('error', i18next.t('flash.tasks.edit.notLoggedIn'));
        reply.redirect(app.reverse('newSession'));
        return reply;
      }
      console.log(JSON.stringify(task));
      reply.render('task/edit', { task: task[0] });
      return reply;
    })
    .post('/tasks', async (req, reply) => {
      const task = new models.task();
      task.$set(req.body.data);
      console.log(JSON.stringify(req.body.data));
      try {
        const validStatus = await models.task.fromJson(req.body.data);
        await models.task.query().insert(validStatus);
        req.flash('info', i18next.t('flash.tasks.create.success'));
        reply.redirect(app.reverse('root'));
      } catch (e) {
        req.flash('error', i18next.t('flash.tasks.create.error'));
        console.log(e);
        reply.render('task/new', { task, errors: e });
      }
      return reply;
    })
    .patch('/tasks/:id', async (req, reply) => {
      const { id } = req.params;
      console.log('------------------PATCH USERS ID');
      const task = await app.objection.models.task.query().findOne({ id });
      try {
        await task.$query().patch(req.body.data);
        req.flash('info', i18next.t('flash.tasks.update.success'));
        reply.redirect(app.reverse('tasks'));
      } catch (e) {
        req.flash('error', i18next.t('flash.tasks.update.error'));
        console.log(e);
        reply.render('tasks/edit', { task, errors: e });
      }
      return reply;
    })
    .delete('/tasks/:id', async (req, reply) => {
      const { id } = req.params;
      const task = await models.task.query().findOne({ id });
      if (!req.user) {
        console.log('/users/:id/edit11111111111111111111111');
        req.flash('error', i18next.t('flash.tasks.edit.notLoggedIn'));
        reply.redirect(app.reverse('newSession'));
        return reply;
      }
      if (req.user.id != req.params.id) {
        console.log('/users/:id/edit222222222222222222222222');
        console.log(req.user);
        console.log(req.params.id);
        req.flash('error', i18next.t('flash.users.edit.notSameUser'));
        reply.redirect(app.reverse('users'));
        return reply;
      }
      try {
        req.logOut();
        await task.$query().delete();
        req.flash('info', i18next.t('flash.users.delete.success'));
        reply.redirect(app.reverse('users'));
      } catch (e) {
        req.flash('error', i18next.t('flash.users.delete.error'));
        console.log(e);
        reply.render('', { task, errors: e });
      }
      return reply;
    });
};
