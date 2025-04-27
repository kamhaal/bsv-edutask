import pytest
from src.util.dao import DAO

@pytest.fixture
def test_dao():
    """Fixture providing a DAO instance with a temporary test collection"""
    # Skapa DAO-instans - DAO-klassen hanterar redan anslutningen internt
    dao = DAO("user")
    
    # Rensa collection innan tester börjar (istället för bara efter)
    dao.collection.delete_many({})
    
    yield dao
    
    # Cleanup: drop the test collection after tests
    dao.collection.drop()