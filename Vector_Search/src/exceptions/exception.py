from Vector_Search.src.utils.config.config import Errors
class NoBrokerConnection(Exception):
    def __init__(self):
        super().__init__(Errors.NO_BROKER_CONNECTION)

class NoSearchResult(Exception):
    def __init__(self):
        super().__init__(Errors.NO_SEARCH_RESULT)

class NoIdentifiedPerson(Exception):
    def __init__(self):
        super().__init__(Errors.NO_IDENTIFIED_PERSON)

class NoElasticConnection(Exception):
    def __init__(self):
        super().__init__(Errors.NO_ELASTIC_CONNECTION)

class NoAddedVector(Exception):
    def __init__(self, _vector):
        super().__init__(Errors.NO_ADDED_VECTOR(_vector))

class SearchGotWrong(Exception):
    def __init__(self):
        super().__init__(Errors.SEARCH_GOT_WRONG)
