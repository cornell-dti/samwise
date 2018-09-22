from sqlalchemy.dialects.postgresql import JSONB
from app import db


class Base(db.Model):
    __abstract__ = True

    time_created = db.Column(db.DateTime, default=db.func.current_timestamp(), nullable=False)
    time_modified = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp(),
                              nullable=False)


class User(Base):
    __tablename__ = 'users'

    user_id = db.Column(db.BigInteger, primary_key=True)
    email = db.Column(db.String, nullable=False, unique=True)


class Tag(Base):
    __tablename__ = 'tags'

    tag_id = db.Column(db.BigInteger, primary_key=True)
    user_id = db.Column(db.BigInteger, nullable=False)
    tag_name = db.Column(db.String, nullable=False)
    active = db.Column(db.Boolean, nullable=False)
    color = db.Column(db.String, nullable=False)
    _order = db.Column(db.Integer, nullable=False)
    archived = db.Column(db.Boolean, nullable=False)


class Task(Base):
    __tablename__ = 'tasks'

    task_id = db.Column(db.BigInteger, primary_key=True)
    content = db.Column(db.String, nullable=False)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    tag_id = db.Column(db.BigInteger, nullable=False)
    parent_task = db.Column(db.BigInteger)
    _order = db.Column(db.Integer, nullable=False)
    archived = db.Column(db.Boolean, nullable=False)


action_type_enum_elements = ('check', 'uncheck', 'add', 'delete')
action_type_enum = db.Enum(*action_type_enum_elements, name='action_type')


class Action(Base):
    __tablename__ = 'action'

    action_id = db.Column(db.BigInteger, primary_key=True)
    user_id = db.Column(db.BigInteger, nullable=False)
    action = db.Column(action_type_enum, nullable=False)
    extra_data = db.Column(JSONB, nullable=True)


class Points(Base):
    __tablename__ = 'points'

    point_id = db.Column(db.BigInteger, primary_key=True)
    action_id = db.Column(db.BigInteger, nullable=False)
    user_id = db.Column(db.BigInteger, nullable=False)
