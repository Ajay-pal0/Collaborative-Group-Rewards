import threading
from django import db
from django.test import TestCase, TransactionTestCase
from rest_framework.test import APIClient
from apps.users.models import User
from apps.groups.models import GroupMember
from apps.rewards.models import RewardRule, PointTransaction, Benefit, BenefitClaim, Task
from apps.groups.services import create_group, join_group
from apps.rewards.services import award_points, claim_benefit, complete_task
from django.utils import timezone


def make_user(email='test@example.com', name='Test User', password='pass1234'):
    return User.objects.create_user(email=email, name=name, password=password)


def seed_rules():
    RewardRule.objects.get_or_create(action_type='GROUP_CREATED', defaults={'points': 100, 'is_active': True})
    RewardRule.objects.get_or_create(action_type='INVITE_CREATED', defaults={'points': 25, 'is_active': True})
    RewardRule.objects.get_or_create(action_type='PARTICIPANT_JOINED', defaults={'points': 100, 'is_active': True})
    RewardRule.objects.get_or_create(action_type='TASK_COMPLETED', defaults={'points': 150, 'is_active': True})


class GroupCreationTest(TestCase):
    def setUp(self):
        seed_rules()
        self.user = make_user()

    def test_create_group_adds_owner_as_member(self):
        group = create_group(self.user, 'Test Group', 'friends')
        self.assertEqual(GroupMember.objects.filter(group=group, user=self.user, role='owner').count(), 1)

    def test_create_group_awards_points(self):
        group = create_group(self.user, 'Test Group', 'friends')
        self.assertEqual(group.total_points, 100)

    def test_create_group_idempotent_points(self):
        group = create_group(self.user, 'Test Group', 'friends')
        # Re-awarding should not add more points
        membership = GroupMember.objects.get(group=group, user=self.user)
        award_points(group, membership, 'GROUP_CREATED', str(group.id))
        self.assertEqual(group.total_points, 100)  # Still 100


class InvitationTest(TestCase):
    def setUp(self):
        seed_rules()
        self.user = make_user()
        self.group = create_group(self.user, 'Invite Group', 'colleagues')

    def test_invite_token_is_unique(self):
        from apps.groups.services import get_or_create_invitation
        invite1, _ = get_or_create_invitation(self.group, self.user)
        invite2, _ = get_or_create_invitation(self.group, self.user)
        self.assertEqual(invite1.id, invite2.id)  # Returns same invite

    def test_invite_token_not_predictable(self):
        from apps.groups.services import get_or_create_invitation
        invite, _ = get_or_create_invitation(self.group, self.user)
        self.assertGreater(len(invite.token), 20)

    def test_invite_created_points(self):
        from apps.groups.services import get_or_create_invitation
        pts_before = self.group.total_points
        get_or_create_invitation(self.group, self.user)
        self.assertGreater(self.group.total_points, pts_before)


class JoinGroupTest(TestCase):
    def setUp(self):
        seed_rules()
        self.owner = make_user('owner@example.com', 'Owner')
        self.member = make_user('member@example.com', 'Member')
        self.group = create_group(self.owner, 'Join Group', 'family')
        from apps.groups.services import get_or_create_invitation
        self.invite, _ = get_or_create_invitation(self.group, self.owner)

    def test_join_creates_membership(self):
        join_group(self.invite.token, self.member)
        self.assertTrue(GroupMember.objects.filter(group=self.group, user=self.member).exists())

    def test_join_awards_points(self):
        pts_before = self.group.total_points
        join_group(self.invite.token, self.member)
        self.assertGreater(self.group.total_points, pts_before)

    def test_duplicate_join_no_extra_membership(self):
        join_group(self.invite.token, self.member)
        join_group(self.invite.token, self.member)
        self.assertEqual(GroupMember.objects.filter(group=self.group, user=self.member).count(), 1)

    def test_duplicate_join_no_extra_points(self):
        join_group(self.invite.token, self.member)
        pts_after_first = self.group.total_points
        join_group(self.invite.token, self.member)
        self.assertEqual(self.group.total_points, pts_after_first)

    def test_invalid_token_raises(self):
        with self.assertRaises(ValueError):
            join_group('invalid-token-xyz', self.member)

    def test_expired_invite_raises(self):
        self.invite.expires_at = timezone.now() - timezone.timedelta(hours=1)
        self.invite.save()
        with self.assertRaises(ValueError):
            join_group(self.invite.token, self.member)


class BenefitTest(TestCase):
    def setUp(self):
        seed_rules()
        self.user = make_user()
        self.group = create_group(self.user, 'Benefit Group', 'friends')
        self.benefit_200 = Benefit.objects.create(name='Starter', required_points=200, status='active')
        self.benefit_1000 = Benefit.objects.create(name='Premium', required_points=1000, status='active')

    def _add_points(self, amount):
        membership = GroupMember.objects.get(group=self.group, user=self.user)
        import uuid
        from apps.rewards.services import _increment_group_cached_points
        PointTransaction.objects.create(
            group=self.group,
            member=membership,
            action_type='TASK_COMPLETED',
            reference_id=str(uuid.uuid4()),
            points=amount,
            idempotency_key=f'test:{uuid.uuid4()}',
        )
        _increment_group_cached_points(self.group, amount)
        self.group.refresh_from_db()

    def test_benefit_locked_below_threshold(self):
        # Group has 100pts from creation — below 200 threshold
        from apps.rewards.services import get_benefit_states
        states = {s['benefit'].id: s['state'] for s in get_benefit_states(self.group)}
        self.assertEqual(states[self.benefit_200.id], 'locked')

    def test_benefit_available_at_threshold(self):
        self._add_points(100)  # Now 200 total
        from apps.rewards.services import get_benefit_states
        states = {s['benefit'].id: s['state'] for s in get_benefit_states(self.group)}
        self.assertEqual(states[self.benefit_200.id], 'available')

    def test_claim_benefit(self):
        self._add_points(100)
        claim_benefit(self.group, self.benefit_200, self.user)
        from apps.rewards.services import get_benefit_states
        states = {s['benefit'].id: s['state'] for s in get_benefit_states(self.group, user=self.user)}
        self.assertEqual(states[self.benefit_200.id], 'claimed')

    def test_per_user_benefit_claiming(self):
        user2 = make_user('user2@example.com', 'User 2')
        from apps.groups.services import get_or_create_invitation, join_group
        invite, _ = get_or_create_invitation(self.group, self.user)
        join_group(invite.token, user2)

        self._add_points(100)  # Total 200 pts

        from apps.rewards.services import get_benefit_states
        # User 1 claims benefit
        claim_benefit(self.group, self.benefit_200, self.user)

        # User 1 state is 'claimed'
        states1 = {s['benefit'].id: s['state'] for s in get_benefit_states(self.group, user=self.user)}
        self.assertEqual(states1[self.benefit_200.id], 'claimed')

        # User 2 state is still 'available'
        states2 = {s['benefit'].id: s['state'] for s in get_benefit_states(self.group, user=user2)}
        self.assertEqual(states2[self.benefit_200.id], 'available')

        # User 2 claims benefit as well
        claim_benefit(self.group, self.benefit_200, user2)
        states2_after = {s['benefit'].id: s['state'] for s in get_benefit_states(self.group, user=user2)}
        self.assertEqual(states2_after[self.benefit_200.id], 'claimed')

        # Total claim records for benefit is 2
        self.assertEqual(BenefitClaim.objects.filter(group=self.group, benefit=self.benefit_200).count(), 2)

    def test_claim_below_threshold_raises(self):
        with self.assertRaises(ValueError):
            claim_benefit(self.group, self.benefit_1000, self.user)

    def test_duplicate_claim_does_not_create_duplicate(self):
        self._add_points(100)
        claim_benefit(self.group, self.benefit_200, self.user)
        claim_benefit(self.group, self.benefit_200, self.user)
        self.assertEqual(BenefitClaim.objects.filter(group=self.group, benefit=self.benefit_200, claimed_by=self.user).count(), 1)


class TaskCompletionTest(TestCase):
    def setUp(self):
        seed_rules()
        self.user = make_user()
        self.group = create_group(self.user, 'Task Group', 'other')
        self.task = Task.objects.create(name='Test Task', points=150, is_active=True)

    def test_task_awards_points(self):
        membership = GroupMember.objects.get(group=self.group, user=self.user)
        pts_before = self.group.total_points
        complete_task(self.group, membership, self.task)
        self.assertEqual(self.group.total_points, pts_before + 150)

    def test_duplicate_task_raises(self):
        membership = GroupMember.objects.get(group=self.group, user=self.user)
        complete_task(self.group, membership, self.task)
        with self.assertRaises(ValueError):
            complete_task(self.group, membership, self.task)

    def test_collaborative_reward_model_multiple_members(self):
        """
        Tests the primary Collaborative Reward Model rule:
        - Task completion is per-member (Ajay and Sanjay each complete Task 1)
        - Reward accumulation is group-level (Group total points increases by +300 pts)
        - Benefit threshold is unlocked for the group
        """
        ajay = make_user('ajay_collab@example.com', 'Ajay')
        sanjay = make_user('sanjay_collab@example.com', 'Sanjay')

        group = create_group(ajay, 'Collaborative Group', 'team')
        from apps.groups.services import get_or_create_invitation, join_group
        invite, _ = get_or_create_invitation(group, ajay)
        join_group(invite.token, sanjay)

        task1 = Task.objects.create(name='Task 1', points=150, is_active=True)
        benefit_300 = Benefit.objects.create(name='Team Lunch', required_points=300, status='active')

        ajay_mem = GroupMember.objects.get(group=group, user=ajay)
        sanjay_mem = GroupMember.objects.get(group=group, user=sanjay)

        pts_start = group.total_points

        # 1. Ajay completes Task 1 (+150 pts)
        tx1 = complete_task(group, ajay_mem, task1)
        self.assertEqual(tx1.points, 150)
        group.refresh_from_db()
        self.assertEqual(group.total_points, pts_start + 150)

        # Ajay attempting Task 1 again is blocked
        with self.assertRaises(ValueError):
            complete_task(group, ajay_mem, task1)

        # 2. Sanjay completes Task 1 (+150 pts)
        tx2 = complete_task(group, sanjay_mem, task1)
        self.assertEqual(tx2.points, 150)
        group.refresh_from_db()
        self.assertEqual(group.total_points, pts_start + 300)

        # Sanjay attempting Task 1 again is blocked
        with self.assertRaises(ValueError):
            complete_task(group, sanjay_mem, task1)

        # 3. Verify Benefit Threshold (300+ pts) is unlocked / available to the group
        from apps.rewards.services import get_benefit_states
        states = {s['benefit'].id: s['state'] for s in get_benefit_states(group)}
        self.assertEqual(states[benefit_300.id], 'available')

    def test_user_specified_points_api(self):
        ajay = make_user('ajay_pts@example.com', 'Ajay Points')
        sanjay = make_user('sanjay_pts@example.com', 'Sanjay Points')
        group = create_group(ajay, 'Points API Test Group', 'team')
        from apps.groups.services import get_or_create_invitation, join_group
        invite, _ = get_or_create_invitation(group, ajay)
        join_group(invite.token, sanjay)

        task = Task.objects.create(name='Test Task', points=150)
        ajay_mem = GroupMember.objects.get(group=group, user=ajay)
        sanjay_mem = GroupMember.objects.get(group=group, user=sanjay)

        complete_task(group, ajay_mem, task)
        complete_task(group, sanjay_mem, task)

        client = APIClient()
        client.force_authenticate(user=ajay)

        response = client.get(f'/api/groups/{group.id}/user-points/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['user_points'], 275) # 100 group created + 25 invite created + 150 task = 275
        self.assertEqual(response.data['group_total_points'], 525) # 275 ajay + 250 sanjay (100 join + 150 task) = 525
        self.assertEqual(len(response.data['member_points']), 2)


class APIAuthTest(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_and_login(self):
        resp = self.client.post('/api/auth/register/', {
            'email': 'new@example.com', 'name': 'New User', 'password': 'pass1234'
        })
        self.assertEqual(resp.status_code, 201)
        self.assertIn('tokens', resp.data)

        resp = self.client.post('/api/auth/login/', {
            'email': 'new@example.com', 'password': 'pass1234'
        })
        self.assertEqual(resp.status_code, 200)
        self.assertIn('access', resp.data['tokens'])

    def test_protected_endpoint_requires_auth(self):
        resp = self.client.get('/api/groups/')
        self.assertEqual(resp.status_code, 401)

    def test_non_member_access_forbidden(self):
        owner = make_user()
        group = create_group(owner, 'Secret Group', 'other')
        other = make_user('other@example.com')

        self.client.force_authenticate(user=other)
        resp = self.client.get(f'/api/groups/{group.id}/')
        self.assertEqual(resp.status_code, 403)


class ProfileCompletionTest(TestCase):
    def setUp(self):
        seed_rules()
        self.user = make_user()
        self.group = create_group(self.user, 'Profile Group', 'other')

    def test_profile_completion_awards_50_points(self):
        membership = GroupMember.objects.get(group=self.group, user=self.user)
        pts_before = self.group.total_points
        from apps.rewards.services import complete_profile
        tx = complete_profile(self.group, membership)
        self.assertEqual(tx.points, 50)
        self.assertEqual(self.group.total_points, pts_before + 50)

    def test_duplicate_profile_completion_raises(self):
        membership = GroupMember.objects.get(group=self.group, user=self.user)
        from apps.rewards.services import complete_profile
        complete_profile(self.group, membership)
        with self.assertRaises(ValueError):
            complete_profile(self.group, membership)

    def test_profile_complete_api_endpoint(self):
        client = APIClient()
        client.force_authenticate(user=self.user)
        resp = client.post(f'/api/groups/{self.group.id}/profile/complete/', {
            'phone': '+1234567890'
        })
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.data['transaction']['points'], 50)
        self.user.refresh_from_db()
        self.assertEqual(self.user.phone, '+1234567890')


class ConcurrencyTest(TransactionTestCase):
    def setUp(self):
        seed_rules()
        self.user = make_user('concurrent@example.com', 'Concurrent User')
        self.group = create_group(self.user, 'Concurrent Group', 'other')
        self.task = Task.objects.create(name='Concurrent Task', points=150, is_active=True)

    def test_concurrent_task_completion(self):
        membership = GroupMember.objects.get(group=self.group, user=self.user)
        results = []
        errors = []

        def worker():
            try:
                tx = complete_task(self.group, membership, self.task)
                results.append(tx)
            except Exception as e:
                errors.append(e)
            finally:
                db.connections.close_all()

        threads = [threading.Thread(target=worker) for _ in range(5)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        db.connections.close_all()

        # Exactly 1 worker should succeed, and 4 should catch ValueError/IntegrityError
        self.assertEqual(len(results), 1)
        self.assertEqual(len(errors), 4)

        # Points awarded should be exactly +150
        self.group.refresh_from_db()
        self.assertEqual(self.group.cached_total_points, 250)  # 100 from creation + 150 task

