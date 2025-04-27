from unittest import mock
import pytest

from src.controllers.usercontroller import UserController

@pytest.fixture
def user_controller(users):
    """fixture to be able to use the mocked dao en every test"""
    dao = mock.Mock()
    dao.find.return_value = users 
    controller = UserController(dao=dao)
    return controller

@pytest.fixture
def user_controller_with_error(exception):
    """fixture to be able to use the mocked dao en every test that has an error """
    
    dao = mock.Mock()
    dao.find.side_effect = Exception(exception)
    controller = UserController(dao=dao)
    return controller

@pytest.mark.assignment2
@pytest.mark.parametrize('users, mail, expected', [
    ([{"name": "Test User", "mail": "user@student.com"}], "user@student.com", {"name": "Test User", "mail": "user@student.com"}),
    ([{"name": "Test User", "mail": "user@student.com"},{"name": "Test User2", "mail": "user@student.com"}], "user@student.com", {"name": "Test User", "mail": "user@student.com"}),
    ([{"name": "Test User", "mail": "user2@student.com"}], "user@student.com", None)
])
def test_user(user_controller, mail, expected):
    """3 tests to get user when the user exist and when there is 2 users with same email and when when the user doesn't exist"""
    result = user_controller.get_user_by_email(mail)
    assert result == expected
    
@pytest.mark.assignment2
@pytest.mark.parametrize('users', [
    ([{"name": "Test User", "mail": "user@student.com"}], "user@student.com", {"name": "Test User", "mail": "user@student.com"})
])
def test_two_user_exist(user_controller,capsys):
    """test if there is a warning message when there is 2 useers have the same email"""
    user_controller.get_user_by_email("user@student.com")
    captured = capsys.readouterr()
    assert "more than one user" in captured.out
    
    
@pytest.mark.assignment2
@pytest.mark.parametrize('email, exception, error', [
    ("usertest@gmail.com",Exception("Database connection failed"),Exception),
    ("usertest",None,ValueError)
])
def test_user_with_error(user_controller_with_error, email, error):
    """test that it rasis error when the email is invaild and when the user exist but the database fails"""
    with pytest.raises(error):
        user_controller_with_error.get_user_by_email(email) 
    
