import os
import sqlite3
import time

from flask import g

DATABASE = os.path.join(os.path.dirname(__file__), 'database.db')


def connect_db():
    return sqlite3.connect(database=DATABASE)


class DataAccess(object):

    def save(self):
        fields = self.__dict__
        query = 'INSERT INTO {0}({1}) VALUES({2})'.format(
            self.__class__.__name__,
            (', '.join(column for column in fields.keys())),
            (', '.join(str(fields[key] if isinstance(fields[key], int) else '"{0}"'.format(fields[key]))for key in fields.keys()))
        )

        with g.db:
            cursor = g.db.cursor()
            cursor.execute(query)
            result = cursor.rowcount
        return result


    @classmethod
    def delete(cls, *args, **kwargs):
        """
        only supports one parameter of type integer (for now :))
        """
        query = 'DELETE FROM {0} WHERE {1} = {2}'.format(
            cls.__name__, kwargs.keys()[0], kwargs.get(kwargs.keys()[0]))

        with g.db:
            cursor = g.db.cursor()
            cursor.execute(query)
            result = cursor.rowcount
        return result

    @classmethod
    def list(cls, *args, **kwargs):
        query = 'SELECT {0} FROM {1}'.format(
            ', '.join(args) if len(args) else '*',
            cls.__name__
        )
        if len(kwargs):
            query += ' WHERE ' + ' AND '.join('{0} = {1} '.format(
                key, kwargs[key] if isinstance(kwargs[key], int) else '"{0}"'.format(kwargs[key])
            ) for key in kwargs.keys())
        with g.db:
            cursor = g.db.cursor()
            cursor.execute(query)
            result = [dict((cursor.description[idx][0], value) for idx, value in enumerate(row)) for row in cursor.fetchall()]
        return result


class Task(DataAccess):

    id_ = 0
    name = ''
    description = ''
    column = ''
    author = ''

    def __init__(self, data):
        #super(DataAccess, self).__init__()
        try:
            data = dict(eval(data))
        except:
            pass
        else:
            """
            self.name = data['name']
            self.description = data['description']
            self.column = data['column']
            self.author = data['author']
            """
            self.__dict__.update(data)
            #unix time
            self.id_ = int(time.time())

    @property
    def to_dict(self):
        return self.__dict__
