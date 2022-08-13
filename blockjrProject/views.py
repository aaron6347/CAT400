import re
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

# Create your views here.
@csrf_exempt

# User
def login(request):
    pageTitle = "Login to blockJr"
    return render(request, 'frontend/index.html', {'pageTitle': pageTitle})
def home(request):
    pageTitle = "Welcome to blockJr"
    return render(request, 'frontend/index.html', {'pageTitle': pageTitle})


# Design
def browseChallenges(request):
    pageTitle = "Browse Challenges | blockJr"
    return render(request, 'frontend/index.html', {'pageTitle': pageTitle})
def viewChallenge(request, *args, **kwargs):
    pageTitle = "View Challenge | blockJr"
    return render(request, 'frontend/splitIndex.html', {'pageTitle': pageTitle})
def designChallenge(request, *args, **kwargs):
    pageTitle = "Design Challenge | blockJr"
    return render(request, 'frontend/splitIndex.html', {'pageTitle': pageTitle})
def manageChallenges(request):
    pageTitle = "Manage Challenges | blockJr"
    return render(request, 'frontend/index.html', {'pageTitle': pageTitle})


# Courses
def browseCourses(request): # teacher and student
    pageTitle = "Browse Courses | blockJr"
    return render(request, 'frontend/index.html', {'pageTitle': pageTitle})
def viewCourse(request, *args, **kwargs):   # teacher and student
    pageTitle = "Course Description | blockJr"
    return render(request, 'frontend/splitIndex.html', {'pageTitle': pageTitle})
def createCourse(request, *args, **kwargs):
    pageTitle = "Create Course | blockJr"
    return render(request, 'frontend/splitIndex.html', {'pageTitle': pageTitle})
def manageCourses(request):
    pageTitle = "Manage Courses | blockJr"
    return render(request, 'frontend/index.html', {'pageTitle': pageTitle})
def attemptChallenge(request, *args, **kwargs): # student
    pageTitle = "Attempt Challenge | blockJr"
    return render(request, 'frontend/splitIndex.html', {'pageTitle': pageTitle})


# Participation
def viewParticipation(request): # student
    pageTitle = "View Participation | blockJr"
    return render(request, 'frontend/index.html', {'pageTitle': pageTitle})


def error(request): # student
    pageTitle = "Error | blockJr"
    return render(request, 'frontend/index.html', {'pageTitle': pageTitle})