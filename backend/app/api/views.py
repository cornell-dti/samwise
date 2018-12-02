from flask import request, Blueprint, jsonify, redirect, url_for

from app import db, util
from app.api.models import Tag, Task
from app import auth

api = Blueprint('api', __name__, url_prefix='/api')


# Note: To authenticate requests:
# - GET requests: pass token as a url parameter
# - POST/PUT requests: pass token in the JSON body.


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
        redirect_url = request.args.get('redirect', url_for('api.index'))

        param_prefix = '?' if '?' not in redirect_url else '&'
        if param_prefix == '&':
            import pdb
            pdb.set_trace()
        return redirect(
            '{}{}token={}'.format(redirect_url, param_prefix, token))
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
        "isClass": True | False
    }

    Output format:
    {
        "user_id": id number,
        "tag_name": "name",
        "color": "#ffffff",
        "_order": order,
        "isClass": True | False
    }
    """
    data = request.get_json(force=True)
    if not data or 'token' not in data:
        return jsonify(error='token not passed in')
    user_id = get_user_id(data['token'])
    if not user_id:
        return redirect(url_for('api.login', redirect=request.path))
    tag_name = data.get('name')
    color = data.get('color')
    if type(tag_name) != str or type(color) != str or type(tag_name) != 'unicode' or type(color) != 'unicode':
        return jsonify(error='tag name and color must be strings'), 400
    isClass = data.get('class')
    last_tag = Tag.query.filter(Tag.user_id == user_id).order_by(
        Tag._order.desc()).first()
    order = last_tag._order + 1 if last_tag else 0
    tag = Tag(user_id=user_id, tag_name=tag_name, color=color, _order=order, isClass=isClass,
              completed=False)
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
    }
    """
    user_id = get_user_id(request.args.get('token'))
    if not user_id:
        return redirect(url_for('api.login', redirect=request.path))
    tags = Tag.query.filter(Tag.user_id == user_id).all()
    tags_json = util.table_to_json(tags)
    return jsonify(tags_json)

@api.route('/tags/classes', methods=['GET'])
def get_classes():
    """
    Returns all classes.

    Output format:
    List of tags in form:

    {
        "user_id": id number,
        "tag_name": "name",
        "color": "#ffffff",
        "_order": order,
    }
    """
    user_id = get_user_id(request.args.get('token'))
    if not user_id:
        return redirect(url_for('api.login', redirect=request.path))
    tags = Tag.query.filter(Tag.user_id == user_id).filter(Tag.isClass is True).all()
    tags_json = util.table_to_json(tags)
    return jsonify(tags_json)


@api.route('/tags/<tag_id>/delete', methods=['PUT'])
def delete_tag(tag_id):
    data = request.get_json(force=True)
    if not data or 'token' not in data:
        return jsonify(error='token not passed in')
    user_id = get_user_id(data['token'])
    if not user_id:
        return redirect(url_for('api.login', redirect=request.path))
    tag = Tag.query.filter(Tag.tag_id == tag_id).filter(
        Tag.user_id == user_id).first()
    if tag is None:
        return jsonify(
            error='error. no tag with id {} exists for this user.'.format(
                tag_id)), 404
    tag.deleted = True
    return jsonify(status='success')


@api.route('/tags/<tag_id>/edit', methods=['POST'])
def edit_tag(tag_id):
    """

    Edit or add a color to a specific tag.

    Input format:
    {
        "tag_name": "ABC",
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
    data = request.get_json(force=True)
    if not data or 'token' not in data:
        return jsonify(error='token not passed in')
    user_id = get_user_id(data['token'])
    if not user_id:
        return redirect(url_for('api.login', redirect=request.path))
    tag_name = data.get('tag_name')
    color = data.get('color')
    tag = Tag.query.filter(Tag.user_id == user_id).filter(
        Tag.tag_id == tag_id).first()
    if tag is None:
        return jsonify(status='error. tag not found.')
    if tag_name is None:
        return jsonify(status='error. key "tag_name" is required.')
    if color is None:
        return jsonify(status='error. key "color" is required.')
    tag.tag_name = tag_name
    tag.color = color
    db.session.commit()
    return jsonify(tag=util.sqlalchemy_object_to_dict(tag))


@api.route('/tasks/new', methods=['POST'])
def new_task():
    """
    Creates a new task.
    {
        "token": auth_token,
        "content": content,
        "start_date": yyyy-mm-dd hh:mm:ss,
        "end_date": yyyy-mm-dd hh:mm:ss,
        "parent_task": parent id,
        "tag_id": tag_id,
        "subtasks": [same format as above but without parent_task or tag_id]
    }

    Output format:
    {
        "content": content,
        "start_date": yyyy-mm-dd hh:mm:ss,
        "end_date": yyyy-mm-dd hh:mm:ss,
        "tag_id": id,
        "parent_task": parent id,
        "_order": order,
        "completed": False
    }
    """
    data = request.get_json(force=True)
    if not data or 'token' not in data:
        return jsonify(error='token not passed in')
    user_id = get_user_id(data['token'])
    if not user_id:
        return redirect(url_for('api.login', redirect=request.path))
    content = data.get('content')
    tag_id = data.get('tag_id')
    start_date = data.get('start_date')
    end_date = data.get('end_date')
    if None in (content, tag_id, start_date, end_date):
        return jsonify(error='Parameters content, tag_id, start_date, and end_date are required!')

    parent_task = data.get('parent_task')
    last_task = Task.query.filter(
        Task.tag_id == tag_id).filter(
        Task.user_id == user_id).order_by(Task._order.desc()).first()
    order = last_task._order + 1 if last_task else 0
    new_task = Task(user_id=user_id, content=content,
                    start_date=start_date, end_date=end_date,
                    tag_id=tag_id, parent_task=parent_task,
                    _order=order, completed=False)
    db.session.add(new_task)

    subtasks = data.get('subtasks')
    if subtasks:
        # Validate subtasks
        for i, subtask in enumerate(subtasks):
            content = subtask.get('content')
            start_date = subtask.get('start_date')
            end_date = subtask.get('end_date')
            if None in (content, start_date, end_date):
                return jsonify(error='subtask {} is missing content, start_date, and/or end_date.'.format(i))

        # Add subtasks
        for i, subtask in enumerate(subtasks):
            content = subtask.get('content')
            start_date = subtask.get('start_date')
            end_date = subtask.get('end_date')
            new_subtask = Task(user_id=user_id, content=content,
                               start_date=start_date, end_date=end_date,
                               tag_id=tag_id, parent_task=new_task.task_id,
                               _order=i, completed=False)
            db.session.add(new_subtask)
    db.session.commit()
    return jsonify(created=util.sqlalchemy_object_to_dict(new_task))


@api.route('/tasks/all', methods=['GET'])
def get_all_tasks():
    """
    Return all tasks.

    :return: a list of all tasks.

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
    user_id = get_user_id(request.args.get('token'))
    if not user_id:
        return redirect(url_for('api.login', redirect=request.path))
    tasks = Task.query \
        .filter(Task.user_id == user_id).filter(Task.deleted == False) \
        .all()
    return jsonify(util.table_to_json(tasks))




"""
# Not used now

@api.route('/tags/<tag_id>/tasks/all', methods=['GET'])
def get_tasks(tag_id):
    ""
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
    ""
    user_id = get_user_id(request.args.get('token'))
    if not user_id:
        return redirect(url_for('api.login', redirect=request.path))
    tasks = Task.query.filter(Task.tag_id == Tag.tag_id).filter(
        Tag.user_id == user_id).filter(
        Tag.tag_id == tag_id).all()
    return jsonify(util.table_to_json(tasks))

@api.route('/tasks/focus', methods=['GET'])
def get_tasks_in_focus():
    ""
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
    ""
    user_id = get_user_id(request.args.get('token'))
    if not user_id:
        return redirect(url_for('api.login', redirect=request.path))
    tasks = Task.query.filter(Task.user_id == user_id).filter(
        Task.in_focus == True).all()
    tasks_json = util.table_to_json(tasks)
    return jsonify(tasks_json)
"""


@api.route('/tasks/<task_id>/mark', methods=['PUT'])
def mark_task_complete(task_id):
    """
    Mark the given task as complete/incomplete.

    Input format:
    {"complete": true|false}

    Output format:
    {"status": "success"} if succeeded.
    {"error": error message} if failed.
    {"
    """
    data = request.get_json(force=True)
    if not data or 'token' not in data:
        return jsonify(error='token not passed in')
    user_id = get_user_id(data['token'])
    if not user_id:
        return redirect(url_for('api.login', redirect=request.path))
    if 'completed' not in data or type(data['completed']) != bool:
        return jsonify(error='param completed missing or of wrong type'), 400
    completed = data['completed']
    task = Task.query.filter(Task.task_id == task_id).filter(
        Task.user_id == user_id).first()
    if task is None:
        return jsonify(
            error='error. no task with id {} exists for this user.'.format(
                task_id)), 404
    task.completed = completed
    db.session.commit()
    return jsonify(status='success')


@api.route('/tasks/<task_id>/delete', methods=['PUT'])
def delete_task(task_id):
    """
    Delete the given task.

    Output format:
    {"status": "success"} if succeeded.
    {"error": error message} if failed.
    """
    data = request.get_json(force=True)
    if not data or 'token' not in data:
        return jsonify(error='token not passed in')
    user_id = get_user_id(data['token'])
    if not user_id:
        return redirect(url_for('api.login', redirect=request.path))
    task = Task.query.filter(Task.task_id == task_id).filter(
        Task.user_id == user_id).first()
    if task is None:
        return jsonify(
            status='error. no task with id {} exists for this user.'.format(
                task_id)), 404
    task.deleted = True
    db.session.commit()
    return jsonify(status='success')


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
    data = request.get_json(force=True)
    if not data or 'token' not in data:
        return jsonify(error='token not passed in')
    user_id = get_user_id(data['token'])
    if not user_id:
        return redirect(url_for('api.login', redirect=request.path))
    focus = data.get('focus')
    task = Task.query.filter(Task.user_id == user_id).filter(
        Task.task_id == task_id).first()
    if task is None:
        return jsonify(status='error. task not found.')
    if focus is None:
        return jsonify(status='error. key "focus" is required.')
    task.in_focus = focus
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
    data = request.get_json(force=True)
    if not data or 'token' not in data:
        return jsonify(error='token not passed in')
    user_id = get_user_id(data['token'])
    if not user_id:
        return redirect(url_for('api.login', redirect=request.path))
    task = Task.query.filter(Task.user_id == user_id).filter(
        Task.task_id == task_id).first()
    if task is None:
        return jsonify(status='error. tag not found.')

    task.content = data.get('content', task.content)
    task.tag_id = data.get('tag_id', task.tag_id)
    task.start_date = data.get('start_date', task.start_date)
    task.end_date = data.get('end_date', task.end_date)
    task.completed = data.get('completed', task.completed)
    task.in_focus = data.get('in_focus', task.in_focus)
    task.parent_task = data.get('parent_task', task.parent_task)
    task._order = data.get('_order', task._order)
    db.session.commit()
    return jsonify(task=util.sqlalchemy_object_to_dict(task))
