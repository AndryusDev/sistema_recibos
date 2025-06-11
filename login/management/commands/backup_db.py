from django.core.management.base import BaseCommand
from django.conf import settings
import os
import datetime
import subprocess

class Command(BaseCommand):
    help = 'Backs up the database'

    def handle(self, *args, **kwargs):
        now = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        backup_file = os.path.join(settings.BASE_DIR, f'backup_{now}.dump')
        
        # Database settings
        db_name = settings.DATABASES['default']['NAME']
        db_user = settings.DATABASES['default']['USER']
        db_host = settings.DATABASES['default']['HOST']
        db_port = settings.DATABASES['default']['PORT']
        db_password = settings.DATABASES['default']['PASSWORD']

        # Construct the pg_dump command
        command = [
            'pg_dump',
            '-h', db_host,
            '-p', db_port,
            '-U', db_user,
            '-d', db_name,
            '-f', backup_file
        ]

        # Set the password environment variable
        env = os.environ.copy()
        env['PGPASSWORD'] = db_password

        try:
            self.stdout.write(self.style.SUCCESS(f'Backing up database to {backup_file}'))
            subprocess.run(command, check=True, env=env)
            self.stdout.write(self.style.SUCCESS('Database backup completed successfully.'))
        except subprocess.CalledProcessError as e:
            self.stderr.write(self.style.ERROR(f'Error backing up database: {e}'))
