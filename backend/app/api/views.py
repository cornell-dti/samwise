from flask import request, Blueprint, jsonify

from app import db, util
from app.api.models import Tag, Task

api = Blueprint('api', __name__, url_prefix='/api')


@api.route('/', methods=['GET'])
def index():
    return jsonify(status='success')


@api.route('/tags/all', methods=['GET'])
def get_tags():
    # TODO Use current user id instead of hardcoded 1
    tags = Tag.query.filter(Tag.user_id == 1).all()
    tags_json = util.table_to_json(tags)
    return jsonify(tags_json)


@api.route('/tags/new', methods=['POST'])
def new_tag():
    """
    Input format:
    {
        "user_id": "user_id", // might not need
        "name": "Tag name",
        "color": "#ffffff"
    }
    """
    data = request.get_json(force=True)
    user_id = data['user_id']
    tag_name = data['name']
    color = data['color']
    last_tag = Tag.query.filter(Tag.user_id == user_id).order_by(Tag._order.desc()).first()
    order = last_tag._order + 1
    tag = Tag(user_id=user_id, tag_name=tag_name, active=True, color=color, _order=order, archived=False)
    db.session.add(tag)
    db.session.commit()
    return jsonify(created=util.sqlalchemy_object_to_dict(tag))


@api.route('/tags/<tag_id>/tasks/all', methods=['GET'])
def get_tasks(tag_id):
    pass


@api.route('/tags/<tag_id>/tasks/new', methods=['POST'])
def new_task(tag_id):
    pass
