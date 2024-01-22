// @ts-check

import i18next from 'i18next';

export default (app) => {
  const { models } = app.objection;
  app
    .get('/users', { name: 'users' }, async (req, reply) => {
      const users = await models.user.query();
      console.log('/users/----------------------');
      reply.render('users/index', { users });
      return reply;
    })
    .get('/users/new', { name: 'newUser' }, (req, reply) => {
      const user = new models.user();
      console.log('/users/new----------------------');
      reply.render('users/new', { user });
    })
    .get('/users/:id', async (req, reply) => {
      const user = await models.user.query().where('id', req.params.id);
      console.log('/users/:id/edit---------------------');
      if (!req.user) {
        console.log('/users/:id/edit11111111111111111111111');
        req.flash('error', i18next.t('flash.users.edit.notLoggedIn'));
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
      console.log(JSON.stringify(user));
      reply.render('users/edit', { user: user[0] });
      return reply;
    })
    .post('/users', async (req, reply) => {
      const user = new models.user();
      user.$set(req.body.data);
      console.log('.post(/users)----------------');
      console.log(JSON.stringify(req.body.data));
      try {
        const validUser = await app.objection.models.user.fromJson(req.body.data);
        await models.user.query().insert(validUser);
        req.flash('info', i18next.t('flash.users.create.success'));
        reply.redirect(app.reverse('root'));
      } catch (e) {
        req.flash('error', i18next.t('flash.users.create.error'));
        console.log(e);
        reply.render('users/new', { user, errors: e });
      }

      return reply;
    })
    .patch('/users/:id', { name: 'editUser' }, async (req, reply) => {
      const { id } = req.params;
      console.log('------------------PATCH USERS ID');
      const user = await app.objection.models.user.query().findOne({ id });
      try {
        await user.$query().patch(req.body.data);
        req.flash('info', i18next.t('flash.users.update.success'));
        reply.redirect(app.reverse('users'));
      } catch (e) {
        req.flash('error', i18next.t('flash.users.update.error'));
        console.log(e);
        reply.render('users/edit', { user, errors: e });
      }
      return reply;
    })
    .delete('/users/:id', { name: 'deleteUser' }, async (req, reply) => {
      const { id } = req.params;
      const user = await models.user.query().findOne({ id });
      if (!req.user) {
        console.log('/users/:id/edit11111111111111111111111');
        req.flash('error', i18next.t('flash.users.edit.notLoggedIn'));
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
        await user.$query().delete();
        req.flash('info', i18next.t('flash.users.delete.success'));
        reply.redirect(app.reverse('users'));
      } catch (e) {
        req.flash('error', i18next.t('flash.users.delete.error'));
        console.log(e);
        reply.render('', { user, errors: e });
      }
      return reply;
    });
};
