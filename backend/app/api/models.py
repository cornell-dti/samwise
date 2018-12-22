from sqlalchemy.dialects.postgresql import JSONB
from app import db


class Base(db.Model):
    __abstract__ = True

    time_created = db.Column(db.DateTime,
                             server_default=db.func.current_timestamp(),
                             nullable=False)
    time_modified = db.Column(db.DateTime,
                              server_default=db.func.current_timestamp(),
                              onupdate=db.func.current_timestamp(),
                              nullable=False)


class User(Base):
    __tablename__ = 'users'

    user_id = db.Column(db.String, primary_key=True)
    email = db.Column(db.String, nullable=False, unique=True)


class Tag(Base):
    __tablename__ = 'tags'

    tag_id = db.Column(db.BigInteger, primary_key=True)
    user_id = db.Column(db.String, nullable=False)
    is_class = db.Column(db.Boolean, nullable=False)
    tag_name = db.Column(db.String, nullable=False)
    color = db.Column(db.String, nullable=False)
    _order = db.Column(db.Integer, nullable=False)
    deleted = db.Column(db.Boolean, nullable=False)

    def __init__(self, user_id=None, is_class=False, tag_name=None, color=None,
                 _order=None, deleted=False):
        self.user_id = user_id
        self.is_class = is_class
        self.tag_name = tag_name
        self.color = color
        self._order = _order
        self.deleted = deleted


class Task(Base):
    __tablename__ = 'tasks'

    task_id = db.Column(db.BigInteger, primary_key=True)
    user_id = db.Column(db.String, nullable=False)
    content = db.Column(db.String, nullable=False)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    tag_id = db.Column(db.BigInteger, nullable=False)
    parent_task = db.Column(db.BigInteger)
    _order = db.Column(db.Integer, nullable=False)
    completed = db.Column(db.Boolean, nullable=False)
    in_focus = db.Column(db.Boolean, nullable=False)
    deleted = db.Column(db.Boolean, nullable=False)

    def __init__(self, user_id=None, content=None,
                 start_date=None, end_date=None,
                 tag_id=None, parent_task=None, _order=None,
                 completed=False, in_focus=False, deleted=False):
        self.user_id = user_id
        self.content = content
        self.start_date = start_date
        self.end_date = end_date
        self.tag_id = tag_id
        self.parent_task = parent_task
        self._order = _order
        self.completed = completed
        self.in_focus = in_focus
        self.deleted = deleted


action_type_enum_elements = ('check', 'uncheck', 'add', 'delete')
action_type_enum = db.Enum(*action_type_enum_elements, name='action_type')


class Action(Base):
    __tablename__ = 'action'

    action_id = db.Column(db.BigInteger, primary_key=True)
    user_id = db.Column(db.String, nullable=False)
    action = db.Column(action_type_enum, nullable=False)
    extra_data = db.Column(JSONB, nullable=True)


class Points(Base):
    __tablename__ = 'points'

    point_id = db.Column(db.BigInteger, primary_key=True)
    action_id = db.Column(db.BigInteger, nullable=False)
    user_id = db.Column(db.String, nullable=False)
