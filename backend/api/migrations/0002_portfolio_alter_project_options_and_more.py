
import django.db.models.deletion
from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Portfolio',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('username', models.SlugField(max_length=100, unique=True)),
                ('full_name', models.CharField(default='Alex Morgan', max_length=150)),
                ('display_name', models.CharField(default='Alex Morgan', max_length=150)),
                ('greeting', models.CharField(default="Hi there! I'm", max_length=100)),
                ('titles', models.JSONField(default=list)),
                ('short_bio', models.TextField(blank=True)),
                ('detailed_bio', models.TextField(blank=True)),
                ('profile_image', models.TextField(blank=True)),
                ('background_image', models.TextField(blank=True)),
                ('background_settings', models.JSONField(default=dict)),
                ('appearance', models.JSONField(default=dict)),
                ('sections_visibility', models.JSONField(default=dict)),
                ('education', models.JSONField(default=list)),
                ('skills_categories', models.JSONField(default=list)),
                ('certifications', models.JSONField(default=list)),
                ('social_links', models.JSONField(default=dict)),
                ('is_published', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['username'],
            },
        ),
        migrations.AlterModelOptions(
            name='project',
            options={'ordering': ['-featured', 'order', '-created_at']},
        ),
        migrations.AddField(
            model_name='contactmessage',
            name='recipient_email',
            field=models.EmailField(blank=True, max_length=254),
        ),
        migrations.AddField(
            model_name='project',
            name='forks',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='project',
            name='is_live',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='project',
            name='source',
            field=models.CharField(default='manual', max_length=50),
        ),
        migrations.AddField(
            model_name='project',
            name='stars',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='blogpost',
            name='featured_image_url',
            field=models.TextField(blank=True),
        ),
        migrations.AlterField(
            model_name='blogpost',
            name='tags',
            field=models.JSONField(default=list),
        ),
        migrations.AlterField(
            model_name='project',
            name='github_url',
            field=models.TextField(blank=True),
        ),
        migrations.AlterField(
            model_name='project',
            name='image_url',
            field=models.TextField(blank=True),
        ),
        migrations.AlterField(
            model_name='project',
            name='project_url',
            field=models.TextField(blank=True),
        ),
        migrations.AlterField(
            model_name='project',
            name='technologies',
            field=models.JSONField(default=list),
        ),
        migrations.AddField(
            model_name='contactmessage',
            name='portfolio',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='messages', to='api.portfolio'),
        ),
        migrations.AddField(
            model_name='project',
            name='portfolio',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='projects', to='api.portfolio'),
        ),
    ]
