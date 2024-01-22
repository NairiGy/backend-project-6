import i18next from 'i18next';

export default (app) => {
  const { models } = app.objection;
  app
    .get('/labels', { name: 'labels' }, async (req, reply) => {
      const labels = await models.label.query();
      reply.render('/labels/index', { labels });
      return reply;
    })
    .get('/labels/new', { name: 'statuseNew' }, async (req, reply) => {
      const label = new models.label();
      reply.render('/labels/new', { label });
    })
    .get('/labels/:id/edit', { name: 'statuseUpdate' }, async (req, reply) => {
      const label = await models.label.query().where('id', req.params.id);
      if (!req.user) {
        req.flash('error', i18next.t('flash.labels.edit.notLoggedIn'));
        reply.redirect(app.reverse('newSession'));
        return reply;
      }
      console.log(JSON.stringify(label));
      reply.render('label/edit', { label: label[0] });
      return reply;
    })
    .post('/labels', async (req, reply) => {
      const label = new models.label();
      label.$set(req.body.data);
      console.log(JSON.stringify(req.body.data));
      try {
        const validStatus = await models.label.fromJson(req.body.data);
        await models.label.query().insert(validStatus);
        req.flash('info', i18next.t('flash.labels.create.success'));
        reply.redirect(app.reverse('root'));
      } catch (e) {
        req.flash('error', i18next.t('flash.labels.create.error'));
        console.log(e);
        reply.render('label/new', { label, errors: e });
      }
      return reply;
    })
    .patch('/labels/:id', async (req, reply) => {
      const { id } = req.params;
      console.log('------------------PATCH USERS ID');
      const label = await app.objection.models.label.query().findOne({ id });
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
      const { id } = req.params;
      const label = await models.label.query().findOne({ id });
      if (!req.user) {
        console.log('/users/:id/edit11111111111111111111111');
        req.flash('error', i18next.t('flash.labels.edit.notLoggedIn'));
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
        await label.$query().delete();
        req.flash('info', i18next.t('flash.users.delete.success'));
        reply.redirect(app.reverse('users'));
      } catch (e) {
        req.flash('error', i18next.t('flash.users.delete.error'));
        console.log(e);
        reply.render('', { label, errors: e });
      }
      return reply;
    });
};
