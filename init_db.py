from contextlib import closing

from app import app
from models import connect_db


def init_db():
    print 'sync db...'
    with closing(connect_db()) as db:
        with app.open_resource('schema.sql') as f:
            db.cursor().executescript(f.read())
        db.commit()
    print 'done !'


if __name__ == '__main__':
    init_db()
