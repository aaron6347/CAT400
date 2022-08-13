from django.urls import path
from api import views

urlpatterns = [
    # User
    path('user', views.UserView.as_view()),
    path('signup', views.SignupView.as_view()), #Signup
    path('login', views.LoginView.as_view()),   #Login
    path('getUsername', views.GetUsernameView.as_view()), #home, design/ChallengeDes, CourseDes
    path('getRole', views.GetRoleView.as_view()),   #Navbar, ViewCourse
    

    # Design
    path('design', views.DesignView.as_view()),
    path('getDesign', views.GetDesignView.as_view()), #design/ChallengeDes(did), ChallengeInput(uid), ManageChallenge(uid), view/ChallengeDes(did), attempt/ChallengeDes(did)
    path('requestEditDesign', views.RequestEditDesignView.as_view()),   #ViewChallenge
    path('saveDesign', views.SaveDesignView.as_view()), #DesignChallenge
    path('updateDesign', views.UpdateDesignView.as_view()), #DesignChallenge
    path('deleteDesign', views.DeleteDesignView.as_view()), #ManageChallenge
    path('getTranslation', views.GetTranslation.as_view()), #CodeTranslation


    # Course
    path('course', views.CourseView.as_view()),
    path('getCourse', views.GetCourseView.as_view()), #CourseDes(cid), ChallengeInput(cid), ManageCourse(uid), ViewCourse(cid)
    path('requestEditCourse', views.RequestEditCourseView.as_view()),   #ViewCourse
    path('saveCourse', views.SaveCourseView.as_view()), #CreateCourse
    path('updateCourse', views.UpdateCourseView.as_view()), #CreateCourse
    path('deleteCourse', views.DeleteCourseView.as_view()), #ManageCourse


    # Participation
    path('participation', views.ParticipationView.as_view()),
    path('getParticipation', views.GetParticipationView.as_view()), #ViewCourse(uid, cid), ViewParticipation(uid)
    path('saveParticipation', views.SaveParticipationView.as_view()), #ViewCourse
    path('deleteParticipation', views.DeleteParticipationView.as_view()),   #ViewParticipation


    # Submission
    path('submission', views.SubmissionView.as_view()),
    path('getSubmission', views.GetSubmissionView.as_view()), #AttemptChallenge
    path('saveSubmission', views.SaveSubmissionView.as_view()), #AttemptChallenge
    path('getLatestSubmission', views.GetLatestSubmissionView.as_view()),   #ViewCourse
    path('getHighScore', views.GetHighScoreView.as_view()), #ViewCourse
    path('requestNextChallenge', views.RequestNextChallengeView.as_view()), #AttemptChallenge


]
