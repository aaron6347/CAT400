from django.contrib import admin
from django.urls import path
from frontend import views

urlpatterns = [
    # User
    path('login', views.login),
    path('home', views.home),


    # Design
    path('browseChallenges/', views.browseChallenges),
    path('viewChallenge/<str:did>', views.viewChallenge),
    path('designChallenge/', views.designChallenge),
    path('designChallenge/<str:did>', views.designChallenge),
    path('manageChallenges/', views.manageChallenges),


    # Courses
    path('browseCourses/', views.browseCourses), # teacher and student
    path('viewCourse/<str:cid>', views.viewCourse), # teacher and student
    path('createCourse/', views.createCourse),
    path('createCourse/<str:cid>', views.createCourse),
    path('manageCourses/', views.manageCourses),
    path('attemptChallenge/<str:params>', views.attemptChallenge), # student


    # Participation
    path('viewParticipation/', views.viewParticipation),    # student


    path('error/', views.error),
]
