import json

from flask import Flask, request, Response, g
from flask.templating import render_template

from models import Task, connect_db


app = Flask(__name__)


@app.before_request
def before_request():
    g.db = connect_db()

@app.teardown_request
def teardown_request(exception):
    if hasattr(g, 'db'):
        g.db.close()


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/api/tasks', defaults={'task_id': 0}, methods=['POST', 'GET'])
@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def api_task(task_id=0):
    response = Response()
    response.content_type = 'application/json;charset=UTF-8'
    if request.method == 'DELETE':
        Task.delete(id_=task_id)
        response.response = json.dumps({'error': False, 'deleted': True, 'id_': task_id})
    elif request.method == 'GET':
        response.response = json.dumps(
            Task.list(column=request.args.get('column', 'A'))
        )
    else:
        task = Task(request.data)
        task.save()
        json_response = dict()
        json_response['error'] = False
        json_response['data'] = task.to_dict
        response.response = json.dumps(json_response)
    return response


if __name__ == '__main__':
    app.run(debug=True)
