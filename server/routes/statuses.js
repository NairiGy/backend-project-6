import i18next from 'i18next';

export default (app) => {
  const Status = app.objection.models.status;
  const Task = app.objection.models.task;
  app
    .get('/statuses', { name: 'statuses', preValidation: app.authenticate }, async (req, reply) => {
      const statuses = await Status.query();
      reply.render('/statuses/index', { statuses });
      return reply;
    })
    .get('/statuses/new', { name: 'newStatus', preValidation: app.authenticate }, (req, reply) => {
      const status = new Status();
      reply.render('/statuses/new', { status });
    })
    .get('/statuses/:id/edit', { name: 'statusUpdate', preValidation: app.authenticate }, async (req, reply) => {
      const status = await Status.query().where('id', req.params.id);
      console.log(JSON.stringify(status));
      reply.render('statuses/edit', { status: status[0] });
      return reply;
    })
    .post('/statuses', { preValidation: app.authenticate }, async (req, reply) => {
      const status = new Status();
      status.$set(req.body.data);
      console.log(JSON.stringify(req.body.data));
      try {
        const validStatus = await Status.fromJson(req.body.data);
        await Status.query().insert(validStatus);
        req.flash('info', i18next.t('flash.statuses.create.success'));
        reply.redirect(app.reverse('statuses'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.statuses.create.error'));
        reply.render('statuses/new', { status, errors: data });
      }
      return reply;
    })
    .patch('/statuses/:id', { preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params;
      const status = await Status.query().findOne({ id });
      try {
        await status.$query().patch(req.body.data);
        req.flash('info', i18next.t('flash.statuses.update.success'));
        reply.redirect(app.reverse('statuses'));
      } catch (e) {
        req.flash('error', i18next.t('flash.statuses.update.error'));
        reply.render('statuses/edit', { status, errors: e });
      }
      return reply;
    })
    .delete('/statuses/:id', { preValidation: app.authenticate }, async (req, reply) => {
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
        req.flash('info', i18next.t('flash.statuses.delete.success'));
        reply.redirect(app.reverse('statuses'));
      } catch (e) {
        req.flash('error', i18next.t('flash.statuses.delete.error'));
        reply.render('', { status, errors: e });
      }
      return reply;
    });
};
