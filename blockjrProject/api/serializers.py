from dataclasses import fields
from rest_framework import serializers
from .models import Course, Submission, User, Design, Participation

# User
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('uid', 'username', 'password', 'email', 'role', 'gender', 'creationdate')
        # to hide password in /api/user
        # extra_kwargs = {'password': {'write_only': True, 'required': True}}
    # def create(self, validated_data):
    #     user = User.objects.create_user(**validated_data)
    #     Token.objects.create(user=user) 
    #     return user

class SignupSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'role', 'gender')

class LoginSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'password')

# Design
class DesignSerializer(serializers.ModelSerializer):
    class Meta:
        model = Design
        fields = ('did', 'uid', 'workspace', 'transformation', 'title', 'difficulty', 'creator', 'desc', 'hint', 'creationdate')

class SaveDesignSerializer(serializers.ModelSerializer):
    class Meta:
        model = Design
        fields = ('uid', 'title', 'workspace', 'difficulty', 'creator', 'desc', 'hint')

class UpdateDesignSerializer(serializers.ModelSerializer):
    class Meta:
        model = Design
        fields = ('did', 'uid', 'workspace', 'title', 'difficulty', 'creator', 'desc', 'hint')

# Course
class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ('cid', 'uid', 'title', 'tags', 'passing' ,'creator', 'desc', 'challenges', 'creationdate', 'status')

class SaveCourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ('uid', 'title', 'tags', 'passing', 'creator', 'desc', 'challenges')

class UpdateCourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ('cid', 'uid', 'title', 'tags', 'passing', 'creator', 'desc', 'challenges')

# Participation
class ParticipationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Participation
        fields = ('uid', 'cid', 'joindate')

class SaveParticipationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Participation
        fields = ('uid', 'cid')

# Submission
class SubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = ('sid', 'uid', 'cid', 'did', 'workspace', 'translation', 'transformation', 'score', 'feedback' ,'submissiondate')

class SaveSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = ('uid', 'cid', 'did', 'workspace')