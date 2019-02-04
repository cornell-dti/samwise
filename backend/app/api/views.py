from flask import request, Blueprint, jsonify, redirect, url_for
from sqlalchemy import or_

from app import db, util, courses
from app.api.models import Tag, Task
from app import auth

api = Blueprint('api', __name__, url_prefix='/api')


# Note: To authenticate requests:
# - GET requests: pass token as a url parameter
# - POST/PUT requests: pass token in the JSON body.

# Endpoints Documentation
# - Read: https://samwise.docs.apiary.io/
# - Edit: https://app.apiary.io/samwise

def get_user_id(firebase_id_token):
    # The flag to allow bad users.
    # It can be set to true only during development.
    ALLOW_BAD_USER = False
    if ALLOW_BAD_USER:
        return 'bad_user'
    try:
        decoded_token = auth.auth.verify_id_token(firebase_id_token)
        return decoded_token['uid']
    except ValueError:
        return None


@api.route('/', methods=['GET'])
def index():
    """
    Used for sanity check or potential health check.

    :return: a simple success message.
    """
    return jsonify(status='success')


@api.route('/load', methods=['GET'])
def load():
    user_id = get_user_id(request.args.get('token'))
    if not user_id:
        return jsonify(error='token not passed in')

    tags = Tag.query \
        .filter(Tag.user_id == user_id) \
        .filter(Tag.deleted == False) \
        .all()
    tags_json = util.table_to_json(tags)

    tasks = Task.query \
        .filter(Task.user_id == user_id) \
        .filter(Task.deleted == False) \
        .all()
    tasks_json = util.table_to_json(tasks)

    return jsonify(
        tags=tags_json,
        tasks=tasks_json,
        courses=courses.courses_json
    )


@api.route('/tags/new', methods=['POST'])
def new_tag():
    data = request.get_json(force=True)
    if not data or 'token' not in data:
        return jsonify(error='token not passed in')
    user_id = get_user_id(data['token'])
    if not user_id:
        return redirect(url_for('api.login', redirect=request.path))
    tag_name = data.get('name')
    color = data.get('color')
    if not (type(tag_name) == str or type(tag_name) == 'unicode') \
            or not (type(color) == str or type(color) == 'unicode'):
        return jsonify(
            error='tag name and color must be strings. Current color type is '
                  + type(color) + '. Current tag name types is '
                  + type(tag_name)), 400
    class_id = data.get('class_id')
    last_tag = Tag.query \
        .filter(Tag.user_id == user_id) \
        .order_by(Tag._order.desc()) \
        .first()
    order = last_tag._order + 1 if last_tag else 0
    tag = Tag(user_id=user_id, class_id=class_id,
              tag_name=tag_name, color=color, _order=order)
    db.session.add(tag)
    db.session.commit()
    return jsonify(created=util.sqlalchemy_obj_to_dict(tag))


@api.route('/tags/all', methods=['GET'])
def get_tags():
    user_id = get_user_id(request.args.get('token'))
    if not user_id:
        return redirect(url_for('api.login', redirect=request.path))
    tags = Tag.query \
        .filter(Tag.user_id == user_id) \
        .filter(Tag.deleted == False) \
        .all()
    tags_json = util.table_to_json(tags)
    return jsonify(tags_json)


@api.route('/tags/classes', methods=['GET'])
def get_classes():
    user_id = get_user_id(request.args.get('token'))
    if not user_id:
        return redirect(url_for('api.login', redirect=request.path))
    tags = Tag.query.filter(Tag.is_class == True).all()
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
            error=f'error. no tag with id {tag_id} exists for this user.'), 404
    tag.deleted = True

    # Set tasks with that tag's tag to None
    tasks = Task.query \
        .filter(Task.tag_id == tag_id) \
        .filter(Task.user_id == user_id) \
        .all()
    for task in tasks:
        task.tag_id = -1  # -1 is None

    db.session.commit()
    return jsonify(status='success')


@api.route('/tags/<tag_id>/edit', methods=['POST'])
def edit_tag(tag_id):
    data = request.get_json(force=True)
    if not data or 'token' not in data:
        return jsonify(error='token not passed in')
    user_id = get_user_id(data['token'])
    if not user_id:
        return redirect(url_for('api.login', redirect=request.path))
    class_id = data.get('class_id')
    tag_name = data.get('name')
    color = data.get('color')
    tag = Tag.query.filter(Tag.user_id == user_id).filter(
        Tag.tag_id == tag_id).first()
    if tag is None:
        return jsonify(status='error. tag not found.')
    if tag_name is None:
        return jsonify(status='error. key "tag_name" is required.')
    if color is None:
        return jsonify(status='error. key "color" is required.')
    tag.class_id = class_id
    tag.tag_name = tag_name
    tag.color = color
    db.session.commit()
    return jsonify(tag=util.sqlalchemy_obj_to_dict(tag))


@api.route('/tasks/new', methods=['POST'])
def new_task():
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
        return jsonify(
            error='Parameters content, tag_id, start_date, and '
                  'end_date are required!')

    parent_task = data.get('parent_task')
    last_task = Task.query.filter(
        Task.tag_id == tag_id).filter(
        Task.user_id == user_id).order_by(Task._order.desc()).first()
    order = last_task._order + 1 if last_task else 0

    completed = data.get('completed', False)
    in_focus = data.get('in_focus', False)
    new_main_task = Task(user_id=user_id, content=content,
                         start_date=start_date, end_date=end_date,
                         tag_id=tag_id, parent_task=parent_task,
                         _order=order, completed=completed, in_focus=in_focus)
    db.session.add(new_main_task)

    db.session.commit()  # necessary to get the task id
    new_task_json = util.sqlalchemy_obj_to_dict(new_main_task)

    subtasks = data.get('subtasks')
    if subtasks:
        new_subtasks = []
        new_main_task_id = new_main_task.task_id

        # Validate subtasks
        for i, subtask in enumerate(subtasks):
            content = subtask.get('content')
            start_date = subtask.get('start_date')
            end_date = subtask.get('end_date')
            if None in (content, start_date, end_date):
                return jsonify(
                    error=f'subtask {i} is missing content, start_date, '
                          + 'and/or end_date.')

        # Add subtasks
        for i, subtask in enumerate(subtasks):
            content = subtask.get('content')
            start_date = subtask.get('start_date')
            end_date = subtask.get('end_date')
            new_subtask = Task(user_id=user_id, content=content,
                               start_date=start_date, end_date=end_date,
                               tag_id=tag_id, parent_task=new_main_task_id,
                               _order=i, completed=False)
            db.session.add(new_subtask)
            new_subtasks.append(new_subtask)
        db.session.commit()

        subtasks_json = [util.sqlalchemy_obj_to_dict(s) for s in new_subtasks]
        new_task_json['subtasks'] = subtasks_json
    else:
        new_task_json['subtasks'] = []

    return jsonify(created=new_task_json)


@api.route('/tasks/batch_new', methods=['POST'])
def batch_new_tasks():
    data = request.get_json(force=True)
    if not data or 'token' not in data:
        return jsonify(error='token not passed in')
    user_id = get_user_id(data['token'])
    if not user_id:
        return redirect(url_for('api.login', redirect=request.path))

    last_task = Task.query.filter(
        Task.user_id == user_id).order_by(Task._order.desc()).first()
    last_task_order = last_task._order + 1 if last_task else 0

    order_acc = last_task_order

    new_tasks = []

    for task_data in data.get('tasks'):
        content = task_data.get('content')
        tag_id = task_data.get('tag_id')
        start_date = task_data.get('start_date')
        end_date = task_data.get('end_date')
        if None in (content, tag_id, start_date, end_date):
            return jsonify(
                error='Parameters content, tag_id, start_date, and '
                      'end_date are required!')

        parent_task = task_data.get('parent_task')

        order = order_acc
        order_acc += 1

        completed = task_data.get('completed', False)
        in_focus = task_data.get('in_focus', False)

        new_task = Task(user_id=user_id, content=content,
                        start_date=start_date, end_date=end_date,
                        tag_id=tag_id, parent_task=parent_task,
                        _order=order, completed=completed, in_focus=in_focus)
        new_tasks.append(new_task)
        db.session.add(new_task)

    db.session.commit()  # necessary to get the task id
    new_tasks_json = [util.sqlalchemy_obj_to_dict(t) for t in new_tasks]

    return jsonify(created=new_tasks_json)


@api.route('/tasks/all', methods=['GET'])
def get_all_tasks():
    user_id = get_user_id(request.args.get('token'))
    if not user_id:
        return redirect(url_for('api.login', redirect=request.path))
    tasks = Task.query \
        .filter(Task.user_id == user_id) \
        .filter(Task.deleted == False) \
        .all()
    return jsonify(util.table_to_json(tasks))


@api.route('/tasks/<task_id>/delete', methods=['PUT'])
def delete_task(task_id):
    data = request.get_json(force=True)
    if not data or 'token' not in data:
        return jsonify(error='token not passed in')
    user_id = get_user_id(data['token'])
    if not user_id:
        return redirect(url_for('api.login', redirect=request.path))
    # delete all subtasks within a task
    tasks = Task.query \
        .filter(Task.user_id == user_id) \
        .filter(or_(Task.task_id == task_id, Task.parent_task == task_id)) \
        .all()
    for task in tasks:
        task.deleted = True
    db.session.commit()
    return jsonify(status='success')


@api.route('/tasks/batch_delete', methods=['PUT'])
def delete_tasks():
    data = request.get_json(force=True)
    if not data or 'token' not in data:
        return jsonify(error='token not passed in')
    user_id = get_user_id(data['token'])
    task_ids = data['deleted']
    for task_id in task_ids:
        tasks = Task.query \
            .filter(Task.user_id == user_id) \
            .filter(or_(Task.task_id == task_id, Task.parent_task == task_id)) \
            .all()
        for task in tasks:
            task.deleted = True
    db.session.commit()
    return jsonify(status='success')


@api.route('/tasks/<task_id>/edit', methods=['POST'])
def edit_task(task_id):
    data = request.get_json(force=True)
    if not data or 'token' not in data:
        return jsonify(error='token not passed in')
    user_id = get_user_id(data['token'])
    if not user_id:
        return redirect(url_for('api.login', redirect=request.path))
    task = Task.query.filter(Task.user_id == user_id).filter(
        Task.task_id == task_id).first()
    if task is None:
        return jsonify(status='error. task not found.')

    task.content = data.get('content', task.content)
    task.tag_id = data.get('tag_id', task.tag_id)
    task.start_date = data.get('start_date', task.start_date)
    task.end_date = data.get('end_date', task.end_date)
    task.completed = data.get('completed', task.completed)
    task.in_focus = data.get('in_focus', task.in_focus)
    task.parent_task = data.get('parent_task', task.parent_task)
    task._order = data.get('_order', task._order)
    db.session.commit()
    return jsonify(task=util.sqlalchemy_obj_to_dict(task))


@api.route('/tasks/batch_edit', methods=['POST'])
def edit_tasks():
    data = request.get_json(force=True)
    if not data or 'token' not in data:
        return jsonify(error='token not passed in')
    user_id = get_user_id(data['token'])
    if not user_id:
        return redirect(url_for('api.login', redirect=request.path))

    tasks_json = data['tasks']
    for task_json in tasks_json:
        task_id = task_json.get('id')

        task = Task.query.filter(Task.user_id == user_id).filter(
            Task.task_id == task_id).first()
        if task is None:
            return jsonify(status=f'error. task {task_id} not found.')

        task.content = task_json.get('content', task.content)
        task.tag_id = task_json.get('tag_id', task.tag_id)
        task.start_date = task_json.get('start_date', task.start_date)
        task.end_date = task_json.get('end_date', task.end_date)
        task.completed = task_json.get('completed', task.completed)
        task.in_focus = task_json.get('in_focus', task.in_focus)
        task.parent_task = task_json.get('parent_task', task.parent_task)
        task._order = task_json.get('_order', task._order)
    db.session.commit()

    return jsonify(status='success')
