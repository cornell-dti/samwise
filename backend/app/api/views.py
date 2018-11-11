from flask import request, Blueprint, jsonify

from app import db, util
from app.api.models import Tag, Task
from app import auth

api = Blueprint('api', __name__, url_prefix='/api')


def get_user_id(firebase_id_token):
    decoded_token = auth.auth.verify_id_token(firebase_id_token)
    return decoded_token['uid']


@api.route('/', methods=['GET'])
def index():
    return jsonify(status='success')


@api.route('/test', methods=['GET'])
def test_auth():
    return '''
    <script src="https://www.gstatic.com/firebasejs/5.5.8/firebase.js"></script>
    <script>
      var config = {
        apiKey: "AIzaSyBrnR-ai3ZQrr3aYnezDZTZdw9e2TWTRtc",
        authDomain: "dti-samwise.firebaseapp.com",
        databaseURL: "https://dti-samwise.firebaseio.com",
        projectId: "dti-samwise",
        storageBucket: "dti-samwise.appspot.com",
        messagingSenderId: "114434220691"
      };
      firebase.initializeApp(config);
      
      var provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
      firebase.auth().useDeviceLanguage();
      provider.setCustomParameters({
        'login_hint': 'user@example.com'
      });

      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          firebase.auth().currentUser.getIdToken(true).then(function(idToken) {
            fetch('http://localhost:5000/api/tags/all?token=' + idToken).then(function(response) {
              response.json().then(function (data) {
                alert(JSON.stringify(data));
              });
            });
          }).catch(function(error) {
            console.log(error);
          });  
        } else {
          firebase.auth().signInWithRedirect(provider);
          firebase.auth().getRedirectResult().then(function(result) {
            var token = result.credential.accessToken;
            var user = result.user;
          }).catch(function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            var email = error.email;
            var credential = error.credential;
          });
        }
      });
    </script>
    '''


@api.route('/tags/all', methods=['GET'])
def get_tags():
    # TODO Use current user id instead of hardcoded 1
    id_token = request.args['token']
    user_id = get_user_id(id_token)
    return jsonify(status='success')
    tags = Tag.query.filter(Tag.user_id == user_id).all()
    tags_json = util.table_to_json(tags)
    return jsonify(tags_json)


@api.route('/tags/focus', methods=['GET'])
def get_tags_in_focus():
    # TODO Use current user id instead of hardcoded 1
    user_id = 1
    tags = Tag.query.filter(Tag.user_id == user_id).filter(Tag.active == True).all()
    tags_json = util.table_to_json(tags)
    return jsonify(tags_json)


@api.route('/tags/<tag_id>/focus', methods=['POST'])
def set_tag_focus(tag_id):
    """
    Format:
    {
        "focus": true|false
    }
    """
    # TODO Use current user id instead of hardcoded 1
    user_id = 1
    data = request.get_json(force=True)
    focus = data.get('focus')
    tag = Tag.query.filter(Tag.user_id == user_id).filter(Tag.tag_id == tag_id).first()
    if tag is None:
        return jsonify(status='error. tag not found.')
    if focus is None:
        return jsonify(status='error. key "focus" is required.')
    tag.active = focus
    db.session.commit()
    return jsonify(tag=util.sqlalchemy_object_to_dict(tag))


@api.route('/tags/new', methods=['POST'])
def new_tag():
    """
    Input format:
    {
        "name": "Tag name",
        "color": "#ffffff"
    }
    """
    # TODO Use current user id instead of hardcoded 1
    user_id = 1
    data = request.get_json(force=True)
    tag_name = data['name']
    color = data['color']
    last_tag = Tag.query.filter(Tag.user_id == user_id).order_by(Tag._order.desc()).first()
    order = last_tag._order + 1 if last_tag else 0
    tag = Tag(user_id=user_id, tag_name=tag_name, active=True, color=color, _order=order, archived=False)
    db.session.add(tag)
    db.session.commit()
    return jsonify(created=util.sqlalchemy_object_to_dict(tag))


@api.route('/tags/<tag_id>/tasks/all', methods=['GET'])
def get_tasks(tag_id):
    # TODO Use current user id instead of hardcoded 1
    user_id = 1
    tasks = Task.query.filter(Task.tag_id == Tag.tag_id).filter(Tag.user_id == user_id).filter(
        Tag.tag_id == tag_id).all()
    return jsonify(util.table_to_json(tasks))


@api.route('/tags/<tag_id>/tasks/new', methods=['POST'])
def new_task(tag_id):
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
                    _order=order, archived=False)
    db.session.add(new_task)
    db.session.commit()
    return jsonify(created=util.sqlalchemy_object_to_dict(new_task))
