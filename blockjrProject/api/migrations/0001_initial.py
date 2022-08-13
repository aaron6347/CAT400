# Generated by Django 4.0.1 on 2022-07-11 10:02

import api.models
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Course',
            fields=[
                ('cid', models.IntegerField(default=api.models.generateCid, primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=30)),
                ('tags', models.JSONField()),
                ('passing', models.IntegerField()),
                ('creator', models.CharField(max_length=20)),
                ('desc', models.TextField(max_length=1000)),
                ('challenges', models.JSONField()),
                ('creationdate', models.DateTimeField(auto_now_add=True)),
                ('status', models.CharField(default='active', max_length=8)),
            ],
        ),
        migrations.CreateModel(
            name='Design',
            fields=[
                ('did', models.IntegerField(default=api.models.generateDid, primary_key=True, serialize=False)),
                ('workspace', models.TextField()),
                ('transformation', models.TextField()),
                ('title', models.CharField(max_length=30)),
                ('difficulty', models.CharField(max_length=6)),
                ('creator', models.CharField(max_length=20)),
                ('desc', models.TextField(max_length=1000)),
                ('hint', models.TextField(blank=True, default='', max_length=1000)),
                ('creationdate', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='User',
            fields=[
                ('uid', models.IntegerField(default=api.models.generateUid, primary_key=True, serialize=False)),
                ('username', models.CharField(max_length=20)),
                ('password', models.CharField(max_length=20)),
                ('email', models.CharField(max_length=40)),
                ('role', models.CharField(max_length=7)),
                ('gender', models.CharField(max_length=6)),
                ('creationdate', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='Submission',
            fields=[
                ('sid', models.IntegerField(default=api.models.generateSid, primary_key=True, serialize=False)),
                ('workspace', models.TextField()),
                ('translation', models.TextField()),
                ('transformation', models.TextField()),
                ('score', models.DecimalField(decimal_places=2, max_digits=5)),
                ('feedback', models.TextField()),
                ('submissiondate', models.DateTimeField(auto_now_add=True)),
                ('cid', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.course')),
                ('did', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.design')),
                ('uid', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.user')),
            ],
        ),
        migrations.CreateModel(
            name='Participation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('joindate', models.DateTimeField(auto_now_add=True)),
                ('cid', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.course')),
                ('uid', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.user')),
            ],
        ),
        migrations.AddField(
            model_name='design',
            name='uid',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.user'),
        ),
        migrations.AddField(
            model_name='course',
            name='uid',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.user'),
        ),
    ]