from sklearn.externals import joblib
from weasyprint import HTML
from jinja2 import Environment, FileSystemLoader
import pandas as pd
from models import Base, User, HeartTest
from flask import Flask, jsonify, request, url_for, abort, g, render_template,make_response, send_file, make_response,send_from_directory
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy import create_engine
from flask.ext.httpauth import HTTPBasicAuth
import json
from oauth2client.client import flow_from_clientsecrets, FlowExchangeError
import httplib2
import requests

auth = HTTPBasicAuth()


engine = create_engine('sqlite:///medic.db')

Base.metadata.bind = engine
DBSession = sessionmaker(bind=engine)
session = DBSession()
app = Flask(__name__)



@auth.verify_password
def verify_password(username_or_token, password):
    #Try to see if it's a token first
    user_id = User.verify_auth_token(username_or_token)
    if user_id:
        user = session.query(User).filter_by(id = user_id).one()
    else:
        user = session.query(User).filter_by(username = username_or_token).first()
        if not user or not user.verify_password(password):
            return False
    g.user = user
    return True

@app.route('/')
def start():
    return render_template('index.html')


@app.route('/token')
@auth.login_required
def get_auth_token():
    token = g.user.generate_auth_token()
    return jsonify({'token': token.decode('ascii')})



@app.route('/users', methods = ['POST'])
def new_user():
    username = request.json.get('username')
    password = request.json.get('password')
    if username is None or password is None:
        print ("missing arguments")
        abort(400)

    if session.query(User).filter_by(username = username).first() is not None:
        print ("existing user")
        user = session.query(User).filter_by(username=username).first()
        return jsonify({'message':'user already exists'}), 200#, {'Location': url_for('get_user', id = user.id, _external = True)}

    user = User(username = username)
    user.hash_password(password)
    session.add(user)
    session.commit()
    return jsonify({ 'username': user.username }), 201#, {'Location': url_for('get_user', id = user.id, _external = True)}

@app.route('/api/v1/users/<username>')
def get_user(username):
    user = session.query(User).filter_by(username = username).first()
    if not user:
        abort(400)
    return jsonify({ 'id':user.id, 'username': user.username })

@app.route('/api/v1/hearttests', methods = ['GET', 'POST'])
@auth.login_required
def showAllHeartTests():
    if request.method == 'GET':
        hearttests = session.query(HeartTest).filter_by(user_id = g.user.id).all()
        return jsonify(hearttests = [h.serialize for h in hearttests])
    if request.method == 'POST':
        firstname = request.json.get('firstname')
        lastname = request.json.get('lastname')
        patientno = request.json.get('patientno')
        age = request.json.get('age')
        sex = request.json.get('sex')
        cp = request.json.get('cp')
        trestbps = request.json.get('trestbps')
        chol = request.json.get('chol')
        fbs = request.json.get('fbs')
        restecg = request.json.get('restecg')
        thalach = request.json.get('thalach')
        exang = request.json.get('exang')
        oldpeak = request.json.get('oldpeak')
        slope = request.json.get('slope')
        ca = request.json.get('ca')
        thal = request.json.get('thal')
        heart_test = {'age':age,'sex':sex, 'cp':cp,'trestbps':trestbps,'chol':chol,'fbs':fbs,'restecg':restecg, \
        'thalach':thalach,'exang':exang,'oldpeak':oldpeak,'slope':slope, 'ca':ca,'thal':thal}
        heart_test = pd.Series(heart_test)
        heart_test = heart_test.reshape(1,-1)
        result = joblib.load('VotingClassifier.pkl').predict(heart_test)
        result = float(result[0])
        heartTest = HeartTest(firstname = firstname,lastname = lastname,patientno = patientno,age = age,sex = sex,cp = cp, \
        trestbps = trestbps,chol = chol,fbs = fbs, restecg = restecg,thalach = thalach,exang = exang,oldpeak = oldpeak,slope = slope,ca = ca, \
        thal = thal, result = result, user_id = g.user.id)
        session.add(heartTest)
        session.commit()
        return jsonify(heartTest.serialize)



@app.route('/api/v1/hearttests/<int:id>', methods = ['GET', 'DELETE'])
@auth.login_required
def getHeartTest(id):
    heartTest = session.query(HeartTest).filter_by(id = id,user_id=g.user.id).first()
    if request.method == 'GET':
        heartTest = jsonify(heartTest.serialize)
        return heartTest
    if request.method == 'DELETE':
        session.delete(heartTest)
        session.commit()
        return jsonify({'message':'HeartTest Successfully deleted'})

		
@app.route('/api/v1/download/hearttests/<int:id>', methods = ['GET'])
@auth.login_required
def downloadHeartTest(id):
    heartTest = session.query(HeartTest).filter_by(id = id,user_id=g.user.id).first()
    env = Environment(loader=FileSystemLoader('templates'))
    template = env.get_template("report.html")
    template_vars = {"hearttest": heartTest, 'cp': {1:'Typical angina',2:'Atypical angina',3:'Non-anginal pain',4:'Asymptomatic'}, 
    'thal': {3:'Normal',6:'Fixed Defect',7:'Reversable Defect'},
    'restecg': {0:"Normal",1:"Having ST-T wave abnormality",2:"Showing probable or definite left ventricular hypertrophy by Estes' criteria"}, 
    'slope' : {1:'Upsloping',2:'Flat',3:'Downsloping'}}
    html_out = template.render(template_vars)
    HTML(string=html_out).write_pdf("report.pdf")
    return send_from_directory('','report.pdf', as_attachment=True, mimetype='application/octet-stream')


if __name__ == '__main__':
    app.debug = True
    #app.config['SECRET_KEY'] = ''.join(random.choice(string.ascii_uppercase + string.digits) for x in xrange(32))
    app.run(host='0.0.0.0', port=5002)
