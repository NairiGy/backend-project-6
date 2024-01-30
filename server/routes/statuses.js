import i18next from 'i18next';

export default (app) => {
  const Status = app.objection.models.status;
  const Task = app.objection.models.task;
  app
    .get('/statuses', { name: 'statuses' }, async (req, reply) => {
      const statuses = await Status.query();
      reply.render('/statuses/index', { statuses });
      return reply;
    })
    .get('/statuses/new', { name: 'statusNew' }, (req, reply) => {
      const status = new Status();
      reply.render('/statuses/new', { status });
    })
    .get('/statuses/:id/edit', { name: 'statusUpdate' }, async (req, reply) => {
      const status = await Status.query().where('id', req.params.id);
      if (!req.user) {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('newSession'));
        return reply;
      }
      console.log(JSON.stringify(status));
      reply.render('statuses/edit', { status: status[0] });
      return reply;
    })
    .post('/statuses', async (req, reply) => {
      if (!req.isAuthenticated()) {
        req.flash('error', i18next.t('flash.authError'));
        reply.status(401);
        reply.redirect(app.reverse('newSession'));
        return reply;
      }
      const status = new Status();
      status.$set(req.body.data);
      console.log(JSON.stringify(req.body.data));
      try {
        const validStatus = await Status.fromJson(req.body.data);
        await Status.query().insert(validStatus);
        req.flash('info', i18next.t('flash.statuses.create.success'));
        reply.redirect(app.reverse('statuses'));
      } catch (e) {
        req.flash('error', i18next.t('flash.statuses.create.error'));
        console.log(e);
        reply.render('statuses/new', { status, errors: e });
      }
      return reply;
    })
    .patch('/statuses/:id', async (req, reply) => {
      if (!req.isAuthenticated()) {
        req.flash('error', i18next.t('flash.authError'));
        reply.status(401);
        reply.redirect(app.reverse('newSession'));
        return reply;
      }
      const { id } = req.params;
      console.log('------------------PATCH labels ID');
      const status = await Status.query().findOne({ id });
      try {
        await status.$query().patch(req.body.data);
        req.flash('info', i18next.t('flash.statuses.update.success'));
        reply.redirect(app.reverse('statuses'));
      } catch (e) {
        req.flash('error', i18next.t('flash.statuses.update.error'));
        console.log(e);
        reply.render('statuses/edit', { status, errors: e });
      }
      return reply;
    })
    .delete('/statuses/:id', async (req, reply) => {
      if (!req.isAuthenticated()) {
        req.flash('error', i18next.t('flash.authError'));
        reply.status(401);
        reply.redirect(app.reverse('newSession'));
        return reply;
      }
      const { id } = req.params;
      const status = await Status.query().findOne({ id });
      const tasks = await Task
        .query()
        .where('statusId', id);

      if (tasks.length > 0) {
        req.flash('error', i18next.t('flash.statuses.delete.statusConnectedToTask'));
        reply.redirect(app.reverse('statuses'));
        return reply;
      }
      try {
        await status.$query().delete();
        req.flash('info', i18next.t('flash.labels.delete.success'));
        reply.redirect(app.reverse('statuses'));
      } catch (e) {
        req.flash('error', i18next.t('flash.labels.delete.error'));
        console.log(e);
        reply.render('', { status, errors: e });
      }
      return reply;
    });
};
