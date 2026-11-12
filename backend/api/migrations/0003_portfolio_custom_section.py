
from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_portfolio_alter_project_options_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='portfolio',
            name='custom_section',
            field=models.JSONField(default=dict),
        ),
    ]
