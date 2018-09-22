DROP TABLE users;
DROP TABLE tags;
DROP TABLE tasks;
DROP TABLE actions;
DROP TYPE action_type;
DROP TABLE points;

CREATE TABLE users (
  user_id BIGSERIAL PRIMARY KEY,
  email VARCHAR NOT NULL
);

CREATE TABLE tags (
  tag_id BIGSERIAL PRIMARY KEY,
  tag_name VARCHAR(255) NOT NULL,
  time_created TIMESTAMP NOT NULL,
  color VARCHAR(255) NOT NULL,
  _order INT NOT NULL,
  archived BOOL NOT NULL
);

CREATE TABLE tasks (
  task_id BIGSERIAL PRIMARY KEY,
  content VARCHAR(255) NOT NULL,
  time_created TIMESTAMP NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  tag_id BIGSERIAL NOT NULL,
  parent_task BIGSERIAL, /* could be null if no parent */
  _order INT NOT NULL,
  archived BOOL NOT NULL
);

CREATE TYPE action_type AS ENUM('check', 'uncheck', 'add', 'delete');
CREATE TABLE actions (
  action_id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMP NOT NULL,
  user_id BIGSERIAL NOT NULL,
  action action_type NOT NULL,
  extra_data JSONB /* could be null if no extra data is needed */
);

CREATE TABLE points (
  point_id BIGSERIAL PRIMARY KEY,
  action_id BIGSERIAL NOT NULL,
  user_id BIGSERIAL NOT NULL
);
