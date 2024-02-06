// @ts-check

export default {
  translation: {
    appName: 'Менеджер задач',
    flash: {
      session: {
        create: {
          success: 'Вы залогинены',
          error: 'Неверная почта или пароль',
        },
        delete: {
          success: 'Вы разлогинены',
        },
      },
      users: {
        create: {
          error: 'Не удалось зарегистрировать',
          success: 'Пользователь успешно зарегистрирован',
        },
        update: {
          notLoggedIn: 'Вы не вошли в систему',
          notSameUser: 'Вы можете редактировать только свой профиль',
          userConnectedToTask: 'Вы не можете удалить этого пользователя. Пользователь связан с одной или несколькими задачами',
          success: 'Пользователь успешно изменён',
          error: 'Не удалось обновить профиль',
        },
        delete: {
          success: 'Пользователь успешно удалён',
          error: 'Не удалось удалить профиль',
        },
      },
      labels: {
        create: {
          success: 'Метка успешно создана',
          error: 'Не удалось создать метку',
        },
        update: {
          success: 'Метка успешно изменена',
          error: 'Не удалось обновить метку',
          labelConnectedToTask: 'Вы не можете удалить эту метку. Метка связана с одной или несколькими задачами',
        },
        delete: {
          success: 'Метка успешно удалена',
          error: 'Не удалось удалить метку',
        },
      },
      statuses: {
        create: {
          success: 'Статус успешно создан',
          error: 'Не удалось создать статус',
        },
        update: {
          success: 'Статус успешно изменён',
          error: 'Не удалось обновить статус',
        },
        delete: {
          success: 'Статус успешно удалён',
          error: 'Не удалось удалить статус',
          statusConnectedToTask: 'Вы не можете удалить этот статус. Статус связан с одной или несколькими задачами',
        },
      },
      tasks: {
        create: {
          success: 'Задача успешно создана',
          error: 'Не удалось создать задачу',
        },
        update: {
          success: 'Задача успешно изменена',
          error: 'Не удалось обновить задачу',
        },
        delete: {
          success: 'Задача успешно удалена',
          error: 'Не удалось удалить задачу',
        },
      },
      authError: 'Доступ запрещен. Вы должны войти в систему',
      notSameUser: 'Вы не можете редактировать другой профиль',
    },
    layouts: {
      application: {
        users: 'Пользователи',
        statuses: 'Статусы',
        labels: 'Метки',
        tasks: 'Задачи',
        signIn: 'Вход',
        signUp: 'Регистрация',
        signOut: 'Выход',
      },
    },
    buttons: {
      change: 'Изменить',
      delete: 'Удалить',
      submit: 'Создать',
      filter: 'Показать',
    },
    views: {
      session: {
        new: {
          signIn: 'Вход',
          submit: 'Войти',
        },
      },
      users: {
        id: 'ID',
        email: 'Email',
        title: 'Пользователи',
        lastName: 'Фамилия',
        firstName: 'Имя',
        fullName: 'Полное имя',
        createdAt: 'Дата создания',
        actions: 'Действия',
        password: 'Пароль',
        new: {
          submit: 'Сохраниить',
          signUp: 'Регистрация',
        },
        editTitle: 'Изменение пользователя',
      },
      statuses: {
        id: 'ID',
        title: 'Статусы',
        name: 'Наименование',
        createdAt: 'Дата создания',
        new: 'Создание статуса',
        actions: 'Действия',
        edit: {
          title: 'Изменение статуса',
        },
      },
      labels: {
        id: 'ID',
        title: 'Метки',
        name: 'Наименование',
        createdAt: 'Дата создания',
        new: 'Создание метки',
        actions: 'Действия',
        editTitle: 'Изменение метки',
      },
      tasks: {
        id: 'ID',
        name: 'Наименование',
        title: 'Задачи',
        description: 'Описание',
        status: 'Статус',
        executor: 'Исполнитель',
        creator: 'Автор',
        createdAt: 'Дата создания',
        new: 'Создать задачу',
        actions: 'Действия',
        isCreatorUser: 'Только мои задачи',
        labels: 'Метки',
        label: 'Метка',
        edit: 'Изменение задачи',
      },
      welcome: {
        index: {
          hello: 'Привет от Хекслета!',
          description: 'Практические курсы по программированию',
          more: 'Узнать больше',
        },
      },
    },
  },
};
