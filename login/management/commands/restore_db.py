from django.core.management.base import BaseCommand
from django.conf import settings
import os
import subprocess

class Command(BaseCommand):
    help = 'Restores the database from a backup file'

    def add_arguments(self, parser):
        parser.add_argument('backup_file', type=str, help='The path to the backup file')

    def handle(self, *args, **kwargs):
        backup_file = kwargs['backup_file']

        # Database settings
        db_name = settings.DATABASES['default']['NAME']
        db_user = settings.DATABASES['default']['USER']
        db_host = settings.DATABASES['default']['HOST']
        db_port = settings.DATABASES['default']['PORT']
        db_password = settings.DATABASES['default']['PASSWORD']

        # Construct the pg_restore command
        command = [
            'pg_restore',
            '-h', db_host,
            '-p', db_port,
            '-U', db_user,
            '-d', db_name,
            backup_file
        ]

        # Set the password environment variable
        env = os.environ.copy()
        env['PGPASSWORD'] = db_password

        try:
            self.stdout.write(self.style.SUCCESS(f'Restoring database from {backup_file}'))
            subprocess.run(command, check=True, env=env)
            self.stdout.write(self.style.SUCCESS('Database restore completed successfully.'))
        except subprocess.CalledProcessError as e:
            self.stderr.write(self.style.ERROR(f'Error restoring database: {e}'))
