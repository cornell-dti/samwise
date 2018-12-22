# TODO strip off unnecessary fields


def sqlalchemy_object_to_dict(sqlalchemy_obj):
    converted = dict()
    for column in sqlalchemy_obj.__table__.columns:
        converted[column.name] = getattr(sqlalchemy_obj, column.name)
    return converted


def table_to_json(table):
    """
    Convert a list of SQLAlchemy objects to a list of dictionaries.

    :param table: a table of rows.
    :return: a list of converted json.
    """
    return [sqlalchemy_object_to_dict(row) for row in table]
