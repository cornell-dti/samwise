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
    user_id = get_user_id(session.get('token'))
    if not user_id:
        return redirect(url_for('api.login', redirect=request.path))
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
    user_id = get_user_id(session.get('token'))
    if not user_id:
        return redirect(url_for('api.login', redirect=request.path))
    tags = Tag.query.filter(Tag.user_id == user_id).all()
    tags_json = util.table_to_json(tags)
    return jsonify(tags_json)


@api.route('/tags/<tag_id>/delete', methods=['PUT'])
def delete_tag(tag_id):
    user_id = get_user_id(session.get('token'))
    if not user_id:
        return redirect(url_for('api.login', redirect=request.path))
    tag = Tag.query.filter(Tag.tag_id == tag_id).filter(Tag.user_id == user_id).first()
    if tag is None:
        return jsonify(error='error. no tag with id {} exists for this user.'.format(tag_id)), 404
    tag.deleted = True
    return jsonify(status='success')


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
        "_order": order,
        "completed": False
    }
    """
    user_id = get_user_id(session.get('token'))
    if not user_id:
        return redirect(url_for('api.login', redirect=request.path))
    data = request.get_json(force=True)
    content = data['content']
    start_date = data['start_date']
    end_date = data['end_date']
    parent_task = data.get('parent_task', None)
    tag = Tag.query.filter(Tag.tag_id == tag_id).filter(Tag.user_id == user_id).first()
    if tag is None:
        return jsonify(error='error. no tag with id {} exists for this user.'.format(tag_id)), 404
    last_task = Task.query.filter(Task.tag_id == Tag.tag_id).filter(Tag.tag_id == tag_id).filter(
        Tag.user_id == user_id).order_by(Task._order.desc()).first()
    order = last_task._order + 1 if last_task else 0
    new_task = Task(content=content, start_date=start_date, end_date=end_date, tag_id=tag_id, parent_task=parent_task,
                    _order=order, completed=False)
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
    user_id = get_user_id(session.get('token'))
    if not user_id:
        return redirect(url_for('api.login', redirect=request.path))
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
    user_id = get_user_id(session.get('token'))
    if not user_id:
        return redirect(url_for('api.login', redirect=request.path))
    tasks = Task.query.filter(Task.user_id == user_id).filter(Task.in_focus == True).all()
    tasks_json = util.table_to_json(tasks)
    return jsonify(tasks_json)


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
    user_id = get_user_id(session.get('token'))
    if not user_id:
        return redirect(url_for('api.login', redirect=request.path))
    data = request.get_json(force=True)
    if not data or not ('completed' in data) or not (type(data['completed']) == bool):
        return jsonify(error='param completed missing or of wrong type'), 400
    completed = data['completed']
    task = Task.query.filter(Task.task_id == task_id).filter(Task.user_id == user_id).first()
    if task is None:
        return jsonify(error='error. no task with id {} exists for this user.'.format(task_id)), 404
    task.completed = completed


@api.route('/tasks/<task_id>/delete', methods=['PUT'])
def delete_task(task_id):
    """
    Delete the given task.

    Output format:
    {"status": "success"} if succeeded.
    {"error": error message} if failed.
    """
    user_id = get_user_id(session.get('token'))
    if not user_id:
        return redirect(url_for('api.login', redirect=request.path))
    task = Task.query.filter(Task.task_id == task_id).filter(Task.user_id == user_id).first()
    if task is None:
        return jsonify(status='error. no task with id {} exists for this user.'.format(task_id)), 404
    task.deleted = True
    return jsonify(status='success')
