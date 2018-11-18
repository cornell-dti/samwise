from flask import request, Blueprint, jsonify, redirect, url_for, session

from app import db, util
from app.api.models import Tag, Task
from app import auth

api = Blueprint('api', __name__, url_prefix='/api')


def get_user_id(firebase_id_token):
    try:
        decoded_token = auth.auth.verify_id_token(firebase_id_token)
        return decoded_token['uid']
    except ValueError:
        return


@api.route('/', methods=['GET'])
def index():
    return jsonify(status='success')


@api.route('/login', methods=['GET'])
def login():
    token = request.args.get('token')
    user_id = get_user_id(token)
    if user_id:
        session['token'] = token
        redirect_url = request.args.get('redirect', url_for('api.index'))
        return redirect(redirect_url)
    else:
        return auth.html


@api.route('/tags/new', methods=['POST'])
def new_tag():
    """
    Creates a new tag.

    Input format:
    {
        "name": "Tag name",
        "color": "#ffffff"
    }

    Output format:
    {
        "user_id": id number,
        "tag_name": "name",
        "color": "#ffffff",
        "_order": order,
        "completed": False,
    }
    """
    # TODO Use current user id instead of hardcoded 1
    user_id = 1
    data = request.get_json(force=True)
    tag_name = data['name']
    color = data['color']
    last_tag = Tag.query.filter(Tag.user_id == user_id).order_by(Tag._order.desc()).first()
    order = last_tag._order + 1 if last_tag else 0
    tag = Tag(user_id=user_id, tag_name=tag_name, color=color, _order=order, completed=False)
    db.session.add(tag)
    db.session.commit()
    return jsonify(created=util.sqlalchemy_object_to_dict(tag))


@api.route('/tags/all', methods=['GET'])
def get_tags():
    """
    Returns all tags.

    Output format:

    List of tags in form:

    {
        "user_id": id number,
        "tag_name": "name",
        "color": "#ffffff",
        "_order": order,
        "completed": False,
    }
    """
    # TODO Use current user id instead of hardcoded 1
    user_id = get_user_id(session.get('token'))
    if not user_id:
        return redirect(url_for('api.login', redirect=request.path))
    tags = Tag.query.filter(Tag.user_id == user_id).all()
    tags_json = util.table_to_json(tags)
    return jsonify(tags_json)


@api.route('/tags/<tag_id>/color', methods=['POST'])
def edit_tag_color(tag_id):
    """

    Edit or add a color to a specific tag.

    Input format:
    {
        "color": "#ffffff",
    }

    Output format:
    {
        "user_id": id number,
        "tag_name": "name",
        "color": "#ffffff",
        "_order": order,
        "completed": False,
    }
    """
    # TODO Use current user id instead of hardcoded 1
    user_id = 1
    data = request.get_json(force=True)
    color = data.get('color')
    tag = Tag.query.filter(Tag.user_id == user_id).filter(Tag.tag_id == tag_id).first()
    if tag is None:
        return jsonify(status='error. tag not found.')
    if color is None:
        return jsonify(status='error. key "color" is required.')
    Tag.color = color
    db.session.commit()
    return jsonify(tag=util.sqlalchemy_object_to_dict(tag))


@api.route('/tags/<tag_id>/tasks/new', methods=['POST'])
def new_task(tag_id):

    """
    Creates a new task.
    {
        "content": content,
        "start_date": yyyy-mm-dd hh:mm:ss,
        "end_date": yyyy-mm-dd hh:mm:ss,
        "parent_task": parent id
    }

    Output format:
    {
        "content": content,
        "start_date": yyyy-mm-dd hh:mm:ss,
        "end_date": yyyy-mm-dd hh:mm:ss,
        "tag_id": id,
        "parent_task": parent id,
        "in_focus": False,
        "_order": order,
        "completed": False
    }
    """
    user_id = 1
    data = request.get_json(force=True)
    content = data['content']
    start_date = data['start_date']
    end_date = data['end_date']
    parent_task = data.get('parent_task', None)
    tag = Tag.query.filter(Tag.tag_id == tag_id).filter(Tag.user_id == user_id).all()
    if len(tag) == 0:
        return jsonify(status='error. no tag with id {} exists for this user.'.format(tag_id))
    last_task = Task.query.filter(Task.tag_id == Tag.tag_id).filter(Tag.tag_id == tag_id).filter(
        Tag.user_id == user_id).order_by(Task._order.desc()).first()
    order = last_task._order + 1 if last_task else 0
    new_task = Task(content=content, start_date=start_date, end_date=end_date, tag_id=tag_id, parent_task=parent_task,
                    in_focus=False, _order=order, completed=False)
    db.session.add(new_task)
    db.session.commit()
    return jsonify(created=util.sqlalchemy_object_to_dict(new_task))


@api.route('/tags/<tag_id>/tasks/all', methods=['GET'])
def get_tasks(tag_id):
    """
    Returns all tasks.

    Output format:

    List of tags in form:

    {
        "content": content,
        "start_date": yyyy-mm-dd hh:mm:ss,
        "end_date": yyyy-mm-dd hh:mm:ss,
        "tag_id": id,
        "parent_task": parent id,
        "in_focus": True,
        "_order": order,
        "completed": False
    }
    """
    # TODO Use current user id instead of hardcoded 1
    user_id = 1
    tasks = Task.query.filter(Task.tag_id == Tag.tag_id).filter(Tag.user_id == user_id).filter(
        Tag.tag_id == tag_id).all()
    return jsonify(util.table_to_json(tasks))


@api.route('/tasks/focus', methods=['GET'])
def get_tasks_in_focus():
    """
    Returns all tasks with in_focus == true.

    Output format:

    List of tags in form:

    {
        "content": content,
        "start_date": yyyy-mm-dd hh:mm:ss,
        "end_date": yyyy-mm-dd hh:mm:ss,
        "tag_id": id,
        "parent_task": parent id,
        "in_focus": True,
        "_order": order,
        "completed": False
    }
    """
    # TODO Use current user id instead of hardcoded 1
    user_id = 1
    tasks = Task.query.filter(Task.user_id == user_id).filter(Task.in_focus == True).all()
    tasks_json = util.table_to_json(tasks)
    return jsonify(tasks_json)


@api.route('/tasks/<task_id>/focus', methods=['POST'])
def set_task_focus(task_id):
    """
    Set the focus of a tag. True means in focus, false means not in focus.

    Input format:

    {
        "focus": true|false
    }

    Output format:
    {
        "content": content,
        "start_date": yyyy-mm-dd hh:mm:ss,
        "end_date": yyyy-mm-dd hh:mm:ss,
        "tag_id": id,
        "parent_task": parent id,
        "in_focus": focus,
        "_order": order,
        "completed": False
    }
    """
    # TODO Use current user id instead of hardcoded 1
    user_id = 1
    data = request.get_json(force=True)
    focus = data.get('focus')
    task = Task.query.filter(Task.user_id == user_id).filter(Task.tag_id == task_id).first()
    if task is None:
        return jsonify(status='error. tag not found.')
    if focus is None:
        return jsonify(status='error. key "focus" is required.')
    Task.in_focus = focus
    db.session.commit()
    return jsonify(task=util.sqlalchemy_object_to_dict(task))


@api.route('/tasks/<task_id>/edit', methods=['POST'])
def edit_task(task_id):
    """
        Edit any feature of a task.

        Input format:

        {
            "content": content,
            "start_date": yyyy-mm-dd hh:mm:ss,
            "end_date": yyyy-mm-dd hh:mm:ss,
            "tag_id": id,
            "parent_task": parent id,
            "in_focus": True,
            "_order": order,
            "completed": False
        }

        Output format:


        {
            "content": content,
            "start_date": yyyy-mm-dd hh:mm:ss,
            "end_date": yyyy-mm-dd hh:mm:ss,
            "tag_id": id,
            "parent_task": parent id,
            "in_focus": True,
            "_order": order,
            "completed": False
        }
        """
    # TODO Use current user id instead of hardcoded 1
    user_id = 1
    data = request.get_json(force=True)
    task = Task.query.filter(Task.user_id == user_id).filter(Task.tag_id == task_id).first()
    if task is None:
        return jsonify(status='error. tag not found.')

    Task.content = data.get('content') or task.content
    Task.start_date = data.get('start_date') or task.start_date
    Task.end_date = data.get('end_date') or task.end_date
    Task.parent_task = data.get('parent_task') or task.parent_task
    Task.in_focus = data.get('in_focus') or task.in_focus
    Task._order = data.get('_order') or task._order
    Task.completed = data.get('completed') or task.completed
    db.session.commit()
    return jsonify(task=util.sqlalchemy_object_to_dict(task))
