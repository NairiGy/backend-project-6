import i18next from 'i18next';

export default (app) => {
  const { models } = app.objection;
  app
    .get('/statuses', { name: 'statuses' }, async (req, reply) => {
      const statuses = await models.status.query();
      reply.render('/statuses/index', { statuses });
      return reply;
    })
    .get('/statuses/new', { name: 'statuseNew' }, async (req, reply) => {
      const status = new models.status();
      reply.render('/statuses/new', { status });
    })
    .get('/statuses/:id/edit', { name: 'statuseUpdate' }, async (req, reply) => {
      const status = await models.status.query().where('id', req.params.id);
      if (!req.user) {
        req.flash('error', i18next.t('flash.statuses.edit.notLoggedIn'));
        reply.redirect(app.reverse('newSession'));
        return reply;
      }
      console.log(JSON.stringify(status));
      reply.render('status/edit', { status: status[0] });
      return reply;
    })
    .post('/statuses', async (req, reply) => {
      const status = new models.status();
      status.$set(req.body.data);
      console.log(JSON.stringify(req.body.data));
      try {
        const validStatus = await models.status.fromJson(req.body.data);
        await models.status.query().insert(validStatus);
        req.flash('info', i18next.t('flash.statuses.create.success'));
        reply.redirect(app.reverse('root'));
      } catch (e) {
        req.flash('error', i18next.t('flash.statuses.create.error'));
        console.log(e);
        reply.render('status/new', { status, errors: e });
      }
      return reply;
    })
    .patch('/statuses/:id', async (req, reply) => {
      const { id } = req.params;
      console.log('------------------PATCH USERS ID');
      const status = await app.objection.models.status.query().findOne({ id });
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
      const { id } = req.params;
      const status = await models.status.query().findOne({ id });
      if (!req.user) {
        console.log('/users/:id/edit11111111111111111111111');
        req.flash('error', i18next.t('flash.statuses.edit.notLoggedIn'));
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
        await status.$query().delete();
        req.flash('info', i18next.t('flash.users.delete.success'));
        reply.redirect(app.reverse('users'));
      } catch (e) {
        req.flash('error', i18next.t('flash.users.delete.error'));
        console.log(e);
        reply.render('', { status, errors: e });
      }
      return reply;
    });
};
