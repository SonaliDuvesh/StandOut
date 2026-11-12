
from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_portfolio_custom_section'),
    ]

    operations = [
        migrations.AddField(
            model_name='portfolio',
            name='about_highlights',
            field=models.JSONField(default=list),
        ),
        migrations.AddField(
            model_name='portfolio',
            name='home_typography',
            field=models.JSONField(default=dict),
        ),
        migrations.AddField(
            model_name='portfolio',
            name='quote',
            field=models.TextField(blank=True, default='"I build things, break things, and trace things."'),
        ),
    ]
