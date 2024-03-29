// @ts-check
import i18next from 'i18next';

export default (app) => {
  const User = app.objection.models.user;
  const Task = app.objection.models.task;
  app
    .get('/users', { name: 'users' }, async (req, reply) => {
      const users = await User.query();
      reply.render('users/index', { users });
      return reply;
    })
    .get('/users/new', { name: 'newUser' }, (req, reply) => {
      const user = new User();
      reply.render('users/new', { user });
    })
    .get('/users/:id/edit', { preValidation: app.authenticate, preHandler: app.requireSameUser }, async (req, reply) => {
      const user = await User.query().where('id', req.params.id);
      reply.render('users/edit', { user: user[0] });
      return reply;
    })
    .post('/users', async (req, reply) => {
      const user = new User();
      user.$set(req.body.data);
      try {
        const validUser = await User.fromJson(req.body.data);
        await User.query().insert(validUser);
        req.flash('info', i18next.t('flash.users.create.success'));
        reply.redirect(app.reverse('root'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.users.create.error'));
        reply.render('users/new', { user, errors: data });
      }

      return reply;
    })
    .patch('/users/:id', { name: 'editUser', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params;
      const user = await User.query().findOne({ id });
      try {
        await user.$query().patch(req.body.data);
        req.flash('info', i18next.t('flash.users.update.success'));
        reply.redirect(app.reverse('users'));
      } catch (e) {
        req.flash('error', i18next.t('flash.users.update.error'));
        reply.render('users/edit', { user, errors: e });
      }
      return reply;
    })
    .delete('/users/:id', { name: 'deleteUser', preValidation: app.authenticate, preHandler: app.requireSameUser }, async (req, reply) => {
      const { id } = req.params;
      const user = await User.query().findOne({ id });
      const tasks = await Task
        .query()
        .where('executorId', id)
        .orWhere('creatorId', id);

      if (tasks.length > 0) {
        req.flash('error', i18next.t('flash.users.edit.userConnectedToTask'));
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
        reply.render('', { user, errors: e });
      }
      return reply;
    });
};
