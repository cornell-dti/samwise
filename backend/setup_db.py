import random
import string

from app import db
from app.api import models  # Imported so that sqlalchemy knows what tables to create

if __name__ == '__main__':
    print('\n\nWARNING! ALL data in the database will be destroyed.')
    password = ''.join(random.choice(string.ascii_letters) for i in range(6))
    user_input = input('Please type the following string to confirm: {}\n'.format(password))
    while user_input != password:
        password = ''.join(random.choice(string.ascii_letters) for i in range(6))
        user_input = input('Try again. Please type the following string: {}\n'.format(password))
    db.drop_all()
    db.create_all()
