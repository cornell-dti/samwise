import random
import string

from app import db
# Imported so that sqlalchemy knows what tables to create
from app.api import models

if __name__ == '__main__':
    print('\n\nWARNING! ALL data in the database will be destroyed.')
    password = ''.join(random.choice(string.ascii_letters) for i in range(6))
    user_input = input(
        f'Please type the following string to confirm: {password}\n')
    while user_input != password:
        password = ''.join(
            random.choice(string.ascii_letters) for i in range(6))
        user_input = input(
            f'Try again. Please type the following string: {password}\n')
    db.drop_all()
    db.create_all()
