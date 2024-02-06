export const up = (knex) => {
    return knex('users').insert({
        "first_name": "Lawrence",
        "last_name": "Kulas",
        "email": "lawrence.kulas87@outlook.com",
        "password_digest": "87c6374c24969f2af49433baa6d8b96e2bdb17a509b79049d2edb4fde98e4c46",
    })
  };
  
export const down = (knex) => {
    return knex('users').where({ email: 'lawrence.kulas87@outlook.com' }).del();
};