from flask import request, Blueprint, jsonify

from app.api.models import Tag, Task

api = Blueprint('api', __name__, url_prefix='/api')


@api.route('/', methods=['GET'])
def index():
    return jsonify(status='success')


@api.route('/tags/all', methods=['GET'])
def get_tags():
    pass


@api.route('/tags/new', methods=['POST'])
def new_tag():
    pass


@api.route('/tasks/all', methods=['GET'])
def get_tasks():
    pass


@api.route('/tasks/new', methods=['POST'])
def new_task():
    pass
