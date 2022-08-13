from django import views
from rest_framework import generics, status, views, response
from django.db.models import Avg, Count
from .models import User, Design, Course, Participation, Submission
from .serializers import UserSerializer, SignupSerializer, LoginSerializer
from .serializers import DesignSerializer, SaveDesignSerializer, UpdateDesignSerializer 
from .serializers import CourseSerializer, SaveCourseSerializer, UpdateCourseSerializer 
from .serializers import ParticipationSerializer, SaveParticipationSerializer
from .serializers import SubmissionSerializer, SaveSubmissionSerializer
from .nlp import nlpmain, evaluation

# User
class UserView(generics.ListAPIView):
    serializer_class = UserSerializer
    queryset = User.objects.all()

class SignupView(views.APIView):
    serializer_class = SignupSerializer
    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            username = serializer.data.get('username')
            password = serializer.data.get('password')
            email = serializer.data.get('email')
            role = serializer.data.get('role')
            gender = serializer.data.get('gender')
            userQueryset = User.objects.filter(username=username)
            # if username exist then reject
            if userQueryset.exists():
                return response.Response(status=status.HTTP_406_NOT_ACCEPTABLE)
            # if username does not exist then save
            elif not userQueryset.exists():
                user = User(username=username, password=password, email=email, role=role, gender=gender)
                user.save()
                return response.Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return response.Response(status=status.HTTP_400_BAD_REQUEST)

class LoginView(views.APIView):
    serializer_class = LoginSerializer
    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            username = serializer.data.get('username')
            password = serializer.data.get('password')
            userQueryset = User.objects.filter(username=username, password=password)
            # if credential correct then send uid
            if userQueryset.exists():
                uidField = User._meta.get_field('uid')
                uid = uidField.value_from_object(userQueryset.first())
                return response.Response(uid, status=status.HTTP_200_OK)
            # if credential incorrect then reject
            elif not userQueryset.exists():
                return response.Response(status=status.HTTP_404_NOT_FOUND)
        return response.Response(status=status.HTTP_400_BAD_REQUEST)

class GetUsernameView(views.APIView):
    serializer_class = UserSerializer
    lookup_url_kwarg = "uid"
    def get(self, request, format=None):
        uid = request.GET.get(self.lookup_url_kwarg)
        if uid != None:
            userQueryset = User.objects.filter(uid=uid)
            # if uid exist then send username
            if userQueryset.exists():
                usernameField = User._meta.get_field('username')
                username = usernameField.value_from_object(userQueryset.first())
                return response.Response(username, status=status.HTTP_200_OK)
            # if uid does not exist then reject
            elif not userQueryset.exists():
                return response.Response(status=status.HTTP_404_NOT_FOUND)
        return response.Response(status=status.HTTP_400_BAD_REQUEST)

class GetRoleView(views.APIView):
    serializer_class = UserSerializer
    lookup_url_kwarg = "uid"
    def get(self, request, format=None):
        uid = request.GET.get(self.lookup_url_kwarg)
        if uid != None:
            userQueryset = User.objects.filter(uid=uid)
            # if uid exist then send role
            if userQueryset.exists():
                roleField = User._meta.get_field('role')
                role = roleField.value_from_object(userQueryset.first())
                return response.Response(role, status=status.HTTP_200_OK)
            # if uid does not exist then reject
            elif not userQueryset.exists():
                return response.Response(status=status.HTTP_404_NOT_FOUND)
        return response.Response(status=status.HTTP_400_BAD_REQUEST)


# Design
class DesignView(generics.ListAPIView):
    serializer_class = DesignSerializer
    queryset = Design.objects.all()

class GetDesignView(views.APIView):
    serializer_class = DesignSerializer
    lookup_url_kwarg = 'did' # use in edit mode or save after create mode of design challenge
    lookup_url_kwarg2 = 'uid' # use in manage own challenges
    def get(self, request, format=None):
        did = request.GET.get(self.lookup_url_kwarg)
        uid = request.GET.get(self.lookup_url_kwarg2)
        # edit mode/ save after create mode/ view mode
        if did != None:
            designQueryset = Design.objects.filter(did=did)
            # if design exist then send design data
            if designQueryset.exists():
                design = DesignSerializer(designQueryset[0]).data
                uid = User.objects.get(uid=design['uid'])
                design['uid'] = uid
                return response.Response(DesignSerializer(design).data, status=status.HTTP_200_OK)
            # if design does not exist then reject
            elif not designQueryset.exists():
                return response.Response(status=status.HTTP_404_NOT_FOUND)
        # manage own challenges
        elif did == None and uid != None:
            designQueryset = Design.objects.filter(uid=uid)
            # if user has design data then send design data
            if designQueryset.exists():
                scoreList = []
                submissionList = []
                for each in designQueryset:
                    didField = Design._meta.get_field('did')
                    did = didField.value_from_object(each)
                    submissionQueryset = Submission.objects.filter(did=did).aggregate(Avg('score'), Count('score'))
                    if submissionQueryset['score__avg'] == None:
                        scoreList.append(0)
                    else:
                        scoreList.append(round(int(submissionQueryset['score__avg']), 2))
                    submissionList.append(submissionQueryset['score__count'])
                return response.Response({'designData': DesignSerializer(designQueryset, many=True).data, 'scoreList': scoreList, 'submissionList': submissionList}, status=status.HTTP_200_OK)
            # if user does not have design data then reject
            elif not designQueryset.exists():
                return response.Response(status=status.HTTP_404_NOT_FOUND)
        return response.Response(status=status.HTTP_400_BAD_REQUEST)

class RequestEditDesignView(views.APIView):
    serializer_class = DesignSerializer
    lookup_url_kwarg = 'uid'
    lookup_url_kwarg2 = 'did'
    def get(self, request, format=None):
        uid = request.GET.get(self.lookup_url_kwarg)
        did = request.GET.get(self.lookup_url_kwarg2)
        if uid != None and did != None:
            designQueryset = Design.objects.filter(did=did, uid=uid)
            # if user is the creator then allow edit
            if designQueryset.exists():
                return response.Response(status=status.HTTP_200_OK)
            # if user is not the creator then disallow edit
            elif not designQueryset.exists():
                return response.Response(status=status.HTTP_401_UNAUTHORIZED)
        return response.Response(status=status.HTTP_400_BAD_REQUEST)

class SaveDesignView(views.APIView):
    serializer_class = SaveDesignSerializer
    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            uid = User.objects.get(uid=serializer.data.get('uid'))
            workspace = serializer.data.get('workspace')
            transformation = nlpmain(workspace, "transformation")
            title = serializer.data.get('title')
            difficulty = serializer.data.get('difficulty')
            creator = serializer.data.get('creator')
            desc = serializer.data.get('desc')
            hint = serializer.data.get('hint')
            design = Design(uid=uid, workspace=workspace, transformation=transformation, title=title, difficulty=difficulty, creator=creator, desc=desc, hint=hint)
            design.save()
            return response.Response(DesignSerializer(design).data, status=status.HTTP_201_CREATED) #return obj to send did for saved after create mode
        return response.Response(status=status.HTTP_400_BAD_REQUEST)

class UpdateDesignView(views.APIView):
    serializer_class = UpdateDesignSerializer
    def post(self, request, format=None):
        did = Design.objects.get(did=request.data['did'])
        serializer = self.serializer_class(did, data=request.data)
        if serializer.is_valid():
            transformation = nlpmain(request.data['workspace'], "transformation")
            design = Design.objects.get(did=request.data['did'])
            design.workspace = request.data['workspace']
            design.transformation = transformation
            design.title = request.data['title']
            design.difficulty = request.data['difficulty']
            design.creator = request.data['creator']
            design.desc = request.data['desc']
            design.hint = request.data['hint']
            design.save()
            return response.Response(status=status.HTTP_202_ACCEPTED)
        return response.Response(status=status.HTTP_400_BAD_REQUEST)

class DeleteDesignView(views.APIView):
    serializer_class = DesignSerializer
    lookup_url_kwarg = 'did'
    lookup_url_kwarg2 = 'uid'
    def get(self, request, format=None):
        did = request.GET.getlist(self.lookup_url_kwarg)
        uid = request.GET.get(self.lookup_url_kwarg2)
        if len(did) != 0 and uid != None:
            failList = []
            for ind in range(len(did)):
                if did[ind] != None:
                    designQueryset = Design.objects.filter(did=did[ind], uid=uid)
                    # if design exist then delete the design
                    if designQueryset.exists():
                        # find related course with the design
                        courseQueryset = Course.objects.filter(uid=uid, challenges__icontains=did[ind])
                        challengesField = Course._meta.get_field('challenges')
                        # remove the design from each related course
                        for each in courseQueryset:
                            challenges = challengesField.value_from_object(each)
                            challenges.remove(int(did[ind]))
                            each.challenges = challenges
                            each.save()
                        designQueryset.delete()
                    # if design does not exist then record
                    elif not designQueryset.exists():
                        failList.append(did[ind])
            # retrieve remaining challenges
            designQueryset2 = Design.objects.filter(uid=uid)
            scoreList = []
            submissionList = []
            for each in designQueryset2:
                didField = Design._meta.get_field('did')
                did = didField.value_from_object(each)
                submissionQueryset = Submission.objects.filter(did=did).aggregate(Avg('score'), Count('score'))
                if submissionQueryset['score__avg'] == None:
                    scoreList.append(0)
                else:
                    scoreList.append(round(int(submissionQueryset['score__avg']), 2))
                submissionList.append(submissionQueryset['score__count'])
            return response.Response({'failList': failList, 'designData': DesignSerializer(designQueryset2, many=True).data, 'scoreList': scoreList, 'submissionList': submissionList}, status=status.HTTP_202_ACCEPTED)
            # return response.Response({'failList': failList, 'designData': DesignSerializer(designQueryset2, many=True).data}, status=status.HTTP_202_ACCEPTED)
        return response.Response(status=status.HTTP_400_BAD_REQUEST)

class GetTranslation(views.APIView):
    def post(self, request, format=None):
        workspace = request.data.get('workspace')
        translation = nlpmain(workspace, "translation")
        if translation == "":
            return response.Response(status=status.HTTP_404_NOT_FOUND)
        else:
            return response.Response({'translation': translation}, status=status.HTTP_200_OK)


# Course
class CourseView(generics.ListAPIView):
    serializer_class = CourseSerializer
    queryset = Course.objects.all().filter(status="active")

class GetCourseView(views.APIView):
    serializer_class = CourseSerializer
    lookup_url_kwarg = 'cid' # use in edit mode or saved after create mode of create course
    lookup_url_kwarg2 = 'uid' # use in manage own course
    def get(self, request, format=None):
        cid = request.GET.get(self.lookup_url_kwarg)
        uid = request.GET.get(self.lookup_url_kwarg2)
        # edit mode/ save after create mode/ view mode
        if cid != None:
            courseQueryset = Course.objects.filter(cid=cid)
            # if course exist then send course data
            if courseQueryset.exists():
                course = CourseSerializer(courseQueryset[0]).data
                uid = User.objects.get(uid=course['uid'])
                course['uid'] = uid
                # retrieve related challenges' title
                titleList = []
                challengesField = Course._meta.get_field('challenges')
                challenges = challengesField.value_from_object(courseQueryset.first())
                for each in challenges:
                    designQueryset = Design.objects.filter(did=each)
                    titleField = Design._meta.get_field('title')
                    title = titleField.value_from_object(designQueryset.first())
                    titleList.append(title)
                return response.Response({'courseData': CourseSerializer(course).data, 'titleList': titleList}, status=status.HTTP_200_OK)
            # if course does not exist then reject
            elif not courseQueryset.exists():
                return response.Response(status=status.HTTP_404_NOT_FOUND)
        # manage own course
        elif cid == None and uid != None:
            courseQueryset = Course.objects.filter(uid=uid, status="active")
            # if user has course data then send course data
            if courseQueryset.exists():
                studentList = []
                for each in courseQueryset:
                    cidField = Course._meta.get_field('cid')
                    cid = cidField.value_from_object(each)
                    participationQueryset = Participation.objects.filter(cid=cid).count()
                    studentList.append(participationQueryset)
                return response.Response({'courseData': CourseSerializer(courseQueryset, many=True).data, 'studentList': studentList}, status=status.HTTP_200_OK)
            # if user does not have course data then reject
            elif not courseQueryset.exists():
                return response.Response(status=status.HTTP_404_NOT_FOUND)
        return response.Response(status=status.HTTP_400_BAD_REQUEST)

class RequestEditCourseView(views.APIView):
    serializer_class = CourseSerializer
    lookup_url_kwarg = 'uid'
    lookup_url_kwarg2 = 'cid'
    def get(self, request, format=None):
        uid = request.GET.get(self.lookup_url_kwarg)
        cid = request.GET.get(self.lookup_url_kwarg2)
        if uid != None and cid != None:
            courseQueryset = Course.objects.filter(cid=cid, uid=uid)
            # if user is the creator then allow edit
            if courseQueryset.exists():
                return response.Response(status=status.HTTP_200_OK)
            # if user is not the creator then disallow edit
            elif not courseQueryset.exists():
                return response.Response(status=status.HTTP_401_UNAUTHORIZED)
        return response.Response(status=status.HTTP_400_BAD_REQUEST)

class SaveCourseView(views.APIView):
    serializer_class = SaveCourseSerializer
    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            uid = User.objects.get(uid=serializer.data.get('uid'))
            title = serializer.data.get('title')
            tags = serializer.data.get('tags')
            passing = serializer.data.get('passing')
            creator = serializer.data.get('creator')
            desc = serializer.data.get('desc')
            challenges = serializer.data.get('challenges')
            course = Course(uid=uid, title=title, tags=tags, passing=passing, creator=creator, desc=desc, challenges=challenges)
            course.save()
            return response.Response(CourseSerializer(course).data, status=status.HTTP_201_CREATED) #return obj to send cid for saved after create mode
        return response.Response(status=status.HTTP_400_BAD_REQUEST)

class UpdateCourseView(views.APIView):
    serializer_class = UpdateCourseSerializer
    def post(self, request, format=None):
        cid = Course.objects.get(cid=request.data['cid'])
        serializer = self.serializer_class(cid, data=request.data)
        if serializer.is_valid():
            courseQueryset = Course.objects.filter(cid=serializer.data.get('cid'))
            challengesField = Course._meta.get_field('challenges')
            challenges = challengesField.value_from_object(courseQueryset.first())
            # remove any existing submission when there is removal of coding challenges in the course
            removedList = [each for each in challenges if each not in serializer.validated_data.get('challenges')]
            for challenge in removedList:
                submissionQueryset = Submission.objects.filter(cid=serializer.data.get('cid'), did=challenge)
                if submissionQueryset.exists():
                    submissionQueryset.delete()
            serializer.update(cid, serializer.validated_data)
            return response.Response(status=status.HTTP_202_ACCEPTED)
        return response.Response(status=status.HTTP_400_BAD_REQUEST)

class DeleteCourseView(views.APIView):
    serializer_class = DesignSerializer
    lookup_url_kwarg = 'cid'
    lookup_url_kwarg2 = 'uid'
    def get(self, request, format=None):
        cid = request.GET.getlist(self.lookup_url_kwarg)
        uid = request.GET.get(self.lookup_url_kwarg2)
        if len(cid) != 0 and uid != None:
            failList = []
            for ind in range(len(cid)):
                if cid[ind] != None:
                    courseQueryset = Course.objects.filter(cid=cid[ind], uid=uid)
                    # if course exist then delete the course
                    if courseQueryset.exists():
                        courseQueryset.update(status="deactivated")
                    # if course does not exist then record
                    elif not courseQueryset.exists():
                        failList.append(cid[ind])
            # retrieve remaining courses
            courseQueryset2 = Course.objects.filter(uid=uid, status="active")
            studentList = []
            for each in courseQueryset2:
                cidField = Course._meta.get_field('cid')
                cid = cidField.value_from_object(each)
                participationQueryset = Participation.objects.filter(cid=cid).count()
                studentList.append(participationQueryset)
            return response.Response({'failList': failList, 'courseData': CourseSerializer(courseQueryset2, many=True).data, 'studentList': studentList}, status=status.HTTP_202_ACCEPTED)
            # return response.Response({'failList': failList, 'courseData': CourseSerializer(courseQueryset2, many=True).data}, status=status.HTTP_202_ACCEPTED)
        return response.Response(status=status.HTTP_400_BAD_REQUEST)


# Participation
class ParticipationView(generics.ListAPIView):
    serializer_class = ParticipationSerializer
    queryset = Participation.objects.all()

class GetParticipationView(views.APIView):
    serializer_class = ParticipationSerializer
    lookup_url_kwarg = 'uid'    # use in checking student participation and in manage own participation
    lookup_url_kwarg2 = 'cid'   # use in checking student participation
    def get(self, request, format=None):
        uid = request.GET.get(self.lookup_url_kwarg)
        cid = request.GET.get(self.lookup_url_kwarg2)
        # checking student participation
        if uid != None and cid != None:
            participationQueryset = Participation.objects.filter(uid=uid, cid=cid)
            # if participation exist then send confirmation
            if participationQueryset.exists():
                return response.Response(status=status.HTTP_200_OK)
            # if participation does not exist then send confirmation
            elif not participationQueryset.exists():
                return response.Response(status=status.HTTP_404_NOT_FOUND)
        # manage own participation
        if uid != None and cid == None:
            participationQueryset = Participation.objects.filter(uid=uid).values('uid', 'cid', 'joindate', 'cid__title', 'cid__tags', 'cid__passing', 'cid__creator', 'cid__challenges', 'cid__status')
            scoreList = []
            completionList = []
            # if participation exist then send participation and course data
            if participationQueryset.exists():
                for each in participationQueryset:
                    # if course is active then check submission
                    if each['cid__status'] == 'active':
                        scoreSum = 0
                        completionCount = 0
                        cid = each['cid']
                        passing = each['cid__passing']
                        challenges = each['cid__challenges']
                        for each2 in challenges:
                            SubmissionQueryset = Submission.objects.filter(uid=uid, cid=cid, did=each2).order_by('-score')
                            # if the submission exist then get score
                            if SubmissionQueryset.exists():
                                scoreField = Submission._meta.get_field('score')
                                score = scoreField.value_from_object(SubmissionQueryset.first())
                                scoreSum += score
                                # if high score is higher than passing score then record completion
                                if score>=passing:
                                    completionCount += 1
                        scoreList.append(round(scoreSum/len(challenges)))
                        completionList.append(str((round(completionCount/len(challenges)*100, 2)))+'%')
                    # if course is deactivated then record deactivated
                    elif each['cid__status'] == 'deactivated':
                        scoreList.append('deactivated')
                        completionList.append('deactivated')
                return response.Response({'participationData': participationQueryset, 'scoreList': scoreList, 'completionList': completionList}, status=status.HTTP_200_OK)
            # if participation does not exist then reject
            elif not participationQueryset.exists():
                return response.Response(status=status.HTTP_404_NOT_FOUND)
        return response.Response(status=status.HTTP_400_BAD_REQUEST)

class SaveParticipationView(views.APIView):
    serializer_class = SaveParticipationSerializer
    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            uid = User.objects.get(uid=serializer.data.get('uid'))
            cid = Course.objects.get(cid=serializer.data.get('cid'))
            participation = Participation(uid=uid, cid=cid)
            participation.save()
            return response.Response(status=status.HTTP_201_CREATED)
        return response.Response(status=status.HTTP_400_BAD_REQUEST)

class DeleteParticipationView(views.APIView):
    serializer_class = ParticipationSerializer
    lookup_url_kwarg = 'cid'
    lookup_url_kwarg2 = 'uid'
    def get(self, request, format=None):
        cid = request.GET.getlist(self.lookup_url_kwarg)
        uid = request.GET.get(self.lookup_url_kwarg2)
        if len(cid) != 0 and uid != None:
            failList = []
            for ind in range(len(cid)):
                if cid[ind] != None:
                    participationQueryset = Participation.objects.filter(cid=cid[ind], uid=uid)
                    # if participation exist then delete the participation
                    if participationQueryset.exists():
                        # find related submission with the course
                        submissionQueryset = Submission.objects.filter(uid=uid, cid=cid[ind])
                        # delete the submission and participation
                        submissionQueryset.delete()
                        participationQueryset.delete()
                    # if participation does not exist then record
                    elif not participationQueryset.exists():
                        failList.append(cid[ind])
            # retrieve remaining participation
            participationQueryset2 = Participation.objects.filter(uid=uid).values('uid', 'cid', 'joindate', 'cid__title', 'cid__tags', 'cid__passing', 'cid__creator', 'cid__challenges', 'cid__status')
            scoreList = []
            completionList = []
            for each in participationQueryset2:
                # if course is active then check submission
                if each['cid__status'] == 'active':
                    scoreSum = 0
                    completionCount = 0
                    cid = each['cid']
                    passing = each['cid__passing']
                    challenges = each['cid__challenges']
                    for each2 in challenges:
                        SubmissionQueryset = Submission.objects.filter(uid=uid, cid=cid, did=each2).order_by('-score')
                        # if the submission exist then get score
                        if SubmissionQueryset.exists():
                            scoreField = Submission._meta.get_field('score')
                            score = scoreField.value_from_object(SubmissionQueryset.first())
                            scoreSum += score
                            # if high score is higher than passing score then record completion
                            if score>=passing:
                                completionCount += 1
                    scoreList.append(round(scoreSum/len(challenges)))
                    completionList.append(str((round(completionCount/len(challenges)*100, 2)))+'%')
                # if course is deactivated then record deactivated
                elif each['cid__status'] == 'deactivated':
                    scoreList.append('deactivated')
                    completionList.append('deactivated') 
            return response.Response({'failList': failList, 'participationData': participationQueryset2, 'scoreList': scoreList, 'completionList': completionList}, status=status.HTTP_202_ACCEPTED)
            # return response.Response({'failList': failList, 'participationData': participationQueryset2}, status=status.HTTP_202_ACCEPTED)
        return response.Response(status=status.HTTP_400_BAD_REQUEST)


# Submission
class SubmissionView(generics.ListAPIView):
    serializer_class = SubmissionSerializer
    queryset = Submission.objects.all()

class GetSubmissionView(views.APIView):
    serializer_class = SubmissionSerializer
    lookup_url_kwarg = 'uid'
    lookup_url_kwarg2 = 'cid'
    lookup_url_kwarg3 = 'did'
    def get(self, request, format=None):
        uid = request.GET.get(self.lookup_url_kwarg)
        cid = request.GET.get(self.lookup_url_kwarg2)
        did = request.GET.get(self.lookup_url_kwarg3)
        if uid != None and cid != None and did != None:
            submissionQueryset = Submission.objects.filter(uid=uid, cid=cid, did=did)
            # if submission exist then send submission data
            if submissionQueryset.exists():
                return response.Response(SubmissionSerializer(submissionQueryset, many=True).data, status=status.HTTP_200_OK)
            # if submission does not exist then reject
            elif not submissionQueryset.exists():
                return response.Response(status=status.HTTP_404_NOT_FOUND)
        return response.Response(status=status.HTTP_400_BAD_REQUEST)

class SaveSubmissionView(views.APIView):
    serializer_class = SaveSubmissionSerializer
    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            uid = User.objects.get(uid=serializer.data.get('uid'))
            cid = Course.objects.get(cid=serializer.data.get('cid'))
            did = Design.objects.get(did=serializer.data.get('did'))
            workspace = serializer.data.get('workspace')
            translation, transformation = nlpmain(workspace, "both")
            # get design's solution
            designQueryset = Design.objects.filter(did=serializer.data.get('did'))
            transformationField = Design._meta.get_field('transformation')
            teacherTransformation = transformationField.value_from_object(designQueryset.first())
            # evaluate student's submission with teacher's solution
            score, feedback = evaluation(transformation, teacherTransformation)
            submission = Submission(uid=uid, cid=cid, did=did, workspace=workspace, translation=translation, transformation=transformation, score=score, feedback=feedback)
            submission.save()
            # send all related submission for user to refer
            submissionQueryset = Submission.objects.filter(uid=uid, cid=cid, did=did)
            return response.Response(SubmissionSerializer(submissionQueryset, many=True).data, status=status.HTTP_201_CREATED)
        return response.Response(status=status.HTTP_400_BAD_REQUEST)

class GetLatestSubmissionView(views.APIView):
    serializer_class = SubmissionSerializer
    lookup_url_kwarg = 'uid'
    lookup_url_kwarg2 = 'cid'
    def get(self, request, format=None):
        uid = request.GET.get(self.lookup_url_kwarg)
        cid = request.GET.get(self.lookup_url_kwarg2)
        if uid != None and cid != None:
            submissionQueryset = Submission.objects.filter(uid=uid, cid=cid).order_by("-submissiondate")
            # if submission exist then find latest by submissiondate
            if submissionQueryset.exists():
                didField = Submission._meta.get_field('did')
                did = didField.value_from_object(submissionQueryset.first())
                return response.Response(did, status=status.HTTP_200_OK)
            # if submission does not exist then reject
            elif not submissionQueryset.exists():
                return response.Response(status=status.HTTP_404_NOT_FOUND)
        return response.Response(status=status.HTTP_400_BAD_REQUEST)

class GetHighScoreView(views.APIView):
    serializer_class = SubmissionSerializer
    lookup_url_kwarg = 'uid'
    lookup_url_kwarg2 = 'cid'
    def get(self, request, format=None):
        uid = request.GET.get(self.lookup_url_kwarg)
        cid = request.GET.get(self.lookup_url_kwarg2)
        scoreList = []
        submissiondateList = []
        if uid != None and cid != None:
            # find related design with course
            courseQueryset = Course.objects.filter(cid=cid)
            challengesField = Course._meta.get_field('challenges')
            challenges = challengesField.value_from_object(courseQueryset.first())
            # find each challenges' high score
            for each in challenges:
                submissionQueryset = Submission.objects.filter(uid=uid, cid=cid, did=each).order_by("-score")
                # if submission exist then save the score and submissiondate
                if submissionQueryset.exists():
                    scoreField = Submission._meta.get_field('score')
                    score = scoreField.value_from_object(submissionQueryset.first())
                    scoreList.append(score)
                    submissiondateField = Submission._meta.get_field('submissiondate')
                    submissiondate = submissiondateField.value_from_object(submissionQueryset.first())
                    submissiondateList.append(submissiondate)
                # if submission does not exist then save the score as 0
                elif not submissionQueryset.exists():
                    scoreList.append("-")
                    submissiondateList.append("")
            return response.Response({'scoreList': scoreList, 'submissiondateList': submissiondateList}, status=status.HTTP_200_OK)
        return response.Response(status=status.HTTP_400_BAD_REQUEST)

class RequestNextChallengeView(views.APIView):
    serializer_class = SubmissionSerializer
    lookup_url_kwarg = 'uid'
    lookup_url_kwarg2 = 'cid'
    lookup_url_kwarg3 = 'did'
    def get(self, request, format=None):
        uid = request.GET.get(self.lookup_url_kwarg)
        cid = request.GET.get(self.lookup_url_kwarg2)
        did = request.GET.get(self.lookup_url_kwarg3)
        if uid != None and cid != None and did != None:
            # find next challenge with course
            courseQueryset = Course.objects.filter(cid=cid)
            challengesField = Course._meta.get_field('challenges')
            challenges = challengesField.value_from_object(courseQueryset.first())
            cur = challenges.index(int(did))
            # if there is no next challenge then disallow proceed
            if cur == len(challenges)-1:
                return response.Response(status=status.HTTP_404_NOT_FOUND)
            # if there is next challenge then get course passing score and submission high score 
            elif cur != len(challenges)-1:
                next = challenges[cur+1]
                # retrieve passing score from course
                passingField = Course._meta.get_field('passing')
                passing = passingField.value_from_object(courseQueryset.first())
                # retrieve submission high score from submission
                submissionQueryset = Submission.objects.filter(uid=uid, cid=cid, did=did).order_by("-score")
                # if submission exists then get high score
                if submissionQueryset.exists():
                    scoreField = Submission._meta.get_field('score')
                    highscore = scoreField.value_from_object(submissionQueryset.first())
                    # if submissions' high score is higher than passing score then allow proceed
                    if highscore >= passing:
                        return response.Response(next, status=status.HTTP_200_OK)
                    # if submissions' high score is lower than passing score then disallow proceed
                    elif highscore < passing:
                        return response.Response(passing, status=status.HTTP_401_UNAUTHORIZED)
                # if submission does not exist then disallow proceed
                elif not submissionQueryset.exists():
                    return response.Response(passing, status=status.HTTP_401_UNAUTHORIZED)
        return response.Response(status=status.HTTP_400_BAD_REQUEST)

