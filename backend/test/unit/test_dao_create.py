# test/test_dao_create.py

import pytest
import os
import pymongo
from src.util.dao import DAO
from unittest import mock
from unittest.mock import patch
from pymongo.errors import PyMongoError


@pytest.mark.assignment3
def test_dao_creating_collection():
    """Fixture providing a DAO instance with a temporary test collection"""
    
    with pytest.raises(Exception):
            DAO("testuser")


@pytest.mark.assignment3
def test_create_valid_user(test_dao):
    """test to create a user"""
    
    user = {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com"
    }
    result = test_dao.create(user)
    assert result["firstName"] == "John"

        
@pytest.mark.assignment3
def test_create_with_database_failure(test_dao):
    "test to create user but the database fails"
    user = {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com"
    }

    with patch.object(test_dao.collection, 'insert_one', side_effect=PyMongoError("Database failure")):
        with pytest.raises(Exception):
            test_dao.create(user)



@pytest.mark.assignment3
@pytest.mark.parametrize('user', [
    ({
        "firstName": "Jack",
        "lastName": "exampel",
        "email": 123456
    }),
    ({
        "firstName": "Jack",
        "lastName": "exampel"
    }),
])
def test_create_wrong_data_or_type(test_dao,user):
    """Test to create user when we send erong data type or not sending a required faild"""
    
   
    with pytest.raises(Exception):
        test_dao.create(user)


@pytest.mark.assignment3
def test_create_duplicate_email(test_dao):
    """Test to create a user with same email thats exist and it should be uniqe"""
    
    user1 = {
        "firstName": "Tom",
        "lastName": "exampel",
        "email": "tom.exampel@example.com"
    }
    user2 = {
        "firstName": "Tommy",
        "lastName": "exampel",
        "email": "tom.exampel@example.com"  
    }
    test_dao.create(user1)
    with pytest.raises(Exception):
        test_dao.create(user2)


