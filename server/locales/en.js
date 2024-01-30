// @ts-check

export default {
  translation: {
    appName: 'Fastify Boilerplate',
    flash: {
      session: {
        create: {
          success: 'You are logged in',
          error: 'Wrong email or password',
        },
        delete: {
          success: 'You are logged out',
        },
      },
      users: {
        create: {
          error: 'Failed to register',
          success: 'User registered successfully',
        },
        edit: {
          notLoggedIn: 'You are not logged in',
          notSameUser: 'You can only edit your own profile',
          userConnectedToTask: 'You can not delete this user. User is connected to one or more tasks',
          success: 'User updated successfully',
          error: 'Failed to update user',
        },
        delete: {
          success: 'User deleted successfully',
          error: 'Failed to delete user',
        },
      },
      labels: {
        create: {
          success: 'Label created successfully',
          error: 'Failed to create label',
        },
        edit: {
          success: 'Label updated successfully',
          error: 'Failed to update label',
          labelConnectedToTask: 'You can not delete this label. Label is connected to one or more tasks',
        },
        delete: {
          success: 'Label deleted successfully',
          error: 'Failed to delete label',
        },
      },
      statuses: {
        create: {
          success: 'Status created successfully',
          error: 'Failed to create status',
        },
        edit: {
          success: 'Status updated successfully',
          error: 'Failed to update status',
        },
        delete: {
          success: 'Status deleted successfully',
          error: 'Failed to delete status',
          statusConnectedToTask: 'You can not delete this status. Status is connected to one or more tasks',
        },
      },
      tasks: {
        create: {
          success: 'Task created successfully',
          error: 'Failed to create task',
        },
        update: {
          success: 'Task updated successfully',
          error: 'Failed to update task',
        },
        delete: {
          success: 'Task deleted successfully',
          error: 'Failed to delete task',
        },
      },
      authError: 'Access denied! Please login',
      notSameUser: 'You can only edit your own profile',
    },
    layouts: {
      application: {
        users: 'Users',
        statuses: 'Statuses',
        labels: 'Labels',
        tasks: 'Tasks',
        signIn: 'Login',
        signUp: 'Register',
        signOut: 'Logout',
      },
    },
    buttons: {
      change: 'Change',
      delete: 'Delete',
      submit: 'Submit',
      filter: 'Show',
    },
    views: {
      session: {
        new: {
          signIn: 'Login',
          submit: 'Login',
        },
      },
      users: {
        id: 'ID',
        email: 'Email',
        title: 'Users',
        lastName: 'lastName',
        firstName: 'firstName',
        fullName: 'Full Name',
        createdAt: 'Created at',
        actions: 'Actions',
        password: 'password',
        new: {
          submit: 'Register',
          signUp: 'Register',
        },
      },
      statuses: {
        id: 'ID',
        title: 'Statuses',
        name: 'Name',
        createdAt: 'Created at',
        new: 'Create status',
        actions: 'Actions',
      },
      labels: {
        id: 'ID',
        title: 'Labels',
        name: 'Name',
        createdAt: 'Created at',
        new: 'Create label',
        actions: 'Actions',
        editTitle: 'Edit label',
      },
      tasks: {
        id: 'ID',
        name: 'Name',
        title: 'Tasks',
        description: 'Description',
        status: 'Status',
        executor: 'Executor',
        creator: 'Creator',
        createdAt: 'Created at',
        new: 'Create task ',
        actions: 'Actions',
        isCreatorUser: 'Only my tasks',
        labels: 'Labels',
        label: 'Label',
        edit: 'Change task',
      },
      welcome: {
        index: {
          hello: 'Hello from Hexlet!',
          description: 'Online programming school',
          more: 'Learn more',
        },
      },
    },
  },
};
