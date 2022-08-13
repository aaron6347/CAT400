from django.db import models

def generateDid():
    try:
        obj = Design.objects.all().order_by("-did").first()
        field = Design._meta.get_field("did")
        did = field.value_from_object(obj)
    except:
        did = "100000"
    finally:
        did = str(int(did)+1)
    return did

def generateUid():
    try:
        obj = User.objects.all().order_by("-uid").first()
        field = User._meta.get_field("uid")
        uid = field.value_from_object(obj)
    except:
        uid = "500000"
    finally:
        uid = str(int(uid)+1)
    return uid

def generateCid():
    try:
        obj = Course.objects.all().order_by("-cid").first()
        field = Course._meta.get_field("cid")
        cid = field.value_from_object(obj)
    except:
        cid = "800000"
    finally:
        cid = str(int(cid)+1)
    return cid

def generateSid():
    try:
        obj = Submission.objects.all().order_by("-sid").first()
        field = Submission._meta.get_field("sid")
        sid = field.value_from_object(obj)
    except:
        sid = "900000"
    finally:
        sid = str(int(sid)+1)
    return sid

class User(models.Model):
    uid = models.IntegerField(default=generateUid, primary_key=True)
    username = models.CharField(max_length=20, null=False, blank=False)
    password = models.CharField(max_length=20, null=False, blank=False)
    email = models.CharField(max_length=40, null=False, blank=False)
    role = models.CharField(max_length=7, null=False, blank=False)
    gender = models.CharField(max_length=6, null=False, blank=False)
    creationdate = models.DateTimeField(auto_now_add=True)

class Design(models.Model):
    did = models.IntegerField(default=generateDid, primary_key=True)
    uid = models.ForeignKey(User, on_delete=models.CASCADE)
    workspace = models.TextField(null=False, blank=False)
    transformation = models.TextField(null=False, blank=False)
    title = models.CharField(max_length=30, null=False, blank=False)
    difficulty = models.CharField(max_length=6, null=False, blank=False)
    creator = models.CharField(max_length=20, null=False, blank=False)
    desc = models.TextField(max_length=1000, null=False, blank=False)
    hint = models.TextField(max_length=1000, default="", blank=True)
    creationdate = models.DateTimeField(auto_now_add=True)

class Course(models.Model):
    cid = models.IntegerField(default=generateCid, primary_key=True)
    uid = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=30, null=False, blank=False)
    tags = models.JSONField(null=False, blank=False)
    passing = models.IntegerField(null=False, blank=False)
    creator = models.CharField(max_length=20, null=False, blank=False)
    desc = models.TextField(max_length=1000, null=False, blank=False)
    challenges = models.JSONField(null=False, blank=False)
    creationdate = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=8, default="active", null=False, blank=False)

class Participation(models.Model):
    uid = models.ForeignKey(User, on_delete=models.CASCADE)
    cid = models.ForeignKey(Course, on_delete=models.CASCADE)
    joindate = models.DateTimeField(auto_now_add=True)

class Submission(models.Model):
    sid = models.IntegerField(default=generateSid, primary_key=True)
    uid = models.ForeignKey(User, on_delete=models.CASCADE)
    cid = models.ForeignKey(Course, on_delete=models.CASCADE)
    did = models.ForeignKey(Design, on_delete=models.CASCADE)
    workspace = models.TextField(null=False, blank=False)
    translation = models.TextField(null=False, blank=False)
    transformation = models.TextField(null=False, blank=False)
    score = models.DecimalField(max_digits=5, decimal_places=2, null=False, blank=False)
    feedback = models.TextField(null=False, blank=False)
    submissiondate = models.DateTimeField(auto_now_add=True)
