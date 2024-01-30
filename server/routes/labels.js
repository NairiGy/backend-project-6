import i18next from 'i18next';

export default (app) => {
  const Label = app.objection.models.label;
  app
    .get('/labels', { name: 'labels' }, async (req, reply) => {
      const labels = await Label.query();
      reply.render('/labels/index', { labels });
      return reply;
    })
    .get('/labels/new', { name: 'labelNew' }, (req, reply) => {
      const label = new Label();
      reply.render('/labels/new', { label });
    })
    .get('/labels/:id/edit', { name: 'labelUpdate' }, async (req, reply) => {
      const label = await Label.query().where('id', req.params.id);
      if (!req.user) {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('newSession'));
        return reply;
      }
      reply.render('labels/edit', { label: label[0] });
      return reply;
    })
    .post('/labels', async (req, reply) => {
      if (!req.isAuthenticated()) {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('newSession'));
        return reply;
      }
      const label = new Label();
      label.$set(req.body.data);
      try {
        const validLabel = await Label.fromJson(req.body.data);
        await Label.query().insert(validLabel);
        req.flash('info', i18next.t('flash.labels.create.success'));
        reply.redirect(app.reverse('labels'));
      } catch (e) {
        req.flash('error', i18next.t('flash.labels.create.error'));
        console.log(e);
        reply.render('labels/new', { label, errors: e });
      }
      return reply;
    })
    .patch('/labels/:id', async (req, reply) => {
      if (!req.isAuthenticated()) {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('newSession'));
        return reply;
      }
      const { id } = req.params;
      const label = await Label.query().findOne({ id });
      try {
        await label.$query().patch(req.body.data);
        req.flash('info', i18next.t('flash.labels.update.success'));
        reply.redirect(app.reverse('labels'));
      } catch (e) {
        req.flash('error', i18next.t('flash.labels.update.error'));
        console.log(e);
        reply.render('labels/edit', { label, errors: e });
      }
      return reply;
    })
    .delete('/labels/:id', async (req, reply) => {
      if (!req.isAuthenticated()) {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('newSession'));
        return reply;
      }
      const { id } = req.params;
      const label = await Label.query().findOne({ id });
      const labelWithTasks = await Label.query().findById(id).withGraphFetched('tasks');
      if (labelWithTasks.tasks?.length > 0) {
        req.flash('error', i18next.t('flash.labels.edit.labelConnectedToTask'));
        reply.redirect(app.reverse('labels'));
        return reply;
      }
      try {
        await label.$query().delete();
        req.flash('info', i18next.t('flash.labels.delete.success'));
        reply.redirect(app.reverse('labels'));
      } catch (e) {
        req.flash('error', i18next.t('flash.labels.delete.error'));
        console.log(e);
        reply.render('', { label, errors: e });
      }
      return reply;
    });
};
