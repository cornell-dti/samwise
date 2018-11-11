def table_to_json(table):
    """Convert a list of SQLAlchemy objects to a list of dictionaries."""
    converted = []
    for row in table:
        converted.append(sqlalchemy_object_to_dict(row))
    return converted


def sqlalchemy_object_to_dict(sqlalchemy_obj):
    converted = dict()
    for column in sqlalchemy_obj.__table__.columns:
        converted[column.name] = getattr(sqlalchemy_obj, column.name)
    return converted
