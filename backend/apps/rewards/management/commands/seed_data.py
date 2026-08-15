from django.core.management.base import BaseCommand
from apps.rewards.models import RewardRule, Task, Benefit


class Command(BaseCommand):
    help = 'Seed reward rules, tasks, and benefits'

    def handle(self, *args, **options):
        # Reward Rules
        rules = [
            ('GROUP_CREATED', 100, 'Points awarded when a group is created'),
            ('INVITE_CREATED', 25, 'Points awarded when an invitation is generated'),
            ('PARTICIPANT_JOINED', 100, 'Points awarded when a new member joins'),
            ('PROFILE_COMPLETED', 50, 'Points awarded when a member completes their profile'),
            ('TASK_COMPLETED', 150, 'Points awarded when a sample task is completed'),
        ]
        for action_type, points, description in rules:
            rule, created = RewardRule.objects.get_or_create(
                action_type=action_type,
                defaults={'points': points, 'description': description, 'is_active': True}
            )
            if not created:
                rule.points = points
                rule.is_active = True
                rule.save()
            self.stdout.write(f'  {"Created" if created else "Updated"} rule: {action_type} ({points} pts)')

        # Sample Tasks
        tasks = [
            ('Share with a Friend', 'Share your group link with a friend outside the group.', 150),
            ('Write a Group Goal', 'Set a shared goal for your group this month.', 150),
            ('Upload a Group Photo', 'Upload a photo that represents your group.', 150),
            ('Complete your Profile', 'Fill out your name and contact information fully.', 150),
            ('React to an Activity', 'Engage with a recent group activity in the feed.', 150),
        ]
        for name, description, points in tasks:
            task, created = Task.objects.get_or_create(
                name=name,
                defaults={'description': description, 'points': points, 'is_active': True}
            )
            self.stdout.write(f'  {"Created" if created else "Exists"} task: {name}')

        # Benefits
        benefits = [
            ('Starter Benefit', 'Unlock exclusive starter perks for your group.', 200, 1),
            ('Team Benefit', 'Get access to team-level rewards and recognition.', 500, 2),
            ('Premium Benefit', 'Unlock our top-tier premium rewards package.', 1000, 3),
        ]
        for name, description, required_points, display_order in benefits:
            benefit, created = Benefit.objects.get_or_create(
                name=name,
                defaults={
                    'description': description,
                    'required_points': required_points,
                    'display_order': display_order,
                    'status': 'active',
                }
            )
            self.stdout.write(f'  {"Created" if created else "Exists"} benefit: {name} ({required_points} pts)')

        self.stdout.write(self.style.SUCCESS('Seed data complete.'))
