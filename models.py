import datetime
from sqlalchemy import Column,Integer,String,Float,DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy import create_engine, ForeignKey
from passlib.apps import custom_app_context as pwd_context
import random, string
from itsdangerous import(TimedJSONWebSignatureSerializer as Serializer, BadSignature, SignatureExpired)

Base = declarative_base()
secret_key = ''.join(random.choice(string.ascii_uppercase + string.digits) for x in range(32))

class User(Base):
    __tablename__ = 'user'
    id = Column(Integer, primary_key=True)
    username = Column(String(32), index=True)
    password_hash = Column(String(64))
    hearttests = relationship("HeartTest", backref="user")
    def hash_password(self, password):
        self.password_hash = pwd_context.encrypt(password)

    def verify_password(self, password):
        return pwd_context.verify(password, self.password_hash)

    def generate_auth_token(self, expiration=600):
    	s = Serializer(secret_key, expires_in = expiration)
    	return s.dumps({'id': self.id })

    @staticmethod
    def verify_auth_token(token):
    	s = Serializer(secret_key)
    	try:
    		data = s.loads(token)
    	except SignatureExpired:
    		#Valid Token, but expired
    		return None
    	except BadSignature:
    		#Invalid Token
    		return None
    	user_id = data['id']
    	return user_id
    

class HeartTest(Base):
    __tablename__ = 'hearttest'
    id = Column(Integer, primary_key=True)
    firstname = Column(String(32))
    lastname = Column(String(32))
    patientno = Column(String(32))
    age = Column(Float(1))
    sex = Column(Float(1))
    cp = Column(Float(1))
    trestbps = Column(Float(1))
    chol = Column(Float(1))
    fbs = Column(Float(1))
    restecg = Column(Float(1))
    thalach = Column(Float(1))
    exang = Column(Float(1))
    oldpeak = Column(Float(1))
    slope = Column(Float(1))
    ca = Column(Float(1))
    thal = Column(Float(1))
    result = Column(Float(1))
    user_id = Column(Integer, ForeignKey("user.id"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    @property
    def serialize(self):
        """Return object data in easily serializeable format"""
        return {
        'id' : self.id,
        'firstname':self.firstname,
        'lastname':self.lastname,
        'patientno':self.patientno,
        'age' : self.age,
        'sex' : self.sex,
        'cp' : self.cp,
        'trestbps' : self.trestbps,
        'chol' : self.chol,
        'fbs' : self.fbs,
        'restecg' : self.restecg,
        'thalach' : self.thalach,
        'exang' : self.exang,
        'oldpeak' : self.oldpeak,
        'slope' : self.slope,
        'ca' : self.ca,
        'thal' : self.thal,
        'result':self.result
            }

engine = create_engine('sqlite:///medic.db')
 

Base.metadata.create_all(engine)
    
